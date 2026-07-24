export function formatLei(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} lei`;
}
