import { solutions, type Solution } from "@/content/solutions";
import "./clients-solutions.css";

function ProcessIcon({ type }: { type: "document" | "check" | "connection" | "grid" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {type === "document" && <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 12h6M9 16h6" /></>}
      {type === "check" && <><circle cx="12" cy="12" r="8.5" /><path d="m8 12 2.7 2.7 5.3-5.4" /></>}
      {type === "connection" && <><rect x="2.5" y="3" width="6" height="6" rx="1" /><rect x="15.5" y="15" width="6" height="6" rx="1" /><path d="M8.5 6H16a3 3 0 0 1 3 3v6M5.5 9v6a3 3 0 0 0 3 3h7" /></>}
      {type === "grid" && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></>}
    </svg>
  );
}

function AutomationDemo() {
  return (
    <div className="automation-demo">
      <div className="demo-request">
        <div className="demo-request-heading"><ProcessIcon type="document" /><span>Nova solicitação</span><span className="demo-small-label">Entrada</span></div>
        <div className="demo-request-body"><span>Assunto</span><strong>Envio de documento</strong><span className="demo-attachment"><ProcessIcon type="document" /> Documento anexado</span></div>
      </div>
      <span className="demo-flow-line" />
      <div className="demo-validation"><ProcessIcon type="check" /><span>Informações conferidas</span></div>
      <span className="demo-flow-line" />
      <div className="demo-delivery"><span className="demo-delivery-dot" /><div><strong>Tarefa encaminhada</strong><span>Responsável notificado</span></div><ProcessIcon type="check" /></div>
    </div>
  );
}

function IntegrationDemo() {
  return (
    <div className="integration-demo">
      <div className="demo-systems">
        {["Atendimento", "Operação", "Gestão"].map((label, index) => (
          <div className="demo-system" key={label}>
            <span className="demo-system-icon"><ProcessIcon type={index === 0 ? "document" : index === 1 ? "connection" : "grid"} /></span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="demo-manifold"><i /><i /><i /></div>
      <div className="demo-sync"><ProcessIcon type="connection" /><strong>Informação sincronizada</strong><span>Regras de troca definidas</span></div>
      <span className="demo-flow-line" />
      <div className="demo-shared-record"><span>Um pedido compartilhado</span><div><span>Mesmo cadastro</span><span>Mesmo status</span></div></div>
    </div>
  );
}

function BespokeDemo() {
  return (
    <div className="bespoke-demo">
      <div className="demo-app-bar"><span className="demo-app-symbol"><i /><i /><i /></span><strong>Central de operações</strong><span className="demo-app-avatar">P</span></div>
      <div className="demo-app-main">
        <div className="demo-app-title"><strong>Solicitações</strong><span>Visão da equipe</span></div>
        <div className="demo-table">
          <div className="demo-table-row demo-table-head"><span>Solicitação</span><span>Responsável</span><span>Situação</span></div>
          <div className="demo-table-row"><span>Documentos</span><span>Atendimento</span><span className="demo-status demo-status--active">Em revisão</span></div>
          <div className="demo-table-row"><span>Cadastro</span><span>Operação</span><span className="demo-status">Concluído</span></div>
          <div className="demo-table-row"><span>Aprovação</span><span>Gestão</span><span className="demo-status">Pendente</span></div>
        </div>
        <div className="demo-app-note"><ProcessIcon type="check" /><span>Regras e permissões da sua operação</span></div>
      </div>
    </div>
  );
}

export function SolutionVisual({ solution }: { solution: Solution }) {
  return (
    <figure className={`solution-visual solution-visual--${solution.id}`}>
      <div className="solution-visual-heading"><span className="solution-visual-marker" /><p>{solution.visualTitle}</p></div>
      <div className="solution-workbench" aria-hidden="true">
        {solution.id === "automacao" ? <AutomationDemo /> : solution.id === "integracao" ? <IntegrationDemo /> : <BespokeDemo />}
      </div>
      <figcaption><span>{solution.visualCaption}</span><span>Exemplo ilustrativo</span></figcaption>
    </figure>
  );
}

/** Native details keeps every solution available before hydration or without JavaScript. */
export function Solutions() {
  return (
    <section id="solucoes" className="section solutions-section" aria-labelledby="solucoes-title">
      <div className="wrap">
        <div className="solutions-intro">
          <h2 id="solucoes-title" tabIndex={-1} className="display-lg">Sistemas feitos para<br />o trabalho acontecer.</h2>
          <p>Da tarefa que se repete à operação que precisa se conectar. Começamos pelo que faz diferença na sua rotina.</p>
        </div>
        <div className="solutions-layout">
          <div className="solutions-list">
            {solutions.map((solution, index) => (
              <details key={solution.id} name="procemiza-solutions" className="solution-detail" open={index === 0}>
                <summary><h3>{solution.title}</h3><span className="solution-expand" aria-hidden="true" /></summary>
                <div className="solution-description">
                  <p>{solution.description}</p>
                  <p className="solution-example">{solution.example}</p>
                  <div className="solution-mobile-visual"><SolutionVisual solution={solution} /></div>
                </div>
              </details>
            ))}
          </div>
          <div className="solutions-shared-visual" aria-hidden="true">
            {solutions.map((solution, index) => (
              <div key={solution.id} className={`solution-scene solution-scene--${index}`}><SolutionVisual solution={solution} /></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
