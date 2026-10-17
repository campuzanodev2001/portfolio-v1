/**
 * Boot de Specimen × La Obra. Es un string para ir inline y correr durante
 * el parseo del HTML, ANTES de que hidrate React: el loader entero es CSS
 * disparado por `data-stage` en el root, así arranca en el primer paint
 * aunque el JS del framework tarde en 3G. La cuadrilla (canvas) se suma
 * cuando llega el JS; si no llega, la obra igual se ve terminada.
 *
 *   boot -> run   -> done   primera visita de la sesión
 *   boot -> enter -> done   ya booteado en esta sesión
 *   boot -> calm  -> done   prefers-reduced-motion
 *
 * ES5 y autocontenido: se inlinea tal cual.
 */
export const STORAGE_KEY = "lab-specimen-obra-booted";
export const RUN_MS = 1300;

const BOOT_FN = `function(r){
  if(!r||r.getAttribute("data-b"))return;
  r.setAttribute("data-b","1");
  var K="${STORAGE_KEY}",seen=null,rm=false,fin=false,started=false;
  try{seen=sessionStorage.getItem(K);sessionStorage.setItem(K,"1")}catch(e){}
  try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  function st(s){r.setAttribute("data-stage",s);try{r.dispatchEvent(new Event("stage"))}catch(e){}}
  var ev=["pointerdown","keydown","wheel","touchstart"];
  function off(){for(var i=0;i<ev.length;i++)removeEventListener(ev[i],skip,true)}
  function done(){if(fin)return;fin=true;off();st("done")}
  if(rm){st("calm");setTimeout(done,600);return}
  if(seen){st("enter");setTimeout(done,900);return}
  function go(){if(started)return;started=true;st("run");setTimeout(done,${RUN_MS})}
  function skip(e){
    if(e&&e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey))return;
    go();
    r.setAttribute("data-skip","1");
    var a=r.getAnimations?r.getAnimations({subtree:true}):[],p=[];
    for(var i=0;i<a.length;i++){
      var t=a[i].effect&&a[i].effect.getTiming?a[i].effect.getTiming():{};
      if(t.iterations===Infinity||(a[i].timeline&&a[i].timeline!==document.timeline))continue;
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
  setTimeout(go,200);
  st("boot");
}`;

/** Inline: corre contra su propio padre (el root). */
export const BOOT_INLINE = `(${BOOT_FN})(document.currentScript&&document.currentScript.parentNode);`;

/** Navegación cliente: React no ejecuta scripts inline, así que se inyecta. */
export const BOOT_BY_ID = `(${BOOT_FN})(document.getElementById("so"));`;
