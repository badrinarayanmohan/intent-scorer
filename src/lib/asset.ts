/**
 * Resolves a file in /public against Vite's base URL, so the demo works whether it is
 * served from a domain root (demo.example.com/) or a sub-path (example.com/portfolio/intent-scorer/).
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
