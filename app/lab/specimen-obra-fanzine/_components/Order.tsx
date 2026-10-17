"use client";

import { useId, useRef, useState } from "react";
import { EMAIL } from "./data";

/**
 * The contact "work order". There is no server: it only writes the email for
 * you and hands it to your mail app (mailto). Without JS the link still works.
 */
const KINDS = [
  { v: "freelance", label: "Un proyecto freelance", subject: "Proyecto freelance" },
  { v: "fulltime", label: "Un puesto full-time remoto", subject: "Puesto full-time remoto" },
  { v: "charla", label: "Una charla, sin compromiso", subject: "Charla" },
] as const;

type Kind = (typeof KINDS)[number]["v"];

export default function Order() {
  const id = useId();
  const [kind, setKind] = useState<Kind>("freelance");
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(0);
  const live = useRef<HTMLParagraphElement>(null);

  const k = KINDS.find((x) => x.v === kind) ?? KINDS[0];
  const body = [
    "Hola Daniel,",
    "",
    msg.trim() || "(contame acá)",
    "",
    name.trim() ? `— ${name.trim()}` : "",
  ]
    .join("\n")
    .trim();
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
    `Orden de trabajo: ${k.subject}`,
  )}&body=${encodeURIComponent(body)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied((c) => c + 1);
      if (live.current) live.current.textContent = "Mail copiado al portapapeles.";
    } catch {
      if (live.current) live.current.textContent = `No pude copiarlo. Es ${EMAIL}.`;
    }
  };

  return (
    <div className="imp-order" data-nostamp="">
      <div className="imp-order__head">
        <span>Orden de trabajo</span>
        <span>Imprenta Campuzano</span>
      </div>

      <fieldset className="imp-order__kinds">
        <legend>¿Qué hay para imprimir?</legend>
        {KINDS.map((x) => (
          <label key={x.v} className="imp-chip">
            <input
              type="radio"
              name={`${id}-kind`}
              value={x.v}
              checked={kind === x.v}
              onChange={() => setKind(x.v)}
            />
            <span>{x.label}</span>
          </label>
        ))}
      </fieldset>

      <label className="imp-field">
        <span>Contame en dos líneas</span>
        <textarea
          rows={3}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Qué es, para cuándo, qué tenés hasta ahora."
        />
      </label>

      <label className="imp-field">
        <span>Tu nombre (opcional)</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="imp-order__go">
        <a className="imp-send" href={href}>
          Mandar la orden<span aria-hidden="true">.</span>
        </a>
        <button type="button" className="imp-copy" onClick={copy}>
          Copiar el mail
        </button>
        {copied > 0 && (
          <span key={copied} className="imp-stamp imp-stamp--b imp-order__stamp" aria-hidden="true">
            Copiado
          </span>
        )}
      </div>
      <p className="imp-order__fine">
        Se abre tu programa de mail con todo escrito. No hay servidor en el medio: lo leo yo.
      </p>
      <p ref={live} className="imp-sr" aria-live="polite" />
    </div>
  );
}
