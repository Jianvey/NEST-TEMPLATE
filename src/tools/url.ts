const ABSOLUTE_URL = /^https?:\/\//i

export function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) return path
  if (!path) return baseUrl
  if (ABSOLUTE_URL.test(path)) return path

  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}
