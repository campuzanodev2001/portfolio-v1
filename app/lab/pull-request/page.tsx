import { BOOT_KEY } from "./_components/content";
import { PullRequest } from "./_components/PullRequest";
import { Stub } from "./_components/Stub";

/* Corre antes del primer paint: decide si el loader se muestra (una vez por
   sesión) y marca el t0 para que el JS se sincronice con la animación CSS. */
const bootScript = `(function(){var d=document.documentElement,m="run";window.__prT0=performance.now();try{if(sessionStorage.getItem(${JSON.stringify(
  BOOT_KEY,
)}))m="skip";else sessionStorage.setItem(${JSON.stringify(BOOT_KEY)},"1")}catch(e){}window.__prBoot=m;d.setAttribute("data-pr-boot",m)})()`;

export default function PullRequestPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <PullRequest>
        <Stub />
      </PullRequest>
    </>
  );
}
