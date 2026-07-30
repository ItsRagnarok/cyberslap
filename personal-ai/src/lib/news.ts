const FEEDS = [
  "https://news.google.com/rss?hl=ro&gl=RO&ceid=RO:ro",
  "https://feeds.reuters.com/reuters/businessNews",
];

export type Headline = { title: string; source?: string };

/** Best-effort headline pull for context — never blocks the caller on failure. */
export async function fetchHeadlines(limit = 8): Promise<Headline[]> {
  const headlines: Headline[] = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const xml = await res.text();
      const titles = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g)]
        .map((m) => m[1].trim())
        .filter((t) => t && !t.toLowerCase().includes("google news"));
      for (const title of titles.slice(1, 6)) {
        headlines.push({ title });
        if (headlines.length >= limit) return headlines;
      }
    } catch {
      // ignore a failing feed, continue with others
    }
  }
  return headlines;
}
