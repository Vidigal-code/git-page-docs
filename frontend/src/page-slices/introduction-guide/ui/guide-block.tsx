import type { GuideBlock as GuideBlockModel } from "../model/types";
import styles from "./guide-content.module.css";

/** Renders a single content block. One small component per block type keeps each render path trivial. */
export function GuideBlock({ block }: { block: GuideBlockModel }) {
  switch (block.type) {
    case "paragraph":
      return <p className={styles.paragraph}>{block.text}</p>;
    case "list":
      return (
        <ul className={styles.list}>
          {(block.items ?? []).map((item) => (
            <li key={item} className={styles.listItem}>
              <code className={styles.inlineCode}>{item}</code>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className={styles.code}>
          <code>{block.code}</code>
        </pre>
      );
    case "callout":
      return (
        <aside className={`${styles.callout} ${block.tone === "warn" ? styles.calloutWarn : styles.calloutInfo}`}>
          {block.text}
        </aside>
      );
    case "table":
      return <GuideTable headers={block.headers ?? []} rows={block.rows ?? []} />;
    default:
      return null;
  }
}

function GuideTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[0] ?? rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>
                  {cellIndex === 0 ? <code className={styles.inlineCode}>{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
