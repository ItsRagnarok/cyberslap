const log = document.getElementById("log");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const resetBtn = document.getElementById("reset");

function scrollToEnd() {
  log.scrollTop = log.scrollHeight;
}

function addUserBubble(text) {
  const row = document.createElement("div");
  row.className = "row user";
  row.innerHTML = `<div class="bubble"></div>`;
  row.querySelector(".bubble").textContent = text;
  log.appendChild(row);
  scrollToEnd();
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "row assistant";
  row.id = "typing-row";
  row.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
  log.appendChild(row);
  scrollToEnd();
  return row;
}

function addAssistantBubble() {
  const row = document.createElement("div");
  row.className = "row assistant";
  row.innerHTML = `<div class="bubble"></div>`;
  log.appendChild(row);
  scrollToEnd();
  return row.querySelector(".bubble");
}

function addToolChip(name, input) {
  const chip = document.createElement("div");
  chip.className = "tool-chip";
  const inputStr = JSON.stringify(input ?? {});
  chip.innerHTML = `<span class="spinner"></span><span>${name}(${escapeHtml(inputStr)})</span>`;
  log.appendChild(chip);
  scrollToEnd();
  return chip;
}

function markChipDone(chip, result) {
  chip.classList.add("done");
  chip.querySelector(".spinner")?.remove();
  const short = result.length > 60 ? result.slice(0, 60) + "…" : result;
  chip.querySelector("span:last-child").textContent += ` → ${short}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function removeTyping() {
  document.getElementById("typing-row")?.remove();
}

async function send(message) {
  addUserBubble(message);
  input.value = "";
  sendBtn.disabled = true;
  addTyping();

  let assistantBubble = null;
  let gotFirstText = false;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIndex;
      while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);

        const eventMatch = rawEvent.match(/event: (.+)/);
        const dataMatch = rawEvent.match(/data: (.+)/);
        if (!eventMatch || !dataMatch) continue;

        const event = eventMatch[1];
        const data = JSON.parse(dataMatch[1]);

        if (event === "text") {
          if (!gotFirstText) {
            removeTyping();
            assistantBubble = addAssistantBubble();
            gotFirstText = true;
          }
          assistantBubble.textContent += data.delta;
          scrollToEnd();
        } else if (event === "tool_call") {
          removeTyping();
          const chip = addToolChip(data.name, data.input);
          chip.dataset.name = data.name;
          window.__lastChip = chip;
        } else if (event === "tool_result") {
          if (window.__lastChip) markChipDone(window.__lastChip, data.result);
          addTyping();
        } else if (event === "done") {
          removeTyping();
        } else if (event === "error") {
          removeTyping();
          const bubble = addAssistantBubble();
          bubble.textContent = `Eroare: ${data.message}`;
        }
      }
    }
  } catch (err) {
    removeTyping();
    const bubble = addAssistantBubble();
    bubble.textContent = `Eroare de conexiune: ${err.message}`;
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  send(message);
});

resetBtn.addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  log.innerHTML = "";
});
