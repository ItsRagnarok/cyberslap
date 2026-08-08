"use strict";

const path = require("path");
const os = require("os");
const express = require("express");
const QRCode = require("qrcode");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3210;
const MIN_HOLD_MS = 350; // cooldown: can't pass again instantly after receiving the bomb
const RECONNECT_GRACE_MS = 120000; // how long we wait for a dropped player before forfeiting the match

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const httpServer = app.listen(PORT, () => {
  console.log("");
  console.log("  CyberSlap: Bomb Toss");
  console.log("  ----------------------");
  console.log("  Pe PC/laptop deschide:  http://localhost:" + PORT + "/tv.html");
  lanAddresses().forEach((ip) => {
    console.log("  Telefoanele se conectează la:  http://" + ip + ":" + PORT + "/controller.html");
  });
  console.log("");
});

const io = new Server(httpServer, { cors: { origin: "*" } });

function lanAddresses() {
  const ifaces = os.networkInterfaces();
  const out = [];
  Object.values(ifaces).forEach((list) => {
    (list || []).forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) out.push(iface.address);
    });
  });
  return out;
}

app.get("/api/host-info", (req, res) => {
  res.json({ port: PORT, addresses: lanAddresses() });
});

app.get("/api/qrcode", async (req, res) => {
  const text = String(req.query.text || "");
  if (!text) return res.status(400).json({ error: "missing text" });
  try {
    const dataUrl = await QRCode.toDataURL(text, { margin: 1, width: 320, color: { dark: "#04050c", light: "#00000000" } });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: "qr generation failed" });
  }
});

/* ======================= GAME STATE ======================= */

/** @type {Map<string, Room>} */
const rooms = new Map();

function makeRoomCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

function makeToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function newRoom(tvSocketId) {
  return {
    code: makeRoomCode(),
    tvSocketId,
    players: [null, null], // index 0 -> slot 1, index 1 -> slot 2
    matchTarget: 5,
    scores: { 1: 0, 2: 0 },
    phase: "lobby", // lobby | playing | paused | roundEnd | victory
    roundNumber: 0,
    holderSlot: null,
    holderSince: 0,
    explodeAt: 0,
    explodeTimer: null,
    pausedRemaining: null,
    disconnectTimer: null,
  };
}

function roomPublicState(room) {
  return {
    code: room.code,
    players: [0, 1].map((i) => {
      const p = room.players[i];
      return p ? { slot: p.slot, name: p.name, connected: p.connected } : null;
    }),
    matchTarget: room.matchTarget,
    scores: room.scores,
    phase: room.phase,
    roundNumber: room.roundNumber,
  };
}

function broadcastRoom(room) {
  io.to(roomChannel(room.code)).emit("room:update", roomPublicState(room));
}
function roomChannel(code) {
  return "room:" + code;
}

function bothConnected(room) {
  return room.players[0] && room.players[0].connected && room.players[1] && room.players[1].connected;
}

function fuseRangeForRound(roundNumber) {
  const shrink = Math.min(roundNumber - 1, 6) * 550;
  const min = Math.max(6500 - shrink, 3200);
  const max = Math.max(12000 - shrink * 1.3, 5200);
  return { min, max };
}

function startRound(room) {
  clearExplodeTimer(room);
  room.roundNumber += 1;
  room.holderSlot = Math.random() < 0.5 ? 1 : 2;
  room.holderSince = Date.now();
  const { min, max } = fuseRangeForRound(room.roundNumber);
  const fuseMs = min + Math.random() * (max - min);
  room.explodeAt = Date.now() + fuseMs;
  room.phase = "playing";
  room.pausedRemaining = null;

  io.to(roomChannel(room.code)).emit("round:start", {
    roundNumber: room.roundNumber,
    holderSlot: room.holderSlot,
    scores: room.scores,
  });

  room.explodeTimer = setTimeout(() => explode(room), fuseMs);
}

function clearExplodeTimer(room) {
  if (room.explodeTimer) {
    clearTimeout(room.explodeTimer);
    room.explodeTimer = null;
  }
}

function explode(room) {
  const loserSlot = room.holderSlot;
  const winnerSlot = loserSlot === 1 ? 2 : 1;
  room.scores[winnerSlot] += 1;
  room.explodeTimer = null;
  room.holderSlot = null;

  const wonMatch = room.scores[winnerSlot] >= room.matchTarget;
  room.phase = wonMatch ? "victory" : "roundEnd";

  io.to(roomChannel(room.code)).emit("round:explode", {
    loserSlot,
    winnerSlot,
    scores: room.scores,
  });

  broadcastRoom(room);

  if (wonMatch) {
    io.to(roomChannel(room.code)).emit("match:victory", { winnerSlot, scores: room.scores });
    return;
  }

  setTimeout(() => {
    if (rooms.get(room.code) === room && room.phase === "roundEnd") startRound(room);
  }, 2200);
}

function pauseRoom(room, reason, disconnectedSlot) {
  if (room.phase !== "playing") return;
  clearExplodeTimer(room);
  room.pausedRemaining = Math.max(room.explodeAt - Date.now(), 300);
  room.phase = "paused";
  io.to(roomChannel(room.code)).emit("room:paused", { reason, disconnectedSlot });
}

