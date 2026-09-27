import { FiChevronDown, FiChevronRight } from "@/shared/ui/fallback-icons";
import type { MenuNode } from "../model/menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellMenuTreeProps {
  nodes: MenuNode[];
  keyPrefix: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  onToggleNode: (nodeKey: string) => void;
  isNodeExpanded: (nodeKey: string) => boolean;
}

/** Visual nesting marker: one chevron per level below the root. */
function indentPrefix(level: number): string {
  return level > 0 ? "› ".repeat(level) : "";
}

interface MenuTreeNodeProps extends Omit<DocsShellMenuTreeProps, "nodes"> {
  node: MenuNode;
}

function MenuTreeNode({ node, keyPrefix, onMenuClick, onToggleNode, isNodeExpanded }: Readonly<MenuTreeNodeProps>) {
  const hasChildren = node.children.length > 0;
  const expanded = isNodeExpanded(node.key);

  if (node.isSectionHeader === true) {
    return (
      <div className={styles.menuNode}>
        <div className={styles.menuNodeRow}>
          <span className={styles.menuSectionLabel}>{node.title}</span>
        </div>
      </div>
    );
  }

  const label = `${indentPrefix(node.level)}${node.title}`;
  const activeClass = node.active ? styles.menuButtonActive : "";
  const toggleLabel = expanded ? "Collapse submenu" : "Expand submenu";
  const navigate = () => onMenuClick(node.pathClick, node.ancestorKeys);

  return (
    <div className={styles.menuNode}>
      <div className={styles.menuNodeRow}>
        {hasChildren ? (
          <div className={`${styles.menuActionContainer} ${activeClass}`}>
            <button className={styles.menuActionMain} onClick={navigate}>
              {label}
            </button>
            <button
              className={styles.menuExpandInline}
              onClick={() => onToggleNode(node.key)}
              aria-label={toggleLabel}
              title={toggleLabel}
            >
              {expanded ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
            </button>
          </div>
        ) : (
          <button className={`${styles.menuButton} ${activeClass}`} onClick={navigate}>
            {label}
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
}

export function DocsShellMenuTree({ nodes, keyPrefix, onMenuClick, onToggleNode, isNodeExpanded }: Readonly<DocsShellMenuTreeProps>) {
  return nodes.map((node) => (
    <MenuTreeNode
      key={`${keyPrefix}-${node.key}`}
      node={node}
      keyPrefix={keyPrefix}
      onMenuClick={onMenuClick}
      onToggleNode={onToggleNode}
      isNodeExpanded={isNodeExpanded}
    />
  ));
}
