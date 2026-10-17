const JSDOS_BASE_URL = "https://v8.js-dos.com/latest/";
const DOOM_BUNDLE_URL = "https://v8.js-dos.com/bundles/doom.jsdos";

const COPY = {
  en: {
    title: "DOOM in an HTML container",
    description: "An interactive example with its own title, description and game area. Start DOOM below to load the external js-dos player.",
    play: "Load DOOM",
    loading: "Loading the player. This may take a moment…",
    ready: "DOOM is ready. Click the game area to use the keyboard.",
    error: "The player could not load. Check your connection and try again, or open the official game page.",
    instructions: "Press Enter to select a menu item. Use the arrow keys to move, Ctrl to fire, Space to open doors and Esc to open the game menu.",
    notice: "Internet access is required. The player and game load from js-dos only after you press the button. Keyboard recommended; sound follows your browser settings.",
    source: "Open DOOM on DOS Zone",
    player: "DOOM game area",
  },
  pt: {
    title: "DOOM em um container HTML",
    description: "Um exemplo interativo com título, descrição e área de jogo próprios. Inicie o DOOM abaixo para carregar o player externo js-dos.",
    play: "Jogar DOOM",
    loading: "Carregando o player. Isso pode levar alguns instantes…",
    ready: "DOOM pronto. Clique na área do jogo para usar o teclado.",
    error: "Não foi possível carregar o player. Verifique sua conexão e tente novamente ou abra a página oficial do jogo.",
    instructions: "Pressione Enter para selecionar uma opção. Use as setas para se mover, Ctrl para atirar, Espaço para abrir portas e Esc para abrir o menu do jogo.",
    notice: "É necessário acesso à internet. O player e o jogo são carregados do js-dos somente depois do clique. Teclado recomendado; o som segue as configurações do navegador.",
    source: "Abrir DOOM no DOS Zone",
    player: "Área do jogo DOOM",
  },
  es: {
    title: "DOOM en un contenedor HTML",
    description: "Un ejemplo interactivo con título, descripción y área de juego propios. Inicia DOOM a continuación para cargar el reproductor externo js-dos.",
    play: "Cargar DOOM",
    loading: "Cargando el reproductor. Esto puede tardar un momento…",
    ready: "DOOM está listo. Haz clic en el juego para usar el teclado.",
    error: "No se pudo cargar el reproductor. Comprueba tu conexión e inténtalo de nuevo o abre la página oficial del juego.",
    instructions: "Pulsa Enter para seleccionar una opción. Usa las flechas para moverte, Ctrl para disparar, Espacio para abrir puertas y Esc para abrir el menú del juego.",
    notice: "Se necesita conexión a internet. El reproductor y el juego se cargan desde js-dos solo después de pulsar el botón. Se recomienda teclado; el sonido sigue la configuración del navegador.",
    source: "Abrir DOOM en DOS Zone",
    player: "Área del juego DOOM",
  },
};

const STYLE = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #101018; color: #f4f4f7; }
  #doom-example { max-width: 1100px; margin: auto; padding: clamp(20px, 4vw, 40px); font-family: system-ui, sans-serif; line-height: 1.6; }
  #doom-example h1 { margin: 0 0 12px; color: #fff; font-size: clamp(26px, 4vw, 38px); line-height: 1.2; font-weight: 750; }
  #doom-example p { margin: 12px 0; }
  #doom-example output { display: block; margin: 12px 0; }
  #doom-example .description { max-width: 75ch; color: #d7d7e4; }
  #doom-example .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 24px 0 12px; }
  #doom-example button { border: 1px solid #fc946d; border-radius: 10px; background: #f69c76; color: #20130e; padding: 12px 22px; font: inherit; font-weight: 700; cursor: pointer; }
  #doom-example button:hover { background: #ffb494; }
  #doom-example button:disabled { cursor: wait; opacity: 0.7; }
  #doom-example a { color: #b8caff; text-decoration: underline; text-underline-offset: 3px; }
  #doom-example :focus-visible { outline: 3px solid #b8caff; outline-offset: 4px; }
  #doom-example .notice { color: #b9b9cb; font-size: 0.9rem; }
  #doom-example #doom-player { width: 100%; height: clamp(360px, 65vw, 640px); margin-top: 20px; border: 1px solid #383847; border-radius: 12px; overflow: hidden; background: #000; }
  #doom-example [hidden] { display: none; }
`;

const SCRIPT = `
(() => {
  const button = document.getElementById("doom-load");
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

  async function startGame() {
    button.disabled = true;
    status.textContent = status.dataset.loading;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = baseUrl + "js-dos.css";
    const script = document.createElement("script");
    script.src = baseUrl + "js-dos.js";
    try {
      await Promise.all([loadResource(stylesheet), loadResource(script)]);
      if (typeof window.Dos !== "function") throw new Error("Player API is unavailable");
      player.hidden = false;
      game = window.Dos(player, {
        url: bundleUrl,
        pathPrefix: baseUrl + "emulators/",
        autoStart: true,
        mouseCapture: false,
        theme: "dark",
        lang: "en",
        onEvent(event) {
          if (event === "ci-ready") status.textContent = status.dataset.ready;
        },
      });
      button.hidden = true;
      player.focus();
    } catch (error) {
      stylesheet.remove();
      script.remove();
      status.textContent = status.dataset.error;
      button.disabled = false;
      console.error("DOOM player failed to load", error);
    }
  }

  button.addEventListener("click", startGame);
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
    <h1>${copy.title}</h1>
    <p class="description">${copy.description}</p>
    <div class="controls">
      <button id="doom-load" type="button">${copy.play}</button>
      <a href="https://dos.zone/doom-dec-1993/" target="_blank" rel="noopener noreferrer">${copy.source}</a>
    </div>
    <output id="doom-status" data-loading="${copy.loading}" data-ready="${copy.ready}" data-error="${copy.error}"></output>
    <div id="doom-player" tabindex="-1" aria-label="${copy.player}" hidden></div>
    <p>${copy.instructions}</p>
    <p class="notice">${copy.notice}</p>
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
