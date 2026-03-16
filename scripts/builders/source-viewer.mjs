/** Generate GitHub-style source code viewer HTML from src/ and README.md */

import path from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";

function buildTreeFromKeys(fileKeys) {
  const root = {};
  for (const key of fileKeys) {
    const parts = key.split("/");
    let curr = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      if (!curr[part]) curr[part] = isLast ? { path: key } : {};
      if (isLast) curr[part].path = key;
      else curr = curr[part];
    }
  }
  return root;
}

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
  const tree = buildTreeFromKeys(fileKeys);
  const noFilesMsg = "Nenhum arquivo encontrado. | No files found. | No se encontraron archivos.";
  const dataJson = JSON.stringify({ files, fileKeys, tree });
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js"></script>
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
.sidebar .folder .icon{color:#79c0ff}
.content{flex:1;overflow:auto;padding:0}
.content .btn-group{display:flex;gap:8px;margin-bottom:12px}
.content .btn{padding:6px 12px;border:1px solid #21262d;border-radius:6px;background:#21262d;color:#e6edf3;cursor:pointer;font-size:12px}
.content .btn.active{background:#238636;border-color:#238636}
.content .btn:hover{background:#30363d}
.content .md-preview{padding:16px;line-height:1.6}
.content .md-preview h1,.content .md-preview h2,.content .md-preview h3{margin-top:1em;margin-bottom:0.5em}
.content .md-preview code{background:#21262d;padding:2px 6px;border-radius:4px;font-size:0.9em}
.content .md-preview pre{background:#21262d;padding:12px;overflow-x:auto;border-radius:6px}
.content-inner{padding:16px;font-family:ui-monospace,monospace;font-size:13px;line-height:1.6}
.content pre{margin:0;background:#0d1117}
.content code{background:transparent;padding:0}
.content .line-num{display:inline-block;width:40px;color:#484f58;text-align:right;margin-right:16px;user-select:none}
.content .line{display:block;min-height:1.6em}
.content .empty{color:#8b949e;padding:24px;font-style:italic}
@media(max-width:767px){
  body{overflow:auto;-webkit-overflow-scrolling:touch}
  .layout{flex-direction:column;height:auto;min-height:calc(100vh - 49px)}
  .sidebar{width:100%;max-width:100%;min-width:unset;max-height:220px;overflow-y:auto;overflow-x:auto;flex-shrink:0}
  .content{min-height:400px;overflow-x:auto;overflow-y:auto}
}
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
var files=data.files, keys=data.fileKeys, treeData=data.tree||{};
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
var viewMode="code";
function setViewMode(mode){viewMode=mode}
function selectFile(path){
  document.querySelectorAll(".sidebar .file.active").forEach(function(n){n.classList.remove("active")});
  document.querySelectorAll(".sidebar .folder.active").forEach(function(n){n.classList.remove("active")});
  var node=document.querySelector('.sidebar .file[data-path="'+path.replace(/"/g,'\\"')+'"]');
  if(node){node.classList.add("active");node.scrollIntoView({block:"nearest"})}
  var content=files[path]||"";
  var isReadme=path.toLowerCase()==="readme.md";
  var viewer=document.getElementById("viewer");
  if(isReadme){
    var btnHtml='<div class="btn-group"><button class="btn'+(viewMode==='preview'?' active':'')+'" data-mode="preview">Preview</button><button class="btn'+(viewMode==='code'?' active':'')+'" data-mode="code">Code</button></div>';
    if(viewMode==="preview"&&typeof marked!=="undefined"){
      viewer.innerHTML=btnHtml+'<div class="md-preview">'+marked.parse(content||"")+'</div>';
    }else{
      var lines=(content||"").split("\\n");
      var lineHtml="";
      lines.forEach(function(line,i){lineHtml+="<span class=\\"line-num\\">"+(i+1)+"</span><span class=\\"line\\">"+esc(line)+"\\n</span>"});
      viewer.innerHTML=btnHtml+"<code>"+lineHtml+"</code>";
      if(typeof hljs!=="undefined"){var c=viewer.querySelector("code");if(c){c.className="language-markdown";hljs.highlightElement(c)}}
    }
    viewer.classList.remove("empty");
    viewer.querySelectorAll(".btn").forEach(function(btn){
      btn.onclick=function(){
        setViewMode(btn.dataset.mode);
        selectFile(path);
      };
    });
    return;
  }
  var lines=content.split("\\n");
  var html="";
  lines.forEach(function(line,i){html+="<span class=\\"line-num\\">"+(i+1)+"</span><span class=\\"line\\">"+esc(line)+"\\n</span>"});
  viewer.innerHTML="<code>"+html+"</code>";
  viewer.classList.remove("empty");
  if(typeof hljs!=="undefined"){var c=viewer.querySelector("code");c.className="";hljs.highlightElement(c)}
}
function renderTree(node, parentEl, indent){
  indent=indent||0;
  var keys=Object.keys(node).sort();
  for(var i=0;i<keys.length;i++){
    var k=keys[i];
    var v=node[k];
    if(k==="path")continue;
    if(v&&typeof v==="object"&&v.path){
      var div=document.createElement("div");
      div.className="file";
      div.dataset.path=v.path;
      div.style.marginLeft=(indent*16)+"px";
      div.innerHTML="<span class=\\"icon\\">&#128196;</span>"+esc(k);
      div.onclick=function(p){return function(){selectFile(p)}}(v.path);
      parentEl.appendChild(div);
    }else if(v&&typeof v==="object"){
      var folderDiv=document.createElement("div");
      folderDiv.className="folder";
      folderDiv.style.marginLeft=(indent*16)+"px";
      folderDiv.innerHTML="<span class=\\"icon\\">&#128193;</span>"+esc(k);
      folderDiv.onclick=function(e){if(e.target.closest(".file"))return; var next=e.currentTarget.querySelector(".children");if(next)next.style.display=next.style.display==="none"?"block":"none"};
      var children=document.createElement("div");
      children.className="children";
      parentEl.appendChild(folderDiv);
      parentEl.appendChild(children);
      renderTree(v,children,indent+1);
    }
  }
}
function buildTree(){
  var tree=document.getElementById("tree");
  if(Object.keys(treeData).length>0){
    renderTree(treeData,tree,0);
  }else{
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
}
buildTree();
})();
</script>
</body>
</html>`;
}
