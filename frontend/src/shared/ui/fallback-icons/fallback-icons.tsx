/**
 * Local, typed fallback icons (UI Icon Policy): exact SVG data vendored from
 * `react-icons` so the handful of always-visible control icons never drags a
 * full icon set into the first-load bundle. Configurable icons keep going
 * through the lazy `ReactIconByTag` resolver. Regenerate with
 * tools' gen-fallback-icons script whenever an icon is added.
 */
import type { SVGProps } from "react";

export type FallbackIconProps = SVGProps<SVGSVGElement>;

interface FallbackIconDefinition {
  attrs: Record<string, string>;
  html: string;
}

function createFallbackIcon(definition: FallbackIconDefinition) {
  function FallbackIcon(props: FallbackIconProps) {
    return (
      <svg
        width="1em"
        height="1em"
        xmlns="http://www.w3.org/2000/svg"
        {...definition.attrs}
        {...props}
        dangerouslySetInnerHTML={{ __html: definition.html }}
      />
    );
  }
  return FallbackIcon;
}

export const BsChatDots = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 16 16"},
  html: "<path d=\"M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2\"></path><path d=\"m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2\"></path>",
});

export const BsMoonStarsFill = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 16 16"},
  html: "<path d=\"M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278\"></path><path d=\"M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z\"></path>",
});

export const BsSunFill = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 16 16"},
  html: "<path d=\"M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708\"></path>",
});

export const CiPlay1 = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 24 24"},
  html: "<g id=\"Play_1\"><path d=\"M6.562,21.94a2.5,2.5,0,0,1-2.5-2.5V4.56A2.5,2.5,0,0,1,7.978,2.5L18.855,9.939a2.5,2.5,0,0,1,0,4.12L7.977,21.5A2.5,2.5,0,0,1,6.562,21.94Zm0-18.884a1.494,1.494,0,0,0-.7.177,1.477,1.477,0,0,0-.8,1.327V19.439a1.5,1.5,0,0,0,2.35,1.235l10.877-7.44a1.5,1.5,0,0,0,0-2.471L7.413,3.326A1.491,1.491,0,0,0,6.564,3.056Z\"></path></g>",
});

export const FaBars = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 448 512"},
  html: "<path d=\"M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z\"></path>",
});

export const FaPause = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 448 512"},
  html: "<path d=\"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z\"></path>",
});

export const FiAlertCircle = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"></line>",
});

export const FiChevronDown = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"6 9 12 15 18 9\"></polyline>",
});

export const FiChevronRight = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"9 18 15 12 9 6\"></polyline>",
});

export const FiChevronsLeft = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"11 17 6 12 11 7\"></polyline><polyline points=\"18 17 13 12 18 7\"></polyline>",
});

export const FiChevronsRight = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"13 17 18 12 13 7\"></polyline><polyline points=\"6 17 11 12 6 7\"></polyline>",
});

export const FiCode = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"16 18 22 12 16 6\"></polyline><polyline points=\"8 6 2 12 8 18\"></polyline>",
});

export const FiExternalLink = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path><polyline points=\"15 3 21 3 21 9\"></polyline><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"></line>",
});

export const FiFile = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<path d=\"M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z\"></path><polyline points=\"13 2 13 9 20 9\"></polyline>",
});

export const FiFolder = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"></path>",
});

export const FiSearch = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line>",
});

export const FiLock = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>",
});

export const FiMessageCircle = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<path d=\"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z\"></path>",
});

export const FiX = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>",
});

export const FiRefreshCw = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"23 4 23 10 17 10\"></polyline><polyline points=\"1 20 1 14 7 14\"></polyline><path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"></path>",
});

export const FiRepeat = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"none","strokeWidth":"2","viewBox":"0 0 24 24","strokeLinecap":"round","strokeLinejoin":"round"},
  html: "<polyline points=\"17 1 21 5 17 9\"></polyline><path d=\"M3 11V9a4 4 0 0 1 4-4h14\"></path><polyline points=\"7 23 3 19 7 15\"></polyline><path d=\"M21 13v2a4 4 0 0 1-4 4H3\"></path>",
});

export const IoMdClose = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 512 512"},
  html: "<path d=\"M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z\"></path>",
});

export const MdFullscreen = createFallbackIcon({
  attrs: {"stroke":"currentColor","fill":"currentColor","strokeWidth":"0","viewBox":"0 0 24 24"},
  html: "<path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z\"></path>",
});
