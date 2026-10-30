import Link from "next/link";
import { solutions } from "@/content/solutions";

/** Laranja. Só tipografia: o nome de cada solução, o que ela muda e o caminho para a página. */
export function Solutions() {
  return (
    <section id="solucoes" className="solutions theme-orange" aria-labelledby="solucoes-title">
      <div className="wrap">
        <h2 id="solucoes-title" className="solutions-title">Soluções</h2>
        <ul className="solutions-list" role="list">
          {solutions.map((solution) => (
            <li key={solution.id} className="solution">
              <h3>{solution.title}</h3>
              <div className="solution-body">
                <p className="solution-line">{solution.line}</p>
                <p className="solution-example">{solution.example}</p>
                <Link href={solution.href} className="text-link">
                  Ver mais<span className="sr-only"> sobre {solution.title}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
