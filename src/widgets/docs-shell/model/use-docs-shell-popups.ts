import { useState } from "react";

export function useDocsShellPopups() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [versionLinksPopupOpen, setVersionLinksPopupOpen] = useState(false);
  const [infoPopupOpen, setInfoPopupOpen] = useState(false);

  return {
    menuOpen,
    setMenuOpen,
    sidebarOpen,
    setSidebarOpen,
    versionLinksPopupOpen,
    setVersionLinksPopupOpen,
    infoPopupOpen,
    setInfoPopupOpen,
  };
}
