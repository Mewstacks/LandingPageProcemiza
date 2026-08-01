import { hiddenCost } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function HiddenCost() {
  return (
    <section className="hidden-cost" aria-labelledby="custo-invisivel">
      <div className="wrap">
        <div className="grid lg:grid-cols-[1fr_0.72fr] gap-8 lg:gap-24 items-end">
          <Reveal>
            <h2 id="custo-invisivel" className="display-lg max-w-[15ch]">{hiddenCost.title}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lede">{hiddenCost.intro}</p>
          </Reveal>
        </div>

        <ol className="hidden-cost-list">
          {hiddenCost.items.map((item, index) => (
            <Reveal as="li" key={item.n} delay={index * 0.035} className="hidden-cost-row">
              <span className="hidden-cost-index">{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
