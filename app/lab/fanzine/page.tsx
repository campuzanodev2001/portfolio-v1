import { Cover } from "./_components/Cover";
import { Press, YellowPlate } from "./_components/Press";
import { Sheets } from "./_components/Sheets";
import { BOOT_KEY, BOOT_MS } from "./_components/print";

/**
 * Runs during HTML parsing, before first paint and before any JS bundle:
 * decides whether this tab already saw the print run, and lets a tap/key
 * skip it even on a slow 3G connection where hydration is seconds away.
 * (On client-side navigations it doesn't run; <Press> repeats the logic.)
 */
const BOOT = `(function(){var r=document.currentScript.parentNode,k=${JSON.stringify(
  BOOT_KEY,
)};try{if(sessionStorage.getItem(k)){r.dataset.boot="done";return}sessionStorage.setItem(k,"1")}catch(e){}r.dataset.boot="run";setTimeout(function(){if(r.dataset.boot==="run")r.dataset.boot="done"},${BOOT_MS});function s(){if(r.dataset.boot!=="run")return;r.dataset.boot="done";r.dataset.skipped=Date.now()}addEventListener("pointerdown",s,{once:true});addEventListener("keydown",s,{once:true})})()`;

export default function FanzinePage() {
  return (
    <div className="fz" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <Press>
        <main>
          <section className="fz-hero" aria-label="Portada">
            <Cover ink="p" />
            <YellowPlate />
            <Cover ink="b" />
          </section>
          <Sheets />
        </main>
      </Press>
      <p className="fz-feed" aria-hidden="true">
        <span className="fz-feed__a">Pasada 1/2 · Fluorescent Pink</span>
        <span className="fz-feed__b">Pasada 2/2 · Federal Blue</span>
        <span className="fz-feed__skip">tocá para saltear</span>
      </p>
    </div>
  );
}
