import { Document, Link, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { createElement as h, type ReactNode } from "react";
import type { ReportModel } from "./report";

/**
 * PDF do relatório, A4, 3 páginas: resumo; conta por rotina e premissas; teto de investimento, fora
 * da conta, fontes e limites. Escrito com createElement (sem JSX) para rodar igual no Next e no
 * vitest. Fontes embutidas do próprio react-pdf (Times e Helvetica): sem download em tempo de execução.
 */
const INK = "#0c0b0a";
const PAPER = "#f4f3f0";
const MUTED = "#4a463f";
const LINE = "#d9d5cc";
const RUST = "#b83c12";

const s = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 10.5, color: INK, lineHeight: 1.45 },
  brand: { fontFamily: "Times-Roman", fontSize: 18, marginBottom: 4 },
  meta: { fontSize: 9, color: MUTED, marginBottom: 22 },
  hero: { backgroundColor: INK, color: PAPER, padding: 24, borderRadius: 8, marginBottom: 18 },
  heroLabel: { fontSize: 10, color: "#cbc8c0" },
  heroNum: { fontFamily: "Times-Roman", fontSize: 40, color: "#ffffff", marginVertical: 4 },
  heroLine: { fontSize: 11, color: "#ffffff" },
  heroSub: { fontSize: 10, color: "#cbc8c0", marginTop: 8 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 9, letterSpacing: 1, color: MUTED, textTransform: "uppercase", marginTop: 18, marginBottom: 8 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 7 },
  th: { flexDirection: "row", paddingBottom: 5 },
  c1: { width: "34%" },
  c2: { width: "18%" },
  c3: { width: "22%" },
  c4: { width: "26%", textAlign: "right" },
  small: { fontSize: 9, color: MUTED },
  bold: { fontFamily: "Helvetica-Bold" },
  p: { marginBottom: 6 },
  li: { marginBottom: 4 },
  bar: { height: 10, backgroundColor: "#e6e2d9", borderRadius: 5, marginTop: 4 },
  footer: { position: "absolute", left: 44, right: 44, bottom: 28, fontSize: 8, color: MUTED, flexDirection: "row", justifyContent: "space-between" },
});

const T = (style: Style | Style[], text: string) => h(Text, { style }, text);

function footer(r: ReportModel, page: number): ReactNode {
  return h(View, { style: s.footer, fixed: true }, T({}, `Relatório nº ${r.id} · ${r.dateLabel}`), T({}, `${page} de 3 · procemiza.com.br`));
}

export function reportDocument(r: ReportModel) {
  const rows = r.rows.map((x, i) =>
    h(View, { key: i, style: s.tr, wrap: false }, [
      h(View, { key: "a", style: s.c1 }, T(s.bold, x.label), T(s.small, `${x.time} · ${x.freq}`)),
      h(Text, { key: "b", style: s.c2 }, x.hoursNow),
      h(Text, { key: "c", style: s.c3 }, x.hoursBack),
      h(Text, { key: "d", style: [s.c4, s.bold] }, x.brlYear),
    ]),
  );

  return h(
    Document,
    { title: `Relatório ${r.id}`, author: "Procemiza", subject: "Ganho com automação" },
    h(Page, { size: "A4", style: s.page }, [
      T({ ...s.brand }, "Procemiza"),
      T(s.meta, `Relatório nº ${r.id} · ${r.dateLabel}`),
      h(View, { key: "hero", style: s.hero }, [
        T(s.heroLabel, "Devolvidos por ano, até"),
        T(s.heroNum, r.headline.ceiling),
        T(s.heroSub, `${r.headline.hoursBack} · ${r.headline.people}`),
        T(s.heroSub, `${r.headline.share} · Em 3 anos: ${r.headline.threeYears}`),
      ]),
      T(s.h2, "Em uma frase"),
      T(s.p, `As rotinas informadas devolvem até ${r.headline.ceiling} por ano, contando só o tempo de quem faz. É um teto: o potencial técnico descrito na pesquisa, não uma promessa.`),
      footer(r, 1),
    ]),
    h(Page, { size: "A4", style: s.page }, [
      T(s.h2, "A conta por rotina (horas por mês)"),
      h(View, { key: "th", style: s.th }, [
        h(Text, { key: "1", style: [s.c1, s.small] }, "Rotina"),
        h(Text, { key: "2", style: [s.c2, s.small] }, "Hoje"),
        h(Text, { key: "3", style: [s.c3, s.small] }, "Voltam"),
        h(Text, { key: "4", style: [s.c4, s.small] }, "Por ano"),
      ]),
      ...rows,
      h(View, { key: "tot", style: [s.tr, { borderBottomWidth: 0 }] }, [
        h(Text, { key: "1", style: [s.c1, s.bold] }, "Total"),
        h(Text, { key: "2", style: [s.c2, s.bold] }, r.totals.hoursNow),
        h(Text, { key: "3", style: [s.c3, s.bold] }, r.totals.hoursBack),
        h(Text, { key: "4", style: [s.c4, s.bold] }, r.totals.brlYear),
      ]),
      T(s.small, r.sensitivity),
      T(s.h2, "Como chegamos"),
      ...r.how.map((t, i) => h(Text, { key: i, style: s.p }, t)),
      footer(r, 2),
    ]),
    h(Page, { size: "A4", style: s.page }, [
      T(s.h2, "Teto de investimento"),
      T(s.p, `Se a implantação custar até ${r.invest.m12}, o teto paga em 12 meses; até ${r.invest.m24}, em 24.`),
      T(s.h2, "Fora da conta"),
      ...r.outside.map((t, i) => h(Text, { key: i, style: s.li }, `• ${t}`)),
      T(s.h2, "Fontes"),
      ...r.sources.map((src, i) =>
        h(View, { key: i, style: s.li }, h(Text, {}, [h(Link, { key: "l", src: src.url, style: { color: RUST } }, `${src.name}, ${src.year}`), `: ${src.note}`])),
      ),
      T({ ...s.small, marginTop: 8 }, r.limits),
      T(s.h2, "Próximo passo"),
      h(Link, { src: r.whatsappText, style: { color: RUST } }, "Falar com a Procemiza no WhatsApp"),
      T(s.small, `Constantes de custo conferidas em ${r.vigencia}. Relatório na página: ${r.reportUrl}`),
      footer(r, 3),
    ]),
  );
}

export async function reportPdf(r: ReportModel): Promise<Buffer> {
  return renderToBuffer(reportDocument(r));
}
