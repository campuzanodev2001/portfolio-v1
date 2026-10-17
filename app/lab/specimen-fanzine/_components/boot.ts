/**
 * Boot sequence for Specimen × Fanzine.
 *
 * Shipped as a string and inlined as a <script> inside the root, so it runs
 * during HTML parsing, before React hydrates: the whole loader is CSS
 * keyframes driven by `data-stage` on the root; this only picks the stage.
 *
 *   boot -> run   -> done   first visit in the session (the print run)
 *   boot -> enter -> done   already booted this session (short entrance)
 *   boot -> calm  -> done   prefers-reduced-motion
 *
 * ES5 on purpose: it is inlined verbatim.
 */
export const STORAGE_KEY = "lab-specimen-fanzine-booted";
/** Length of the print run (stage `run`), ms. */
export const RUN_MS = 1360;
/** Max wait for the variable font before printing anyway, ms. */
export const FONT_WAIT_MS = 120;

const BOOT_FN = `function(r){
  if(!r||r.getAttribute("data-b"))return;
  r.setAttribute("data-b","1");
  var K="${STORAGE_KEY}",seen=null,rm=false,fin=false,started=false;
  var ev=["pointerdown","keydown","wheel","touchstart"];
  try{seen=sessionStorage.getItem(K);sessionStorage.setItem(K,"1")}catch(e){}
  try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  function st(s){r.setAttribute("data-stage",s);try{r.dispatchEvent(new Event("stage"))}catch(e){}}
  function done(){if(fin)return;fin=true;off();st("done")}
  if(rm){st("calm");setTimeout(done,760);return}
  if(seen){st("enter");setTimeout(done,950);return}
  function go(){if(started)return;started=true;st("run");setTimeout(done,${RUN_MS})}
  function skip(e){
    if(e&&e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey))return;
    go();
    r.setAttribute("data-skipped",String(Date.now()));
    var a=r.getAnimations?r.getAnimations({subtree:true}):[],p=[];
    for(var i=0;i<a.length;i++){
      if(a[i].timeline&&a[i].timeline!==document.timeline)continue;
      var t=a[i].effect&&a[i].effect.getTiming?a[i].effect.getTiming():{};
      if(t.iterations===Infinity)continue;
      a[i].updatePlaybackRate?a[i].updatePlaybackRate(6):(a[i].playbackRate=6);
      p.push(a[i].finished);
    }
    off();
    if(window.Promise&&p.length){Promise.all(p).then(done,done)}
    setTimeout(done,300);
  }
  function off(){for(var i=0;i<ev.length;i++)removeEventListener(ev[i],skip,true)}
  for(var i=0;i<ev.length;i++)addEventListener(ev[i],skip,{capture:true,passive:true});
  st("boot");
  var f=(r.getAttribute("data-font")||"").split(",")[0];
  try{
    if(document.fonts&&f){document.fonts.load("860 100px "+f,"DANIEL_").then(go,go)}else{go()}
  }catch(e){go()}
  setTimeout(go,${FONT_WAIT_MS});
}`;

export const ROOT_ID = "sf";

/** Inline form: runs against its own parent node (the page root). */
export const BOOT_INLINE = `(${BOOT_FN})(document.currentScript&&document.currentScript.parentNode);`;

/** Fallback for client-side navigations, where React won't run inline scripts. */
export const BOOT_BY_ID = `(${BOOT_FN})(document.getElementById("${ROOT_ID}"));`;
