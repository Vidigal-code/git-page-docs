"use client";

import Image from "next/image";
import { useState } from "react";
import { FiLock } from "@/shared/ui/fallback-icons";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { ConfirmPopup } from "@/shared/ui/confirm-popup/confirm-popup";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon";

export interface DocsLockTexts {
  tooltip: string;
  popupTitle: string;
  popupDescription: string;
  confirmText: string;
  cancelText: string;
}

interface DocsLockButtonProps {
  icon: ResolvedNavMenuIconConfig;
  texts: DocsLockTexts;
  onConfirmBlock: () => void;
  className?: string;
}

/** Configured react icon, then image, then the vendored lock glyph. */
function renderLockIcon(icon: ResolvedNavMenuIconConfig, alt: string) {
  if (icon.useReactIcon) {
    return (
      <span style={icon.reactIconStyle}>
        <ReactIconByTag
          tag={icon.reactIconTag || "FiLock"}
          style={icon.reactIconStyle}
          fallback={<FiLock aria-hidden />}
        />
      </span>
    );
  }
  if (icon.iconImage) {
    return (
      <Image
        src={icon.iconImage}
        alt={alt}
        width={icon.iconImgWidth}
        height={icon.iconImgHeight}
        unoptimized
      />
    );
  }
  return <FiLock aria-hidden />;
}

/** Menu button that re-locks the documentation (clears the unlock cache) after
 * a confirmation popup. Reuses the shared ConfirmPopup and icon resolver. */
export function DocsLockButton({ icon, texts, onConfirmBlock, className }: Readonly<DocsLockButtonProps>) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsPopupOpen(true)}
        aria-label={texts.tooltip}
        title={texts.tooltip}
      >
        {renderLockIcon(icon, texts.tooltip)}
      </button>
      <ConfirmPopup
        isOpen={isPopupOpen}
        title={texts.popupTitle}
        description={texts.popupDescription}
        confirmText={texts.confirmText}
        cancelText={texts.cancelText}
        isDestructive
        onConfirm={onConfirmBlock}
        onCancel={() => setIsPopupOpen(false)}
      />
    </>
  );
}
