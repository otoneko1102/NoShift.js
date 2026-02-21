const C="modulepreload",R=function(e){return"/"+e},v={},x=function(o,a,h){let m=Promise.resolve();if(a&&a.length>0){let l=function(n){return Promise.all(n.map(i=>Promise.resolve(i).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const t=document.querySelector("meta[property=csp-nonce]"),f=t?.nonce||t?.getAttribute("nonce");m=l(a.map(n=>{if(n=R(n),n in v)return;v[n]=!0;const i=n.endsWith(".css"),p=i?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${p}`))return;const c=document.createElement("link");if(c.rel=i?"stylesheet":C,i||(c.as="script"),c.crossOrigin="",c.href=n,f&&c.setAttribute("nonce",f),document.head.appendChild(c),i)return new Promise((L,S)=>{c.addEventListener("load",L),c.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${n}`)))})}))}function s(l){const t=new Event("vite:preloadError",{cancelable:!0});if(t.payload=l,window.dispatchEvent(t),!t.defaultPrevented)throw l}return m.then(l=>{for(const t of l||[])t.status==="rejected"&&s(t.reason);return o().catch(s)})},u=document.getElementById("src-code"),r=document.getElementById("out-code"),I=document.getElementById("btn-compile"),g=document.getElementById("btn-run"),b=document.getElementById("exec-result"),M=document.getElementById("btn-scroll-top"),E=document.getElementById("btn-copy"),w=new ResizeObserver(e=>{let o=0;for(const a of e)o=a.contentRect.height,a.target===u?r.style.height!==`${o}px`&&(r.style.height=`${o}px`):a.target===r&&u.style.height!==`${o}px`&&(u.style.height=`${o}px`)});w.observe(u);w.observe(r);let y=null;function k(){if(!y){r.value="Compiler is loading...";return}try{const e=y(u.value);r.value=e.outputText}catch(e){r.value=`Compilation Error:
`+e.message}}I.addEventListener("click",k);let d=null;g.addEventListener("click",()=>{const e=r.value;b.innerHTML="",g.disabled=!0,g.style.opacity="0.7",document.querySelector(".playground-results")?.scrollIntoView({behavior:"smooth"}),d&&d.terminate();function o(t,f="log"){const n=document.createElement("div");f==="error"&&(n.style.color="var(--warning)"),n.textContent=t,b.appendChild(n)}const a=`
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
    `,h=new Blob([a],{type:"application/javascript"}),m=URL.createObjectURL(h),s=new Worker(m);d=s;function l(){d===s&&(d=null),URL.revokeObjectURL(m),s.terminate(),g.disabled=!1,g.style.opacity="1"}s.onmessage=t=>{t.data.type==="log"?o(t.data.data,"log"):t.data.type==="error"?o(t.data.data,"error"):t.data.type==="done"&&l()},s.onerror=t=>{o(t.message,"error"),l()},s.postMessage(e),setTimeout(()=>{d===s&&(o("Execution timed out (2s limit).","error"),l())},2e3)});u.value="console.log^8^2^3hello, ^3world!^2^9;";r.value="Loading compiler module...";x(()=>import("https://unpkg.com/noshift.js@latest/dist/index.mjs"),[]).then(e=>{y=e.compile,k()}).catch(e=>{r.value=`Failed to load compiler:
`+e.message});M?.addEventListener("click",()=>{window.scrollTo({top:0,left:0,behavior:"smooth"})});E?.addEventListener("click",()=>{navigator.clipboard.writeText(r.value).then(()=>{const e=E.querySelector("[data-icon]");if(e){const o=e.getAttribute("data-icon");e.setAttribute("data-icon","material-symbols:check"),setTimeout(()=>{e.setAttribute("data-icon",o||"material-symbols:content-copy-outline")},2e3)}})});
