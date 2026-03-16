/** Generate GitHub-style source code viewer HTML from src/ and README.md */

import path from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";

function collectSourceFiles(root) {
  const files = {};
  function scan(dir, prefix = "") {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      if (name === "node_modules" || name.startsWith(".")) continue;
      const rel = prefix ? `${prefix}/${name}` : name;
      const fullPath = path.join(dir, name);
      if (e.isDirectory()) {
        scan(fullPath, rel);
      } else {
        try {
          files[rel] = readFileSync(fullPath, "utf-8");
        } catch {
          // skip binary or unreadable files
        }
      }
    }
  }
  const readmePath = path.join(root, "README.md");
  if (existsSync(readmePath)) {
    try {
      files["README.md"] = readFileSync(readmePath, "utf-8");
    } catch {}
  }
  const srcDir = path.join(root, "src");
  scan(srcDir, "src");
  return files;
}

export function generateSourceViewerHtml(root) {
  const files = collectSourceFiles(root);
  const fileKeys = Object.keys(files).sort();
  const noFilesMsg = "Nenhum arquivo encontrado. | No files found. | No se encontraron archivos.";
  const dataJson = JSON.stringify({ files, fileKeys });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Source Code</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/tsx.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0d1117;color:#e6edf3;min-height:100vh;overflow:hidden}
.header{background:#161b22;border-bottom:1px solid #21262d;padding:12px 16px;font-weight:600;font-size:14px}
.layout{display:flex;height:calc(100vh - 49px)}
.sidebar{width:280px;min-width:200px;background:#161b22;border-right:1px solid #21262d;overflow-y:auto;padding:8px 0}
.sidebar .folder,.sidebar .file{padding:4px 12px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px}
.sidebar .folder:hover,.sidebar .file:hover{background:#21262d}
.sidebar .file{color:#8b949e}
.sidebar .file.active{color:#58a6ff;background:#21262d}
.sidebar .indent{margin-left:16px}
.sidebar .icon{width:16px;text-align:center;user-select:none}
.content{flex:1;overflow:auto;padding:0}
.content-inner{padding:16px;font-family:ui-monospace,monospace;font-size:13px;line-height:1.6}
.content pre{margin:0;background:#0d1117}
.content code{background:transparent;padding:0}
.content .line-num{display:inline-block;width:40px;color:#484f58;text-align:right;margin-right:16px;user-select:none}
.content .line{display:block;min-height:1.6em}
.content .empty{color:#8b949e;padding:24px;font-style:italic}
</style>
</head>
<body>
<div class="header">Source Code</div>
<div class="layout">
<aside class="sidebar" id="tree"></aside>
<main class="content"><pre class="content-inner" id="viewer"><code class="empty">${fileKeys.length ? "Select a file" : noFilesMsg}</code></pre></main>
</div>
<script type="application/json" id="filesData">${dataJson.replace(/<\/script>/gi, "<\\/script>")}</script>
<script>
(function(){
var el=document.getElementById("filesData");
var raw=el.textContent;
var data=JSON.parse(raw);
var files=data.files, keys=data.fileKeys;
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
function selectFile(path){
  document.querySelectorAll(".sidebar .file.active").forEach(function(n){n.classList.remove("active")});
  var node=document.querySelector('.sidebar .file[data-path="'+path.replace(/"/g,"\\"")+'"]');
  if(node){node.classList.add("active");node.scrollIntoView({block:"nearest"})}
  var content=files[path]||"";
  var lines=content.split("\\n");
  var html="";
  lines.forEach(function(line,i){html+="<span class=\\"line-num\\">"+(i+1)+"</span><span class=\\"line\\">"+esc(line)+"\\n</span>"});
  var viewer=document.getElementById("viewer");
  viewer.innerHTML="<code>"+html+"</code>";
  viewer.classList.remove("empty");
  if(typeof hljs!=="undefined"){var c=viewer.querySelector("code");c.className="";hljs.highlightElement(c)}
}
function buildTree(){
  var tree=document.getElementById("tree");
  keys.sort();
  keys.forEach(function(k){
    var div=document.createElement("div");
    div.className="file";
    div.dataset.path=k;
    div.innerHTML="<span class=\\"icon\\">&#128196;</span>"+esc(k);
    div.onclick=function(){selectFile(k)};
    tree.appendChild(div);
  });
}
buildTree();
})();
</script>
</body>
</html>`;
}
