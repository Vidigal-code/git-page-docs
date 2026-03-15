import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import type { MenuNode } from "../model/menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellMenuTreeProps {
  nodes: MenuNode[];
  keyPrefix: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  onToggleNode: (nodeKey: string) => void;
  isNodeExpanded: (nodeKey: string) => boolean;
}

export function DocsShellMenuTree({ nodes, keyPrefix, onMenuClick, onToggleNode, isNodeExpanded }: DocsShellMenuTreeProps) {
  return nodes.map((node) => {
    const hasChildren = node.children.length > 0;
    const expanded = isNodeExpanded(node.key);
    return (
      <div key={`${keyPrefix}-${node.key}`} className={styles.menuNode}>
        <div className={styles.menuNodeRow}>
          {hasChildren ? (
            <div className={`${styles.menuActionContainer} ${node.active ? styles.menuButtonActive : ""}`}>
              <button className={styles.menuActionMain} onClick={() => onMenuClick(node.pathClick, node.ancestorKeys)}>
                {`${node.level > 0 ? "› ".repeat(node.level) : ""}${node.title}`}
              </button>
              <button
                className={styles.menuExpandInline}
                onClick={() => onToggleNode(node.key)}
                aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
                title={expanded ? "Collapse submenu" : "Expand submenu"}
              >
                {expanded ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
              </button>
            </div>
          ) : (
            <button className={`${styles.menuButton} ${node.active ? styles.menuButtonActive : ""}`} onClick={() => onMenuClick(node.pathClick, node.ancestorKeys)}>
              {`${node.level > 0 ? "› ".repeat(node.level) : ""}${node.title}`}
            </button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className={styles.menuChildren}>
            <DocsShellMenuTree
              nodes={node.children}
              keyPrefix={keyPrefix}
              onMenuClick={onMenuClick}
              onToggleNode={onToggleNode}
              isNodeExpanded={isNodeExpanded}
            />
          </div>
        )}
      </div>
    );
  });
}
