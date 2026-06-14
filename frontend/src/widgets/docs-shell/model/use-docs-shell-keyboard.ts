import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useDocsShellKeyboard(options: {
  activeNavigation: boolean;
  quickNavOpen: boolean;
  focusModeOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  setFocusModeOpen: (value: boolean) => void;
  setQuickNavOpen: Dispatch<SetStateAction<boolean>>;
  setQuickNavQuery: (value: string) => void;
}) {
  const {
    activeNavigation,
    quickNavOpen,
    focusModeOpen,
    setMenuOpen,
    setFocusModeOpen,
    setQuickNavOpen,
    setQuickNavQuery,
  } = options;

  useEffect(() => {
    if (!activeNavigation) return;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setFocusModeOpen(false);
        setQuickNavOpen((prev) => !prev);
        if (!quickNavOpen) {
          setQuickNavQuery("");
        }
      }

      if (event.key === "Escape" && focusModeOpen) {
        event.preventDefault();
        setFocusModeOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeNavigation,
    quickNavOpen,
    focusModeOpen,
    setMenuOpen,
    setFocusModeOpen,
    setQuickNavOpen,
    setQuickNavQuery,
  ]);
}
