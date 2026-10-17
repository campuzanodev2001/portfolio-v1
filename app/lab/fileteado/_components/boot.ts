export const BOOT_KEY = "lab-fileteado-booted";

/**
 * Script en línea que corre ANTES de pintar: si ya viste la intro en esta
 * sesión, el hero arranca en modo "calm" (fundido corto) en vez de pintarse.
 */
export const BOOT_SCRIPT = `(function(s){try{if(sessionStorage.getItem("${BOOT_KEY}")==="1")s.parentElement.setAttribute("data-state","calm")}catch(e){}})(document.currentScript)`;