function resumeRoomIfReady(room) {
  if (room.phase !== "paused") return;
  if (!bothConnected(room)) return;
  room.explodeAt = Date.now() + room.pausedRemaining;
  room.phase = "playing";
  const remaining = room.pausedRemaining;
  room.pausedRemaining = null;
  io.to(roomChannel(room.code)).emit("room:resumed", { holderSlot: room.holderSlot });
  room.explodeTimer = setTimeout(() => explode(room), remaining);
}

function resetMatch(room) {
  clearExplodeTimer(room);
  room.scores = { 1: 0, 2: 0 };
  room.roundNumber = 0;
  room.holderSlot = null;
  room.phase = "lobby";
  broadcastRoom(room);
}

function forfeit(room, disconnectedSlot) {
  clearExplodeTimer(room);
  const winnerSlot = disconnectedSlot === 1 ? 2 : 1;
  room.phase = "victory";
  io.to(roomChannel(room.code)).emit("match:victory", { winnerSlot, scores: room.scores, forfeited: true });
}

/* ======================= SOCKET HANDLERS ======================= */

io.on("connection", (socket) => {
  let joinedRoomCode = null;
  let joinedSlot = null;

  socket.on("tv:create", (_data, cb) => {
    const room = newRoom(socket.id);
    rooms.set(room.code, room);
    socket.join(roomChannel(room.code));
    joinedRoomCode = room.code;
    cb && cb({ ok: true, code: room.code });
    broadcastRoom(room);
  });

  socket.on("tv:setTarget", ({ code, target }) => {
    const room = rooms.get(code);
    if (!room || room.phase !== "lobby") return;
    const t = parseInt(target, 10);
    if ([3, 5, 7].includes(t)) {
      room.matchTarget = t;
      broadcastRoom(room);
    }
  });

  socket.on("tv:start", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    if (room.phase !== "lobby") return;
    if (!bothConnected(room)) return;
    room.scores = { 1: 0, 2: 0 };
    room.roundNumber = 0;
    startRound(room);
  });

  socket.on("tv:rematch", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    resetMatch(room);
  });

  socket.on("player:join", ({ code, name }, cb) => {
    const room = rooms.get(code);
    if (!room) return cb && cb({ ok: false, error: "Camera nu există. Verifică codul." });
    if (room.phase !== "lobby") return cb && cb({ ok: false, error: "Meciul a început deja." });
    let slotIndex = room.players.findIndex((p) => p === null);
    if (slotIndex === -1) return cb && cb({ ok: false, error: "Camera este plină (2 jucători)." });

    const slot = slotIndex + 1;
    const token = makeToken();
    room.players[slotIndex] = {
      slot,
      socketId: socket.id,
      name: (name || "Jucător " + slot).slice(0, 16),
      connected: true,
      token,
    };
    joinedRoomCode = room.code;
    joinedSlot = slot;
    socket.join(roomChannel(room.code));

    cb && cb({ ok: true, slot, token, matchTarget: room.matchTarget });
    broadcastRoom(room);
  });

  socket.on("player:rejoin", ({ code, token }, cb) => {
    const room = rooms.get(code);
    if (!room) return cb && cb({ ok: false, error: "Camera nu mai există." });
    const player = room.players.find((p) => p && p.token === token);
    if (!player) return cb && cb({ ok: false, error: "Nu te recunosc în camera asta." });

    player.socketId = socket.id;
    player.connected = true;
    joinedRoomCode = room.code;
    joinedSlot = player.slot;
    socket.join(roomChannel(room.code));

    if (room.disconnectTimer) {
      clearTimeout(room.disconnectTimer);
      room.disconnectTimer = null;
    }

    cb && cb({
      ok: true,
      slot: player.slot,
      matchTarget: room.matchTarget,
      phase: room.phase,
      scores: room.scores,
      holderSlot: room.holderSlot,
    });
    broadcastRoom(room);
    resumeRoomIfReady(room);
  });

  socket.on("bomb:pass", ({ code, token }) => {
    const room = rooms.get(code);
    if (!room || room.phase !== "playing") return;
    const player = room.players.find((p) => p && p.token === token);
    if (!player) return;
    if (room.holderSlot !== player.slot) return; // not your bomb
    if (Date.now() - room.holderSince < MIN_HOLD_MS) return; // cooldown

    room.holderSlot = player.slot === 1 ? 2 : 1;
    room.holderSince = Date.now();
    io.to(roomChannel(room.code)).emit("bomb:update", { holderSlot: room.holderSlot });
  });

  socket.on("player:rematchVote", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    resetMatch(room);
  });

  socket.on("disconnect", () => {
    if (!joinedRoomCode) return;
    const room = rooms.get(joinedRoomCode);
    if (!room) return;

    if (room.tvSocketId === socket.id) {
      // TV closed: kill the room after a short grace window (page refresh etc.)
      setTimeout(() => {
        const r = rooms.get(joinedRoomCode);
        if (r && r.tvSocketId === socket.id) rooms.delete(joinedRoomCode);
      }, 15000);
      return;
    }

    if (joinedSlot) {
      const player = room.players[joinedSlot - 1];
      if (player && player.socketId === socket.id) {
        player.connected = false;
        broadcastRoom(room);
        if (room.phase === "playing") pauseRoom(room, "disconnect", joinedSlot);
        room.disconnectTimer = setTimeout(() => {
          if (!player.connected) forfeit(room, joinedSlot);
        }, RECONNECT_GRACE_MS);
      }
    }
  });
});
