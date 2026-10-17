import { useCallback, useEffect, useRef, useState } from "react";

interface PdfDocument {
  url: string;
}

interface PdfRequest {
  controller: AbortController;
  promise: Promise<PdfDocument | undefined>;
}

type PdfLoadState = "idle" | "loading" | "ready" | "error";
interface PdfResource {
  state: PdfLoadState;
  document: PdfDocument | undefined;
  load: () => Promise<PdfDocument | undefined>;
}
const PDF_SIGNATURE = "%PDF-";
const PDF_MIME_TYPE = "application/pdf";

async function fetchPdfBlob(source: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetch(source, { signal });
  if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
  const bytes = await response.arrayBuffer();
  const signature = new TextDecoder().decode(bytes.slice(0, PDF_SIGNATURE.length));
  if (signature !== PDF_SIGNATURE) throw new Error("The response is not a PDF document.");
  return new Blob([bytes], { type: PDF_MIME_TYPE });
}

export function usePdfDocument(source: string, options: { previewEnabled: boolean }): PdfResource {
  const [state, setState] = useState<PdfLoadState>("idle");
  const [document, setDocument] = useState<PdfDocument>();
  const cachedDocument = useRef<PdfDocument | undefined>(undefined);
  const request = useRef<PdfRequest | undefined>(undefined);

  const load = useCallback((): Promise<PdfDocument | undefined> => {
    if (cachedDocument.current) return Promise.resolve(cachedDocument.current);
    if (request.current) return request.current.promise;
    const controller = new AbortController();
    setState("loading");
    const promise = fetchPdfBlob(source, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return undefined;
        const loaded = { url: URL.createObjectURL(blob) };
        cachedDocument.current = loaded;
        setDocument(loaded);
        setState("ready");
        return loaded;
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("error");
        return undefined;
      })
      .finally(() => {
        if (request.current?.controller === controller) request.current = undefined;
      });
    request.current = { controller, promise };
    return promise;
  }, [source]);

  useEffect(() => {
    if (options.previewEnabled) void load();
    return () => {
      request.current?.controller.abort();
      request.current = undefined;
      if (cachedDocument.current) URL.revokeObjectURL(cachedDocument.current.url);
      cachedDocument.current = undefined;
    };
  }, [load, options.previewEnabled]);

  return { state, document, load };
}
