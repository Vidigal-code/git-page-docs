const JSDOS_BASE_URL = "https://v8.js-dos.com/latest/";
const DOOM_BUNDLE_URL = "https://v8.js-dos.com/bundles/doom.jsdos";

const COPY = {
  en: {
    title: "DOOM in an HTML container",
    description: "Play DOOM in the embedded js-dos player.",
    error: "The player could not load. Check your connection and reload this page to try again.",
    player: "DOOM game area",
  },
  pt: {
    title: "DOOM em um container HTML",
    description: "Jogue DOOM no player js-dos incorporado.",
    error: "Não foi possível carregar o player. Verifique sua conexão e recarregue esta página para tentar novamente.",
    player: "Área do jogo DOOM",
  },
  es: {
    title: "DOOM en un contenedor HTML",
    description: "Juega a DOOM en el reproductor js-dos integrado.",
    error: "No se pudo cargar el reproductor. Comprueba tu conexión y recarga esta página para intentarlo de nuevo.",
    player: "Área del juego DOOM",
  },
};

const STYLE = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body, #doom-example, #doom-player { width: 100%; height: 100%; margin: 0; }
  body { background: #000; color: #f4f4f7; }
  #doom-example { position: relative; font-family: system-ui, sans-serif; }
  #doom-player { min-height: 360px; }
  #doom-status { position: absolute; inset: 0; z-index: 1; padding: 24px; background: #101018; line-height: 1.6; }
  #doom-example :focus-visible { outline: 3px solid #b8caff; outline-offset: 4px; }
  #doom-example [hidden] { display: none; }
`;

const SCRIPT = `
(() => {
  const status = document.getElementById("doom-status");
  const player = document.getElementById("doom-player");
  const baseUrl = ${JSON.stringify(JSDOS_BASE_URL)};
  const bundleUrl = ${JSON.stringify(DOOM_BUNDLE_URL)};
  let game;

  function loadResource(element) {
    return new Promise((resolve, reject) => {
      element.addEventListener("load", resolve, { once: true });
      element.addEventListener("error", () => reject(new Error("Player resource could not load")), { once: true });
      document.head.append(element);
    });
  }

  async function loadPlayer() {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = baseUrl + "js-dos.css";
    const script = document.createElement("script");
    script.src = baseUrl + "js-dos.js";
    try {
      await Promise.all([loadResource(stylesheet), loadResource(script)]);
      if (typeof window.Dos !== "function") throw new Error("Player API is unavailable");
      game = window.Dos(player, {
        url: bundleUrl,
        pathPrefix: baseUrl + "emulators/",
        autoStart: false,
        kiosk: true,
        mouseCapture: false,
        theme: "dark",
        lang: "en",
      });
      game.setNoCloud(true);
    } catch (error) {
      stylesheet.remove();
      script.remove();
      status.textContent = status.dataset.error;
      status.hidden = false;
      console.error("DOOM player failed to load", error);
    }
  }

  void loadPlayer();
  window.addEventListener("pagehide", () => {
    game?.stop().catch((error) => console.error("DOOM player failed to stop", error));
  }, { once: true });
})();
`;

function buildDoomHtml(language) {
  const copy = COPY[language];
  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${copy.description}">
  <title>${copy.title}</title>
  <style>${STYLE}</style>
</head>
<body>
  <main id="doom-example">
    <output id="doom-status" data-error="${copy.error}" hidden></output>
    <div id="doom-player" tabindex="-1" aria-label="${copy.player}"></div>
  </main>
  <script>${SCRIPT}</script>
</body>
</html>
`;
}

export const HTML_DOOM = {
  en: buildDoomHtml("en"),
  pt: buildDoomHtml("pt"),
  es: buildDoomHtml("es"),
};
