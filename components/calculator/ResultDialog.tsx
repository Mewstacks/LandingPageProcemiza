"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import type { Plan } from "@/lib/plan";

type Props = {
  open: boolean;
  plan: Plan;
  onClose: () => void;
  /** Relatório enviado: guarda para onde foi. */
  onSent: (email: string) => void;
};

type Status = "idle" | "sending" | "error";
type Errors = Partial<Record<"email" | "company" | "whatsapp", string>>;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string; reset: (id?: string) => void };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,255}\.[^\s@<>"]{2,}$/;

/**
 * Pedido do relatório completo por e-mail: só e-mail e empresa. O resumo já está na tela; aqui só
 * vai o que sai por e-mail. `<dialog>` nativo: foco preso, Esc fecha, o fundo fica inerte. Honeypot e
 * tempo de preenchimento seguem junto; com chave do Turnstile configurada, o desafio roda aqui.
 */
export function ResultDialog({ open, plan, onClose, onSent }: Props) {
  const uid = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const opened = useRef(0);
  const token = useRef("");
  const widget = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [wants, setWants] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opened.current = Date.now();
      setStatus("idle");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || !SITE_KEY) return;
    const render = () => {
      if (widget.current && window.turnstile && !widget.current.hasChildNodes()) {
        window.turnstile.render(widget.current, { sitekey: SITE_KEY, callback: (t) => (token.current = t) });
      }
    };
    if (window.turnstile) return render();
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    if (!EMAIL.test(email.trim())) found.email = "Informe um e-mail válido";
    if (company.trim().length < 2) found.company = "Informe a empresa";
    const digits = whatsapp.replace(/\D/g, "");
    if (wants && (digits.length < 10 || digits.length > 13)) found.whatsapp = "Informe DDD e número";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    track("report_requested", { wants_contact: wants });
    try {
      const res = await fetch("/api/relatorio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          routines: plan.routines,
          pay: plan.pay,
          lead: { email, company, wantsContact: wants, whatsapp: wants ? whatsapp : "" },
          trap: { website, elapsedMs: Date.now() - opened.current },
          turnstile: token.current,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("report_sent", { wants_contact: wants });
      onSent(email.trim());
    } catch {
      setStatus("error");
      window.turnstile?.reset();
      token.current = "";
    }
  }

  const err = (k: keyof Errors) => (errors[k] ? `${uid}-${k}-erro` : undefined);

  return (
    <dialog ref={ref} className="sheet theme-light" aria-labelledby={`${uid}-titulo`} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <form className="sheet-body" onSubmit={submit} noValidate>
        <h2 id={`${uid}-titulo`} className="sheet-title">
          Relatório completo
        </h2>

        <div className="sheet-report">
          <p className="sheet-list">PDF e e-mail · Conta por rotina · Teto de investimento · Fontes</p>

          <div className="field">
            <label className="field-label" htmlFor={`${uid}-email`}>E-mail</label>
            <input id={`${uid}-email`} className="text-input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={err("email")} />
            {errors.email ? <p id={err("email")} className="field-error" role="alert">{errors.email}</p> : null}
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${uid}-company`}>Empresa</label>
            <input id={`${uid}-company`} className="text-input" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} aria-invalid={!!errors.company} aria-describedby={err("company")} />
            {errors.company ? <p id={err("company")} className="field-error" role="alert">{errors.company}</p> : null}
          </div>

          <label className="check">
            <input type="checkbox" checked={wants} onChange={(e) => setWants(e.target.checked)} />
            <span>Falar com a Procemiza</span>
          </label>
          {wants ? (
            <div className="field">
              <label className="field-label" htmlFor={`${uid}-wa`}>WhatsApp</label>
              <input id={`${uid}-wa`} className="text-input" type="tel" inputMode="tel" autoComplete="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} aria-invalid={!!errors.whatsapp} aria-describedby={err("whatsapp")} />
              {errors.whatsapp ? <p id={err("whatsapp")} className="field-error" role="alert">{errors.whatsapp}</p> : null}
            </div>
          ) : null}

          {/* armadilha para robô: invisível e fora do Tab */}
          <div className="trap" aria-hidden="true">
            <label>
              Site
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
          {SITE_KEY ? <div ref={widget} /> : null}

          {status === "error" ? (
            <p className="field-error" role="alert">
              Não enviou.{" "}
              <a href={site.contactUrl} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
              </a>
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary sheet-send" disabled={status === "sending"}>
            {status === "sending" ? "Enviando" : status === "error" ? "Tentar de novo" : "Enviar relatório"}
          </button>
          <button type="button" className="btn btn-ghost sheet-send" onClick={onClose}>
            Fechar
          </button>
          <p className="sheet-fine">
            Usamos e-mail e empresa para enviar o relatório. <a href="/privacidade">Privacidade</a>
          </p>
        </div>
      </form>
    </dialog>
  );
}
