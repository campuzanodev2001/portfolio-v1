/**
 * Boot sequence, shipped as a plain string so it runs as an inline <script>
 * while the HTML is parsed, before React hydrates. The whole print run is
 * CSS keyframes keyed off `data-stage` on the root; this only picks a stage.
 *
 *   boot -> run   -> done   first visit in the session (the print run)
 *   boot -> enter -> done   already printed this session (short entrance)
 *   boot -> calm  -> done   prefers-reduced-motion
 *
 * Keep it ES5 and self-contained: it is inlined verbatim.
 */
export const STORAGE_KEY = "lab-specimen-obra-fanzine-booted";
/** Length of the print run (ms), from the moment it starts. */
export const RUN_MS = 1320;
/** Max wait for Roboto Flex before printing with whatever we have. */
export const FONT_WAIT = 120;

const BOOT_FN = `function(r){
  if(!r||r.getAttribute("data-b"))return;
  r.setAttribute("data-b","1");
  var K="${STORAGE_KEY}",seen=null,rm=false,fin=false,started=false;
  try{seen=sessionStorage.getItem(K);sessionStorage.setItem(K,"1")}catch(e){}
  try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  function st(s){r.setAttribute("data-stage",s);try{r.dispatchEvent(new Event("stage"))}catch(e){}}
  function done(){if(fin)return;fin=true;off();st("done")}
  if(rm){st("calm");setTimeout(done,700);return}
  if(seen){st("enter");setTimeout(done,900);return}
  function go(){if(started)return;started=true;st("run");setTimeout(done,${RUN_MS})}
  function skip(e){
    if(e&&e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey))return;
    go();
    r.setAttribute("data-skipped",String(Date.now()));
    var h=r.querySelector("[data-hero]")||r,f=r.querySelector("[data-feed]");
    var a=h.getAnimations?h.getAnimations({subtree:true}):[],p=[];
    if(f&&f.getAnimations)a=a.concat(f.getAnimations({subtree:true}));
    for(var i=0;i<a.length;i++){
      if(a[i].timeline&&a[i].timeline!==document.timeline)continue;
      var t=a[i].effect&&a[i].effect.getTiming?a[i].effect.getTiming():{};
      if(t.iterations===Infinity)continue;
      a[i].updatePlaybackRate?a[i].updatePlaybackRate(6):(a[i].playbackRate=6);
      p.push(a[i].finished);
    }
    off();
    if(window.Promise&&p.length){Promise.all(p).then(done,done)}
    setTimeout(done,320);
  }
  var ev=["pointerdown","keydown","wheel","touchstart"];
  function off(){for(var i=0;i<ev.length;i++)removeEventListener(ev[i],skip,true)}
  for(var i=0;i<ev.length;i++)addEventListener(ev[i],skip,{capture:true,passive:true});
  var f=(r.getAttribute("data-font")||"").split(",")[0];
  try{
    if(document.fonts&&f){document.fonts.load("860 100px "+f,"DANIEL_").then(go,go)}else{go()}
  }catch(e){go()}
  setTimeout(go,${FONT_WAIT});
  st("boot");
}`;

/** Inline form: runs against its own parent node (the page root). */
export const BOOT_INLINE = `(${BOOT_FN})(document.currentScript&&document.currentScript.parentNode);`;

/** Fallback for client-side navigations, where React won't run inline scripts. */
export const BOOT_BY_ID = `(${BOOT_FN})(document.getElementById("imprenta"));`;

/**
 * Writes today's date (Buenos Aires) on the IMPRESO stamp. Runs right after
 * the stamp is parsed, so the date is there when the stamp lands.
 */
export const DATE_INLINE = `(function(s){try{if(!s)return;s.setAttribute("data-d",new Intl.DateTimeFormat("es-AR",{timeZone:"America/Argentina/Buenos_Aires",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date()).replace(/\\//g,"\\u00b7"))}catch(e){}})(document.currentScript&&document.currentScript.previousElementSibling);`;
