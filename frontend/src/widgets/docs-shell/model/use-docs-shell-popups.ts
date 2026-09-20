import { useState } from "react";

export function useDocsShellPopups() {
  const [menuOpen, setMenuOpen] = useState(false);
  // The desktop sidebar floats over the content (overlay), so it starts
  // collapsed: the page loads with the nav rail and the full-width content,
  // and expanding never reflows the page.
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
