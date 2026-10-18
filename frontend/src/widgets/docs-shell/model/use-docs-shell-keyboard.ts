import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useDocsShellKeyboard(options: {
  activeNavigation: boolean;
  focusModeOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  setFocusModeOpen: (value: boolean) => void;
  setQuickNavOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    activeNavigation,
    focusModeOpen,
    setMenuOpen,
    setFocusModeOpen,
    setQuickNavOpen,
  } = options;

  useEffect(() => {
    if (!activeNavigation) return;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setFocusModeOpen(false);
        setQuickNavOpen((prev) => !prev);
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
    focusModeOpen,
    setMenuOpen,
    setFocusModeOpen,
    setQuickNavOpen,
  ]);
}
