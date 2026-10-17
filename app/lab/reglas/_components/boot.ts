/**
 * Boot de Las Reglas. String inline: corre durante el parseo del HTML, antes
 * de que React hidrate, así el loader arranca en el primer paint aun en 3G.
 * El loader entero son keyframes CSS colgados de `data-stage` en la raíz;
 * este script sólo elige el escenario.
 *
 *   boot -> run   -> done   (primera visita de la sesión, ~1.3 s)
 *   boot -> enter -> done   (ya booteó en esta sesión)
 *   boot -> calm  -> done   (prefers-reduced-motion)
 *
 * ES5 y autocontenido: se inyecta tal cual.
 */
export const STORAGE_KEY = "lab-reglas-booted";

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
  if(rm){st("calm");setTimeout(done,500);return}
  if(seen){st("enter");setTimeout(done,600);return}
  function go(){if(started)return;started=true;st("run");setTimeout(done,1300)}
  function skip(e){
    if(e&&e.type==="keydown"&&(e.metaKey||e.ctrlKey||e.altKey||e.key==="Tab"))return;
    go();off();
    var a=r.getAnimations?r.getAnimations({subtree:true}):[];
    for(var i=0;i<a.length;i++){
      var t=a[i].effect&&a[i].effect.getTiming?a[i].effect.getTiming():{};
      if(t.iterations===Infinity)continue;
      try{a[i].finish()}catch(x){}
    }
    setTimeout(done,60);
  }
  for(var i=0;i<ev.length;i++)addEventListener(ev[i],skip,{capture:true,passive:true});
  var f=(r.getAttribute("data-font")||"").split(",")[0];
  try{
    if(document.fonts&&f){document.fonts.load("800 40px "+f,"DANIEL ES").then(go,go)}else{go()}
  }catch(e){go()}
  setTimeout(go,250);
  st("boot");
}`;

export const BOOT_INLINE = `(${BOOT_FN})(document.currentScript&&document.currentScript.parentNode);`;
