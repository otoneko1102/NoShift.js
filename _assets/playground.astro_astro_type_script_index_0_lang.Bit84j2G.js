const C="modulepreload",S=function(o){return"/"+o},h={},M=function(l,u,E){let d=Promise.resolve();if(u&&u.length>0){let r=function(t){return Promise.all(t.map(a=>Promise.resolve(a).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const e=document.querySelector("meta[property=csp-nonce]"),g=e?.nonce||e?.getAttribute("nonce");d=r(u.map(t=>{if(t=S(t),t in h)return;h[t]=!0;const a=t.endsWith(".css"),m=a?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${t}"]${m}`))return;const s=document.createElement("link");if(s.rel=a?"stylesheet":C,a||(s.as="script"),s.crossOrigin="",s.href=t,g&&s.setAttribute("nonce",g),document.head.appendChild(s),a)return new Promise((L,k)=>{s.addEventListener("load",L),s.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${t}`)))})}))}function n(r){const e=new Event("vite:preloadError",{cancelable:!0});if(e.payload=r,window.dispatchEvent(e),!e.defaultPrevented)throw r}return d.then(r=>{for(const e of r||[])e.status==="rejected"&&n(e.reason);return l().catch(n)})},y=document.getElementById("src-code"),i=document.getElementById("out-code"),R=document.getElementById("btn-compile"),p=document.getElementById("btn-run"),b=document.getElementById("exec-result");let f=null;function v(){if(!f){i.value="Compiler is loading...";return}try{const o=f(y.value,{noHeader:!0});i.value=o.outputText}catch(o){i.value=`Compilation Error:
`+o.message}}let w;y.addEventListener("input",()=>{clearTimeout(w),w=setTimeout(v,400)});R.addEventListener("click",v);let c=null;p.addEventListener("click",()=>{const o=i.value;b.innerHTML="",p.disabled=!0,p.style.opacity="0.7",c&&c.terminate();function l(e,g="log"){const t=document.createElement("div");g==="error"&&(t.style.color="var(--warning)"),t.textContent=e,b.appendChild(t)}const u=`
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
    `,E=new Blob([u],{type:"application/javascript"}),d=URL.createObjectURL(E),n=new Worker(d);c=n;function r(){c===n&&(c=null),URL.revokeObjectURL(d),n.terminate(),p.disabled=!1,p.style.opacity="1"}n.onmessage=e=>{e.data.type==="log"?l(e.data.data,"log"):e.data.type==="error"?l(e.data.data,"error"):e.data.type==="done"&&r()},n.onerror=e=>{l(e.message,"error"),r()},n.postMessage(o),setTimeout(()=>{c===n&&(l("Execution timed out (2s limit).","error"),r())},2e3)});y.value="console.log^2Hello World!^2;";i.value="Loading compiler module...";M(()=>import("https://cdn.jsdelivr.net/npm/noshift.js@latest/dist/index.mjs"),[]).then(o=>{f=o.compile,v()}).catch(o=>{i.value=`Failed to load compiler:
`+o.message});
