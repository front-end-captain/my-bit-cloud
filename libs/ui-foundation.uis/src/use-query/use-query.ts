import { useLocation } from "./use-location";

/**
 * hook for using a query string.
 */
export function useQuery() {
  const { search } = useLocation() || { search: "/" };
  return new URLSearchParams(search);
}
