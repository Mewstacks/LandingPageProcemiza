import { LAYERS, type LayerId } from "./layers.data";

function Port({ x, y }: { x: number; y: number }) {
  return <g className="scene-port"><circle cx={x} cy={y} r="10" /><circle cx={x} cy={y} r="3" /></g>;
}

function Mark({ x, y, kind }: { x: number; y: number; kind: "message" | "document" | "sheet" | "check" | "database" }) {
  return <g transform={`translate(${x} ${y})`} className="scene-icon">
    {kind === "message" && <path d="M-9-7H9V5H-3L-8 9V5H-9Z M-5-2H5 M-5 1H1" />}
    {kind === "document" && <path d="M-7-10H3L8-5V10H-7Z M3-10V-5H8 M-3-1H4 M-3 3H4 M-3 7H1" />}
    {kind === "sheet" && <path d="M-9-8H9V8H-9Z M-9-2H9 M-9 3H9 M-3-8V8 M3-8V8" />}
    {kind === "check" && <path d="M-6 0L-1 5L8-5" />}
    {kind === "database" && <><ellipse cx="0" cy="-7" rx="11" ry="5" /><path d="M-11-7V7C-11 14 11 14 11 7V-7 M-11 0C-11 7 11 7 11 0" /></>}
  </g>;
}

export function LayerVisual({ id }: { id: LayerId }) {
  const layer = LAYERS.find((item) => item.id === id)!;
  const route = layer.route.map((point) => `${point.x},${point.y}`).join(" ");
  return <svg className={`scene-surface scene-surface--${id}`} viewBox="0 0 480 300" aria-hidden="true">
    <rect className="scene-surface-base" x="0.5" y="0.5" width="479" height="299" rx="10" />
    <path className="scene-engraving" d="M22 40H458 M22 263H458" />
    <text className="scene-small-label" x="24" y="26">PROCEMIZA / {layer.name}</text>
    <text className="scene-small-label scene-end-label" x="455" y="26">{layer.n}</text>
    <text className="scene-small-label" x="24" y="283">{id === "origens" ? "Entrada" : id === "regras" ? "Processamento" : id === "integracao" ? "Conexões" : "Saída"}</text>
    <g className="scene-plane-detail">
      {id === "origens" && <>
        <path className="scene-track" d="M94 83H142V245 M94 151H142 M94 218H142" />
        {[{ y: 83, kind: "message", name: "Mensagens" }, { y: 151, kind: "document", name: "Documentos" }, { y: 218, kind: "sheet", name: "Planilhas" }].map(({ y, kind, name }) => <g key={name}>
          <rect className="scene-module" x="25" y={y - 23} width="75" height="46" rx="5" />
          <Mark x={47} y={y - 1} kind={kind as "message" | "document" | "sheet"} />
          <path className="scene-ui-line" d={`M65 ${y - 5}H87 M65 ${y + 1}H80 M65 ${y + 7}H84`} />
        </g>)}
        <rect className="scene-module scene-module--raised" x="185" y="85" width="216" height="104" rx="7" />
        <rect className="scene-small-accent" x="203" y="104" width="25" height="25" rx="4" />
        <Mark x={215.5} y={117} kind="document" />
        <text className="scene-ui-title" x="243" y="117">Uma solicitação</text>
        <text className="scene-ui-meta" x="243" y="133">Tudo começa aqui</text>
        <path className="scene-ui-line" d="M203 153H380 M203 162H354 M203 171H369" />
        <path className="scene-track" d="M292 189V245" />
      </>}
      {id === "regras" && <>
        <rect className="scene-module" x="25" y="111" width="120" height="126" rx="6" />
        <text className="scene-ui-title" x="42" y="135">Contexto</text>
        <path className="scene-ui-line" d="M42 150H125 M42 158H111 M42 181H120 M42 189H104 M42 213H119 M42 221H98" />
        <path className="scene-track" d="M70 237V245 M260 239V245 M328 121V129 M328 180V188" />
        {[{ y: 79, name: "Validar entrada" }, { y: 138, name: "Definir prazo" }, { y: 197, name: "Atribuir responsável" }].map(({ y, name }) => <g key={name}>
          <rect className="scene-module scene-module--raised" x="231" y={y} width="196" height="42" rx="5" />
          <circle className="scene-check-circle" cx="250" cy={y + 21} r="10" />
          <Mark x={250} y={y + 21} kind="check" />
          <text className="scene-ui-copy" x="270" y={y + 25}>{name}</text>
        </g>)}
      </>}
      {id === "integracao" && <>
        <path className="scene-track" d="M108 89H234V127 M108 211H234V173 M359 86H256V127 M359 214H256V173" />
        {[{ x: 35, y: 73, label: "Sistema A" }, { x: 35, y: 193, label: "Base de dados" }, { x: 343, y: 68, label: "Sistema B" }, { x: 343, y: 196, label: "Atendimento" }].map(({ x, y, label }) => <g key={label}>
          <rect className="scene-module" x={x} y={y} width="103" height="39" rx="5" />
          <circle className="scene-ui-indicator" cx={x + 13} cy={y + 19.5} r="3" />
          <text className="scene-ui-copy" x={x + 24} y={y + 23}>{label}</text>
        </g>)}
        <rect className="scene-core" x="197" y="112" width="91" height="77" rx="8" />
        <Mark x={242} y={143} kind="database" />
        <text className="scene-ui-copy scene-centered" x="242" y="174">Sincronizar</text>
      </>}
      {id === "entrega" && <>
        <rect className="scene-module scene-module--raised" x="31" y="66" width="263" height="169" rx="7" />
        <text className="scene-ui-title" x="49" y="92">Operação organizada</text>
        <path className="scene-engraving" d="M31 105H294" />
        {[{ y: 128, title: "Solicitação", meta: "Responsável definido" }, { y: 166, title: "Registro", meta: "Informação atualizada" }, { y: 204, title: "Resposta", meta: "Enviada ao destino" }].map(({ y, title, meta }) => <g key={title}>
          <circle className="scene-check-circle" cx="53" cy={y + 2} r="9" />
          <Mark x={53} y={y + 2} kind="check" />
          <text className="scene-ui-copy" x="72" y={y}>{title}</text>
          <text className="scene-ui-meta" x="72" y={y + 13}>{meta}</text>
          <path className="scene-ui-line" d={`M244 ${y}H274`} />
        </g>)}
        <rect className="scene-module" x="325" y="76" width="120" height="71" rx="6" />
        <Mark x={345} y={99} kind="check" />
        <text className="scene-ui-copy" x="361" y="102">Pronto para agir</text>
        <path className="scene-ui-line" d="M340 119H429 M340 128H415" />
        <path className="scene-track" d="M385 147V245" />
      </>}
    </g>
    <polyline className="scene-track scene-path-base" points={route} />
    <polyline className="scene-path-progress" points={route} pathLength="1" />
    {id !== "origens" && <Port x={layer.route[0].x} y={layer.route[0].y} />}
    {id !== "entrega" && <Port x={layer.route[layer.route.length - 1].x} y={layer.route[layer.route.length - 1].y} />}
    <g className="scene-fasteners">
      {[[13,13],[467,13],[13,287],[467,287]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" />)}
    </g>
  </svg>;
}
