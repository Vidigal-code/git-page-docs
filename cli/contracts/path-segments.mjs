/**
 * Strip every leading and trailing `/` from a user-supplied path segment in a
 * single forward/backward scan. Same result as `.replace(/^\/+|\/+$/g, "")`
 * without the super-linear backtracking that regex incurs on long slash runs.
 *
 * @param {string} value Raw segment such as "/docs/" or "///".
 * @returns {string} The segment without surrounding slashes ("" when only slashes).
 */
export function trimSlashes(value) {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "/") start += 1;
  while (end > start && value[end - 1] === "/") end -= 1;
  return value.slice(start, end);
}
