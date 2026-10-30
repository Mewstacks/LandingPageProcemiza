import Image from "next/image";
import type { CSSProperties } from "react";
import { clients } from "@/content/clients";

/** Papel. Fileira parada: nada rola, nada some. Mesma altura óptica para todas as marcas. */
export function Clients() {
  return (
    <section id="clientes" className="clients theme-light" aria-labelledby="clientes-title">
      <div className="wrap clients-grid">
        <h2 id="clientes-title" className="section-title clients-title" data-reveal>Clientes</h2>
        <ul className="clients-logos" role="list" data-reveal="2">
          {clients.map((client) => (
            <li
              key={client.id}
              className={`client-mark client-mark--${client.id}`}
              style={{ "--mark-h": `${client.markHeight}px`, "--mark-h-sm": `${client.markHeightMobile}px` } as CSSProperties}
            >
              <Image
                src={client.image}
                alt={client.alt}
                width={client.width}
                height={client.height}
                sizes={`${Math.ceil((client.markHeight * client.width) / client.height)}px`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
