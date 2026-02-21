const j="modulepreload",k=function(e){return"/"+e},v={},R=function(t,n,g){let c=Promise.resolve();if(n&&n.length>0){let a=function(r){return Promise.all(r.map(u=>Promise.resolve(u).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),y=o?.nonce||o?.getAttribute("nonce");c=a(n.map(r=>{if(r=k(r),r in v)return;v[r]=!0;const u=r.endsWith(".css"),m=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${m}`))return;const i=document.createElement("link");if(i.rel=u?"stylesheet":j,u||(i.as="script"),i.crossOrigin="",i.href=r,y&&i.setAttribute("nonce",y),document.head.appendChild(i),u)return new Promise((S,x)=>{i.addEventListener("load",S),i.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${r}`)))})}))}function s(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return c.then(a=>{for(const o of a||[])o.status==="rejected"&&s(o.reason);return t().catch(s)})},d=document.getElementById("src-code"),l=document.getElementById("out-code"),I=document.getElementById("btn-compile"),f=document.getElementById("btn-run"),b=document.getElementById("exec-result"),B=document.getElementById("btn-scroll-top"),E=document.getElementById("btn-copy"),w=new ResizeObserver(e=>{let t=0;for(const n of e)t=n.contentRect.height,n.target===d?l.style.height!==`${t}px`&&(l.style.height=`${t}px`):n.target===l&&d.style.height!==`${t}px`&&(d.style.height=`${t}px`)});w.observe(d);w.observe(l);let h=null;function C(){if(!h){l.value="Compiler is loading...";return}try{const e=h(d.value);l.value=e.outputText}catch(e){l.value=`Compilation Error:
`+e.message}}I.addEventListener("click",C);let p=null;f.addEventListener("click",()=>{const e=l.value;b.innerHTML="",f.disabled=!0,f.style.opacity="0.7",document.querySelector(".playground-results")?.scrollIntoView({behavior:"smooth"}),p&&p.terminate();function t(o,y="log"){const r=document.createElement("div");y==="error"&&(r.style.color="var(--warning)"),r.textContent=o,b.appendChild(r)}const n=`
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = function(...args) {
        self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') });
      };

      console.warn = function(...args) {
        self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') });
      };

      console.error = function(...args) {
        self.postMessage({ type: 'error', data: args.map(a => String(a)).join(' ') });
      };

      self.onmessage = function(e) {
        try {
          const result = new Function(e.data)();
          if (result !== undefined) {
            self.postMessage({ type: 'log', data: String(result) });
          }
          self.postMessage({ type: 'done' });
        } catch(err) {
          self.postMessage({ type: 'error', data: err.toString() });
          self.postMessage({ type: 'done' });
        }
      };
    `,g=new Blob([n],{type:"application/javascript"}),c=URL.createObjectURL(g),s=new Worker(c);p=s;function a(){p===s&&(p=null),URL.revokeObjectURL(c),s.terminate(),f.disabled=!1,f.style.opacity="1"}s.onmessage=o=>{o.data.type==="log"?t(o.data.data,"log"):o.data.type==="error"?t(o.data.data,"error"):o.data.type==="done"&&a()},s.onerror=o=>{t(o.message,"error"),a()},s.postMessage(e),setTimeout(()=>{p===s&&(t("Execution timed out (2s limit).","error"),a())},2e3)});d.value="console.log^8^2^3hello, ^3world!^2^9;";l.value="Loading compiler module...";R(()=>import("https://unpkg.com/noshift.js@latest/dist/index.mjs"),[]).then(e=>{h=e.compile,C()}).catch(e=>{l.value=`Failed to load compiler:
`+e.message});B?.addEventListener("click",()=>{window.scrollTo({top:0,left:0,behavior:"smooth"})});E?.addEventListener("click",()=>{navigator.clipboard.writeText(l.value).then(()=>{const e=E.querySelector("[data-icon]");if(e){const t=e.getAttribute("data-icon");e.setAttribute("data-icon","material-symbols:check"),setTimeout(()=>{e.setAttribute("data-icon",t||"material-symbols:content-copy-outline")},2e3)}})});const M={en:{"playground-title":"Playground","playground-description":"Try NoShift.js right in your browser.","playground-compile":"Compile","playground-run":"Run","src-code-placeholder":"Write your NoShift.js code here...","playground-compiledCode":"Compiled Code","playground-executionResult":"Execution Result"},ja:{"playground-description":"ブラウザで NoShift.js を試してみましょう。","playground-compile":"変換","playground-run":"実行","src-code-placeholder":"ここに NoShift.js のコードを書きます...","playground-compiledCode":"コンパイルされたコード","playground-executionResult":"実行結果"}};function L(e){const t=M[e];if(t){for(const[n,g]of Object.entries(t)){if(n==="src-code-placeholder"){d.placeholder=g;continue}const c=document.getElementById(n);c&&(c.textContent=g)}document.querySelectorAll(".lang-btn").forEach(n=>{n.classList.toggle("active",n.textContent?.trim()===e.toUpperCase())}),document.documentElement.lang=e}}document.querySelectorAll(".sidebar-footer .lang-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.textContent?.trim().toLowerCase();(t==="en"||t==="ja")&&L(t)})});navigator.language.startsWith("ja")&&L("ja");
