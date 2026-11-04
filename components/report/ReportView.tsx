"use client";

import "./report.css";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { buildReport, type ReportModel } from "@/lib/report";
import { decodePlan } from "@/lib/share";

/**
 * O relatório na página: lê a simulação do fragmento da URL (nunca vai ao servidor), valida tudo de
 * novo e mostra a mesma conta do e-mail e do PDF. "Salvar em PDF" é a impressão do navegador.
 */
export function ReportView() {
  const [state, setState] = useState<{ r: ReportModel } | "invalid" | null>(null);

  useEffect(() => {
    const plan = decodePlan(window.location.hash);
    const r = plan ? buildReport(plan, { name: "Você", email: "", company: "", wantsContact: false }, new Date(), window.location.origin, site.contactUrl) : null;
    setState(r ? { r } : "invalid");
  }, []);

  if (state === null) return <p className="report-wait" aria-busy="true">Carregando</p>;
  if (state === "invalid") {
    return (
      <p className="report-wait">
        Link sem simulação. <a href="/calculadora">Refazer a conta</a>
      </p>
    );
  }
  const { r } = state;

  return (
    <article className="report">
      <header className="report-head">
        <p className="report-meta">{r.dateLabel}</p>
        <p className="report-label">Devolvidos por ano, até</p>
        <p className="report-big">{r.headline.ceiling}</p>
        <p className="report-sub">Prudente <b>{r.headline.prudent}</b></p>
        <p className="report-meta">{r.headline.hoursBack} · {r.headline.people} · {r.headline.share}</p>
        <p className="report-meta">Em 3 anos: {r.headline.threeYears}</p>
      </header>

      <section aria-labelledby="rp-conta">
        <h2 id="rp-conta" className="report-h">A conta por rotina</h2>
        <table className="report-table">
          <thead>
            <tr><th scope="col">Rotina</th><th scope="col">Hoje</th><th scope="col">Voltam</th><th scope="col">Por ano</th></tr>
          </thead>
          <tbody>
            {r.rows.map((x, i) => (
              <tr key={i}>
                <th scope="row">{x.label}<span>{x.time} · {x.freq}</span></th>
                <td>{x.hoursNow}</td>
                <td>{x.hoursBack}</td>
                <td>{x.brlYear}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td>{r.totals.hoursNow}</td><td>{r.totals.hoursBack}</td><td>{r.totals.brlYear}</td></tr>
          </tfoot>
        </table>
        <p className="report-meta">Horas por mês. {r.sensitivity}</p>
      </section>

      <section aria-labelledby="rp-como">
        <h2 id="rp-como" className="report-h">Como chegamos</h2>
        {r.how.map((t, i) => <p key={i}>{t}</p>)}
      </section>

      <section aria-labelledby="rp-teto">
        <h2 id="rp-teto" className="report-h">Teto de investimento</h2>
        <p>Se a implantação custar até <b>{r.invest.m12}</b> o prudente paga em 12 meses; até <b>{r.invest.m24}</b>, em 24.</p>
      </section>

      <section aria-labelledby="rp-fora">
        <h2 id="rp-fora" className="report-h">Fora da conta</h2>
        <ul>{r.outside.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </section>

      <section aria-labelledby="rp-fontes">
        <h2 id="rp-fontes" className="report-h">Fontes</h2>
        <ul>
          {r.sources.map((s) => (
            <li key={s.name}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}, {s.year}</a>: {s.note}</li>
          ))}
        </ul>
        <p className="report-meta">{r.limits}</p>
      </section>

      <div className="report-actions">
        <a className="btn btn-primary" href={r.whatsappText} target="_blank" rel="noopener noreferrer">
          Falar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
        </a>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>Salvar em PDF</button>
      </div>
      <p className="report-meta">Constantes de custo conferidas em {r.vigencia}.</p>
    </article>
  );
}
