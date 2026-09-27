/**
 * @file icon-config-fields.ts
 * @description The nine optional `Icon<Name>*` fields every configurable icon
 * slot exposes in the site config: a light/dark image, the react-icon toggle
 * with its tag, per-mode colors and size, and the image dimensions.
 *
 * `Name` may be a union: template literal keys distribute over it, so
 * `IconConfigFields<"SidebarCollapse" | "SidebarExpand">` declares both groups.
 */
export type IconConfigFields<Name extends string> = {
  [K in
    | `Icon${Name}LightImg`
    | `Icon${Name}DarkImg`
    | `Icon${Name}ReactIconesTag`
    | `Icon${Name}ReactIconesTagColorDark`
    | `Icon${Name}ReactIconesTagColorLight`
    | `Icon${Name}ReactIconesTagSize`]?: string;
} & {
  [K in `Icon${Name}ReactIcones`]?: boolean;
} & {
  [K in `Icon${Name}ImgWidth` | `Icon${Name}ImgHeight`]?: string | number;
};
