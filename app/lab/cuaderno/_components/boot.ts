export const BOOT_KEY = "lab-cuaderno-booted";
/** Duración total del "lápiz" (loader → hero), ms. */
export const BOOT_MS = 1450;

/**
 * Corre durante el parseo del HTML, antes del primer paint y del bundle:
 * decide si esta pestaña ya vio la escritura y deja saltearla con tap/tecla
 * aunque la hidratación tarde (3G).
 */
export const BOOT_SCRIPT = `(function(){var r=document.currentScript.parentNode,k=${JSON.stringify(
  BOOT_KEY,
)};try{if(sessionStorage.getItem(k)){r.dataset.boot="done";return}sessionStorage.setItem(k,"1")}catch(e){}if(matchMedia("(prefers-reduced-motion: reduce)").matches){r.dataset.boot="done";return}r.dataset.boot="run";function s(){if(r.dataset.boot==="run")r.dataset.boot="done"}setTimeout(s,${BOOT_MS + 60});addEventListener("pointerdown",s,{once:true});addEventListener("keydown",s,{once:true})})()`;
