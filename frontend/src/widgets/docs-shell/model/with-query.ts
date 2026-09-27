/** Appends the query to the path, leaving the path bare when there are no params. */
export function withQuery(path: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
