// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DocsShellSidebar } from "@/widgets/docs-shell/ui/docs-shell-sidebar";
import { useBuildNavMenuConfig } from "@/widgets/docs-shell/model/use-build-nav-menu-config";
import { makeConfig } from "../widgets-model/fixtures";

afterEach(cleanup);
const noAction = () => undefined;
function SidebarWithoutChat(): React.JSX.Element {
  const navMenuConfig = useBuildNavMenuConfig(makeConfig(), "dark", "en");
  return <DocsShellSidebar siteName="Documentation" useReactHeaderIcon={false} reactHeaderIconTag={undefined} headerReactIconStyle={{}} activeLayoutMode="dark" iconImage={undefined} iconImgWidth={24} iconImgHeight={24} menuNodes={[]} menuCloseLabel="Close navigation" onMenuClick={noAction} onToggleNode={noAction} isNodeExpanded={() => false} onCollapseSidebar={noAction} blockMenuOnNav={false} setBlockMenuOnNav={noAction} navMenuConfig={navMenuConfig} onOpenAiChat={noAction} aiChatIconConfig={undefined} />;
}
it("renders navigation without a chat launcher when chat is disabled", () => {
  render(<SidebarWithoutChat />);
  expect(screen.getByText("Documentation")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Close navigation" })).not.toBeNull();
  expect(screen.queryByTestId("ai-chat-open")).toBeNull();
});
