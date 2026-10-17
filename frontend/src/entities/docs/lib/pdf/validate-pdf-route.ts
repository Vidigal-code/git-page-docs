import type { ContentTypeRouteConfig, PdfRouteConfig } from "../../model/types";

type PdfContentRoute = ContentTypeRouteConfig & { pdf: PdfRouteConfig };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPdfRoute(value: unknown): value is PdfContentRoute {
  if (!isRecord(value) || !Number.isSafeInteger(value.id) || !isRecord(value.pdf)) return false;
  const paths = value.pdf.pathPdf;
  if (!isRecord(paths)) return false;
  const entries = Object.values(paths);
  return entries.length > 0 && entries.every((path) => typeof path === "string");
}

export function getPdfRoutes(value: unknown): PdfContentRoute[] {
  return Array.isArray(value) ? value.filter(isPdfRoute) : [];
}
