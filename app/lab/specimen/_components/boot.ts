/**
 * Boot sequence for Specimen.
 *
 * Shipped as a plain string so it can run as an inline <script> during HTML
 * parsing, BEFORE React hydrates. That's what lets the loader start at first
 * paint even on 3G: the whole loader is CSS keyframes driven by
 * `data-stage` on the root; this script only decides which stage to play.
 *
 * Stages: boot -> run -> done      (first visit in the session)
 *         boot -> enter -> done    (already booted this session)
 *         boot -> calm -> done     (prefers-reduced-motion)
 *
 * Keep it ES5 and self-contained: it is inlined verbatim.
 */
export const STORAGE_KEY = "lab-specimen-booted";

const BOOT_FN = `function(r){
  if(!r||r.getAttribute("data-b"))return;
  r.setAttribute("data-b","1");
  var K="${STORAGE_KEY}",seen=null,rm=false,fin=false,started=false;
  try{seen=sessionStorage.getItem(K);sessionStorage.setItem(K,"1")}catch(e){}
  try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  var ev=["pointerdown","keydown","wheel","touchstart"];
  function off(){for(var i=0;i<ev.length;i++)removeEventListener(ev[i],skip,true)}
  function st(s){r.setAttribute("data-stage",s);try{r.dispatchEvent(new Event("stage"))}catch(e){}}
  function done(){if(fin)return;fin=true;off();st("done")}
  if(rm){st("calm");setTimeout(done,650);return}
  if(seen){st("enter");setTimeout(done,900);return}
  function go(){if(started)return;started=true;st("run");setTimeout(done,1270)}
  function skip(e){
    if(e&&e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey))return;
    go();
    var a=r.getAnimations?r.getAnimations({subtree:true}):[],p=[];
    for(var i=0;i<a.length;i++){
      var t=a[i].effect&&a[i].effect.getTiming?a[i].effect.getTiming():{};
      if(t.iterations===Infinity)continue;
      a[i].updatePlaybackRate?a[i].updatePlaybackRate(6):(a[i].playbackRate=6);
      p.push(a[i].finished);
    }
    off();
    if(window.Promise&&p.length){Promise.all(p).then(done,done)}
    setTimeout(done,320);
  }
  for(var i=0;i<ev.length;i++)addEventListener(ev[i],skip,{capture:true,passive:true});
  var f=(r.getAttribute("data-font")||"").split(",")[0];
  try{
    if(document.fonts&&f){document.fonts.load("860 100px "+f,"DANIEL_").then(go,go)}else{go()}
  }catch(e){go()}
  setTimeout(go,220);
  st("boot");
}`;

/** Inline form: runs against its own parent node (the specimen root). */
export const BOOT_INLINE = `(${BOOT_FN})(document.currentScript&&document.currentScript.parentNode);`;

/** Fallback for client-side navigations, where React won't execute inline scripts. */
export const BOOT_BY_ID = `(${BOOT_FN})(document.getElementById("specimen"));`;
