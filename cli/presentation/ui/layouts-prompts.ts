/** Layout-related prompts: where layouts come from and where they are written. */
import { askSelect, askText } from "./clack";
import { DEFAULT_LAYOUTS_DIR, normalizeLayoutsDir } from "../../contracts/layouts-paths.mjs";

type LayoutsSource = "official" | "local";

/** Ask whether layouts come from the official remote source or a local folder. */
export async function askLayoutsSource(useLocal: boolean): Promise<boolean> {
  const choice = await askSelect<LayoutsSource>(
    "Layout source",
    [
      {
        value: "official",
        label: "Official layouts (remote)",
        hint: "nothing is written to your repository",
      },
      {
        value: "local",
        label: "Local layouts",
        hint: `generated into ${DEFAULT_LAYOUTS_DIR}/`,
      },
    ],
    useLocal ? "local" : "official",
  );
  return choice === "local";
}

/** Ask which folder should hold the generated layouts. */
export async function askLayoutsDir(current: string): Promise<string> {
  const answer = await askText({
    message: "Layouts folder:",
    defaultValue: normalizeLayoutsDir(current),
    validate: (value) => (value.trim() ? undefined : "A folder name is required."),
  });
  return normalizeLayoutsDir(answer);
}
