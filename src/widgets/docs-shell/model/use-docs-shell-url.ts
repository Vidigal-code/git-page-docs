import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toFullPath } from "@/shared/lib/base-path";

export function useDocsShellUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCurrentSearchParams = useCallback((): URLSearchParams => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(searchParams?.toString() ?? "");
  }, [searchParams]);

  const replaceUrlWithoutNavigation = useCallback(
    (nextPathname: string, params: URLSearchParams): void => {
      if (typeof window !== "undefined") {
        const appPath = nextPathname || pathname || "/";
        const qs = params.toString();
        const nextUrl = qs ? `${toFullPath(appPath)}?${qs}` : toFullPath(appPath);
        window.history.replaceState({}, "", nextUrl);
        return;
      }
      const normalizedPath = nextPathname || pathname || "/";
      const qs = params.toString();
      router.replace(qs ? `${normalizedPath}?${qs}` : normalizedPath);
    },
    [pathname, router],
  );

  return { getCurrentSearchParams, replaceUrlWithoutNavigation, pathname, searchParams, router };
}
