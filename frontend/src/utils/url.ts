function segmentToKebab(str: string): string {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

export function normalizeMenuUrl(url: string | null | undefined): string {
  if (!url) return "#";
  return url
    .split("/")
    .map((segment) => (segment ? segmentToKebab(segment) : segment))
    .join("/");
}
