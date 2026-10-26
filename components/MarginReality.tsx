import { hiddenCost, marginReality } from "@/content/site";

function CostMark({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {index === 0 && <><rect x="9" y="13" width="19" height="25" /><rect x="35" y="28" width="19" height="25" /><path d="M35 13h19v8M9 45v8h19M28 25h7v15" /></>}
      {index === 1 && <><path d="M12 16h33M12 30h33M12 44h20" /><circle cx="43" cy="43" r="12" /><path d="m38 43 4 4 7-8" /></>}
      {index === 2 && <><path d="M16 23a20 20 0 1 1-2 22M16 23V10M16 23h13" /><path d="M27 27h13v13H27z" /></>}
      {index === 3 && <><rect x="6" y="20" width="18" height="26" /><rect x="40" y="20" width="18" height="26" /><path d="M24 33h7m5 0h4M30 24l5 18" /></>}
    </svg>
  );
}

export function MarginReality() {
  return (
    <section id="custo" className="margin-section" aria-labelledby="margem-title">
      <div className="wrap">
        <div className="cost-intro">
          <h2 id="margem-title" className="display-lg">{marginReality.title}</h2>
          <p className="lede">{marginReality.text}</p>
        </div>
        <ul className="cost-list">
          {hiddenCost.items.map((item, index) => (
            <li key={item.n} className="cost-item">
              <CostMark index={index} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
        <div className="margin-principle">
          <p>O próximo passo é conectar o que já existe.</p>
          <div className="margin-formula" aria-label="Relação conceitual: receita menos custos da operação resulta em margem. Sem estimativa de valores.">
            <span>Receita</span><b aria-hidden="true">−</b><span>Custo operacional</span><b aria-hidden="true">=</b><strong>Margem</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
