// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { NativeSelect } from "@/shared/ui/native-select";

afterEach(cleanup);

it("preserves native labels, selection and form submission with a decorative arrow", () => {
  const onChange = vi.fn();
  render(<form aria-label="Preferences">
    <label htmlFor="voice">Browser voice</label>
    <NativeSelect id="voice" name="voice" defaultValue="en" onChange={onChange}>
      <option value="en">English</option><option value="pt">Português</option>
    </NativeSelect>
  </form>);
  const voice = screen.getByRole("combobox", { name: "Browser voice" });
  fireEvent.change(voice, { target: { value: "pt" } });
  expect(onChange).toHaveBeenCalledOnce();
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("voice")).toBe("pt");
  expect(screen.queryByRole("img")).toBeNull();
});
