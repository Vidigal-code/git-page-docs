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

interface MenuTreeNodeProps extends Omit<DocsShellMenuTreeProps, "nodes"> {
  node: MenuNode;
}

function MenuTreeNode({ node, keyPrefix, onMenuClick, onToggleNode, isNodeExpanded }: Readonly<MenuTreeNodeProps>): ReactElement {
  const hasChildren = node.children.length > 0;
  const expanded = isNodeExpanded(node.key);
  const childrenId = useId();

  if (node.isSectionHeader === true) {
    return (
      <div className={styles.menuNode}>
        <div className={styles.menuNodeRow}>
          <span className={styles.menuSectionLabel}>{node.title}</span>
        </div>
      </div>
    );
  }

  const activeClass = node.active ? styles.menuButtonActive : "";
  const toggleLabel = `${expanded ? "Collapse submenu" : "Expand submenu"}: ${node.title}`;
  const navigate = () => onMenuClick(node.pathClick, node.ancestorKeys);
  const toggle = () => onToggleNode(node.key);
  const chevron = expanded ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />;

  return (
    <div className={styles.menuNode}>
      <div className={styles.menuNodeRow}>
        {hasChildren && !node.pathClick && (
          <button type="button" className={`${styles.menuButton} ${styles.menuCategoryButton}`} onClick={toggle} aria-expanded={expanded} aria-controls={childrenId}>
            <span>{node.title}</span>
            {chevron}
          </button>
        )}
        {hasChildren && node.pathClick && (
          <div className={`${styles.menuActionContainer} ${activeClass}`}>
            <button type="button" className={styles.menuActionMain} onClick={navigate} aria-current={node.active ? "page" : undefined}>
              {node.title}
            </button>
            <button
              type="button"
              className={styles.menuExpandInline}
              onClick={toggle}
              aria-label={toggleLabel}
              aria-expanded={expanded}
              aria-controls={childrenId}
              title={toggleLabel}
            >
              {chevron}
            </button>
          </div>
        )}
        {!hasChildren && node.pathClick && (
          <button type="button" className={`${styles.menuButton} ${activeClass}`} onClick={navigate} aria-current={node.active ? "page" : undefined}>
            {node.title}
          </button>
        )}
        {!hasChildren && !node.pathClick && <span className={styles.menuGroupLabel}>{node.title}</span>}
      </div>
      {hasChildren && expanded && (
        <div id={childrenId} className={styles.menuChildren}>
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

export function DocsShellMenuTree({ nodes, keyPrefix, onMenuClick, onToggleNode, isNodeExpanded }: Readonly<DocsShellMenuTreeProps>): ReactElement[] {
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
import { useId, type ReactElement } from "react";
