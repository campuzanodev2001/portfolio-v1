/**
 * Runs before paint (inline in the page). Decides the intro mode so the
 * server HTML never flashes: boot (first visit), done (seen this session),
 * calm (prefers-reduced-motion). No JS at all → the CSS final state shows.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement,m='boot';try{if(sessionStorage.getItem('lab-maquina-booted'))m='done'}catch(e){m='done'}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)m='calm'}catch(e){}d.setAttribute('data-mq',m);d.setAttribute('data-mq-t',String(Date.now()))})()`;
