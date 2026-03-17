/** Generate GitHub-style source code viewer HTML from src/, cli/, and root config files */

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

const ROOT_FILES = ["README.md", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", ".eslintrc.json"];

function collectSourceFiles(projectRoot) {
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
          const content = readFileSync(fullPath, "utf-8");
          files[rel] = content;
        } catch {
          /* skip binary or unreadable */
        }
      }
    }
  }
  for (const f of ROOT_FILES) {
    const p = path.join(projectRoot, f);
    if (existsSync(p)) {
      try {
        files[f] = readFileSync(p, "utf-8");
      } catch {}
    }
  }
  const srcDir = path.join(projectRoot, "src");
  const cliDir = path.join(projectRoot, "cli");
  if (existsSync(srcDir)) scan(srcDir, "src");
  if (existsSync(cliDir)) scan(cliDir, "cli");
  return files;
}

/** GitHub-like file viewer: breadcrumb bar, file header, table layout, dark theme */
export function generateSourceViewerHtml(root) {
  const files = collectSourceFiles(root);
  const fileKeys = Object.keys(files).sort();
  const tree = buildTreeFromKeys(fileKeys);
  const noFilesMsg = "No files found.";
  const dataJson = JSON.stringify({ files, fileKeys, tree });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Source code - GitHub</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/tsx.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/css.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js"></script>
<style>
/* GitHub dark theme - variables */
:root{
  --github-bg: #0d1117;
  --github-bg-secondary: #161b22;
  --github-bg-tertiary: #21262d;
  --github-border: #30363d;
  --github-border-muted: #21262d;
  --github-fg: #e6edf3;
  --github-fg-muted: #8b949e;
  --github-accent: #58a6ff;
  --github-accent-soft: #79c0ff;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:var(--github-bg);color:var(--github-fg);min-height:100vh;font-size:14px;line-height:1.5}

/* Top bar - GitHub style */
.top-bar{background:var(--github-bg-secondary);border-bottom:1px solid var(--github-border-muted);padding:8px 16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.top-bar .crumb{color:var(--github-fg-muted);text-decoration:none}
.top-bar .crumb:hover{color:var(--github-accent)}
.top-bar .crumb-sep{color:var(--github-fg-muted);user-select:none}
.top-bar .file-name{color:var(--github-fg);font-weight:600}

/* Layout */
.layout{display:flex;height:calc(100vh - 45px)}

/* Sidebar - GitHub file tree */
.sidebar{width:260px;min-width:200px;background:var(--github-bg-secondary);border-right:1px solid var(--github-border-muted);overflow-y:auto;padding:8px 0;flex-shrink:0}
.sidebar .folder,.sidebar .file{padding:4px 12px 4px 8px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;border-radius:6px;margin:0 8px}
.sidebar .folder:hover,.sidebar .file:hover{background:var(--github-bg-tertiary)}
.sidebar .file{color:var(--github-fg-muted)}
.sidebar .file.active{color:var(--github-accent);background:var(--github-bg-tertiary)}
.sidebar .icon{width:16px;text-align:center;flex-shrink:0}
.sidebar .icon svg{vertical-align:middle}
.sidebar .folder .icon{color:var(--github-accent-soft)}
.sidebar .chevron{width:16px;transition:transform .15s;flex-shrink:0}
.sidebar .folder.collapsed .chevron{transform:rotate(-90deg)}
.sidebar .children{margin-left:4px}
.sidebar .children.hidden{display:none}
.sidebar .search-wrap{padding:8px;border-bottom:1px solid var(--github-border-muted)}
.sidebar .search-input{width:100%;padding:6px 10px;font-size:12px;border:1px solid var(--github-border);border-radius:6px;background:var(--github-bg);color:var(--github-fg);outline:none}
.sidebar .search-input:focus{border-color:var(--github-accent)}
.sidebar .search-input::placeholder{color:var(--github-fg-muted)}
.sidebar .tree-actions{display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--github-border-muted)}
.sidebar .tree-btn{padding:4px 8px;font-size:11px;border:1px solid var(--github-border);border-radius:4px;background:var(--github-bg-tertiary);color:var(--github-fg-muted);cursor:pointer}
.sidebar .tree-btn:hover{color:var(--github-fg);background:var(--github-border)}

/* Content - GitHub file view */
.content{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--github-bg)}
.content .file-header{background:var(--github-bg-secondary);border-bottom:1px solid var(--github-border-muted);padding:8px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.content .file-header .file-path{font-weight:600;color:var(--github-fg)}
.content .file-header .copy-btn{padding:4px 12px;font-size:12px;border:1px solid var(--github-border);border-radius:6px;background:var(--github-bg-tertiary);color:var(--github-fg);cursor:pointer}
.content .file-header .copy-btn:hover{background:var(--github-border);border-color:var(--github-fg-muted)}
.content .code-wrap{flex:1;overflow:auto}
.content .code-table{width:100%;border-collapse:collapse;font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;font-size:12px;line-height:1.45}
.content .code-table td{vertical-align:top;padding:0}
.content .line-nums{padding:16px 0;text-align:right;user-select:none;color:var(--github-fg-muted);background:var(--github-bg-secondary);border-right:1px solid var(--github-border-muted);width:1%;min-width:50px}
.content .line-nums span{display:block;padding:0 16px}
.content .line-code{padding:16px 0;padding-left:16px}
.content .line-code .line{display:block;min-height:1.45em;white-space:pre}
.content .empty{color:var(--github-fg-muted);padding:24px;font-style:italic}
.content .md-preview{padding:24px;line-height:1.6}
.content .md-preview h1,.content .md-preview h2,.content .md-preview h3{margin-top:1em;margin-bottom:0.5em;font-weight:600}
.content .md-preview code{background:var(--github-bg-tertiary);padding:2px 6px;border-radius:4px;font-size:0.9em}
.content .md-preview pre{background:var(--github-bg-tertiary);padding:16px;overflow-x:auto;border-radius:6px;font-size:13px}
.content .btn-group{display:flex;gap:8px;margin-bottom:16px}
.content .btn{padding:6px 12px;border:1px solid var(--github-border);border-radius:6px;background:var(--github-bg-tertiary);color:var(--github-fg);cursor:pointer;font-size:12px}
.content .btn.active{background:var(--github-accent);border-color:var(--github-accent);color:#fff}
.content .btn:hover{background:var(--github-border)}

@media(max-width:767px){
  .layout{flex-direction:column;height:auto;min-height:100vh}
  .sidebar{width:100%;max-height:200px;border-right:none;border-bottom:1px solid var(--github-border-muted)}
  .content .code-wrap{min-height:400px}
}
</style>
</head>
<body>
<div class="top-bar">
  <span class="crumb">source</span>
  <span class="crumb-sep">/</span>
  <span class="file-name" id="breadcrumbFile">-</span>
</div>
<div class="layout">
<aside class="sidebar">
  <div class="search-wrap"><input type="text" class="search-input" id="searchInput" placeholder="Filter files..." autocomplete="off"/></div>
  <div class="tree-actions"><button class="tree-btn" id="expandAll">Expand all</button><button class="tree-btn" id="collapseAll">Collapse all</button></div>
  <div id="tree"></div>
</aside>
<main class="content">
  <div class="file-header" id="fileHeader" style="display:none">
    <span class="file-path" id="headerPath"></span>
    <button class="copy-btn" id="copyBtn">Copy</button>
  </div>
  <div class="code-wrap">
    <pre class="content-inner" id="viewer"><code class="empty">${fileKeys.length ? "Select a file from the sidebar" : noFilesMsg}</code></pre>
  </div>
</main>
</div>
<script type="application/json" id="filesData">${dataJson.replace(/<\/script>/gi, "<\\/script>")}</script>
<script>
(function(){
var el=document.getElementById("filesData");
var raw=el?el.textContent:"{}";
var data=JSON.parse(raw);
var files=data.files||{}, keys=data.fileKeys||[], treeData=data.tree||{};
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
function getLang(p){
  if(p.endsWith(".ts")||p.endsWith(".tsx"))return"typescript";
  if(p.endsWith(".js")||p.endsWith(".mjs")||p.endsWith(".cjs"))return"javascript";
  if(p.endsWith(".json"))return"json";
  if(p.endsWith(".css"))return"css";
  if(p.endsWith(".md"))return"markdown";
  return"";
}
var viewMode="code";
function setViewMode(mode){viewMode=mode}
function selectFile(path){
  document.querySelectorAll(".sidebar .file.active").forEach(function(n){n.classList.remove("active")});
  document.querySelectorAll(".sidebar .folder.active").forEach(function(n){n.classList.remove("active")});
  var node=document.querySelector('.sidebar .file[data-path="'+path.replace(/"/g,'\\"')+'"]');
  if(node){node.classList.add("active");node.scrollIntoView({block:"nearest"})}
  document.getElementById("breadcrumbFile").textContent=path;
  document.getElementById("fileHeader").style.display="block";
  document.getElementById("headerPath").textContent=path;
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
      btn.onclick=function(){setViewMode(btn.dataset.mode);selectFile(path)};
    });
  }else{
    var lines=content.split("\\n");
    var nums="",code="";
    lines.forEach(function(line,i){nums+="<span>"+(i+1)+"</span>";code+="<span class=\\"line\\">"+esc(line)+"\\n</span>"});
    viewer.innerHTML='<table class="code-table"><tr><td class="line-nums">'+nums+'</td><td class="line-code"><code>'+code+'</code></td></tr></table>';
    viewer.classList.remove("empty");
    var c=viewer.querySelector("code");if(c&&typeof hljs!=="undefined"){c.className="language-"+getLang(path);hljs.highlightElement(c)}
  }
  window._currentPath=path;window._currentContent=content;
}
document.getElementById("copyBtn").onclick=function(){
  var p=window._currentPath,c=window._currentContent;
  if(!c)return;
  navigator.clipboard&&navigator.clipboard.writeText(c).then(function(){var b=document.getElementById("copyBtn");var t=b.textContent;b.textContent="Copied!";setTimeout(function(){b.textContent=t},1500)});
};
function folderIcon(){return'<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.58 0 1.165.224 1.587.624l.357.364A.75.75 0 0 0 8 2h5.25A1.75 1.75 0 0 1 15 3.75v8.5A1.75 1.75 0 0 1 13.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-9.5C0 2.178.78 1.408 1.513 1.513Z"/></svg>'}
function fileIcon(){return'<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Z"/></svg>'}
function chevronDown(){return'<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>'}
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
      div.style.marginLeft=(indent*12)+"px";
      div.innerHTML='<span class="icon">'+fileIcon()+'</span>'+esc(k);
      div.onclick=function(p){return function(){selectFile(p)}}(v.path);
      parentEl.appendChild(div);
    }else if(v&&typeof v==="object"){
      var folderDiv=document.createElement("div");
      folderDiv.className="folder";
      folderDiv.style.marginLeft=(indent*12)+"px";
      folderDiv.innerHTML='<span class="chevron">'+chevronDown()+'</span><span class="icon">'+folderIcon()+'</span>'+esc(k);
      var children=document.createElement("div");
      children.className="children";
      folderDiv.onclick=function(e){
        if(e.target.closest(".file"))return;
        var self=e.currentTarget;
        self.classList.toggle("collapsed");
        children.classList.toggle("hidden",self.classList.contains("collapsed"));
      };
      parentEl.appendChild(folderDiv);
      parentEl.appendChild(children);
      renderTree(v,children,indent+1);
    }
  }
}
function buildTreeFromKeys(keys){
  var root={};
  keys.forEach(function(key){
    var parts=key.split("/");
    var curr=root;
    for(var i=0;i<parts.length;i++){
      var part=parts[i];
      var isLast=i===parts.length-1;
      if(!curr[part])curr[part]=isLast?{path:key}:{};
      if(isLast)curr[part].path=key;
      else curr=curr[part];
    }
  });
  return root;
}
function buildTree(filterQuery){
  var treeEl=document.getElementById("tree");
  treeEl.innerHTML="";
  var filteredKeys=filterQuery?keys.filter(function(k){return k.toLowerCase().indexOf(filterQuery.toLowerCase())>=0;}):keys;
  var data=filteredKeys.length?buildTreeFromKeys(filteredKeys):{};
  if(Object.keys(data).length>0){
    renderTree(data,treeEl,0);
  }else{
    filteredKeys.sort();
    filteredKeys.forEach(function(k){
      var div=document.createElement("div");
      div.className="file";
      div.dataset.path=k;
      div.innerHTML='<span class="icon">'+fileIcon()+'</span>'+esc(k.split("/").pop());
      div.onclick=function(){selectFile(k)};
      treeEl.appendChild(div);
    });
  }
}
document.getElementById("searchInput").oninput=function(){
  var q=this.value.trim();
  buildTree(q);
};
document.getElementById("expandAll").onclick=function(){
  document.querySelectorAll(".sidebar .folder.collapsed").forEach(function(f){f.classList.remove("collapsed")});
  document.querySelectorAll(".sidebar .children.hidden").forEach(function(c){c.classList.remove("hidden")});
};
document.getElementById("collapseAll").onclick=function(){
  document.querySelectorAll(".sidebar .folder").forEach(function(f){f.classList.add("collapsed")});
  document.querySelectorAll(".sidebar .children").forEach(function(c){c.classList.add("hidden")});
};
buildTree();
})();
</script>
</body>
</html>`;
}
