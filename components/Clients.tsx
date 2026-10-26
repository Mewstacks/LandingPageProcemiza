import Image from "next/image";
import { clients } from "@/content/clients";
import "./clients-solutions.css";

export function Clients() {
  return (
    <section id="clientes" className="clients-strip" aria-labelledby="clients-title">
      <div className="wrap clients-layout">
        <h2 id="clients-title">Empresas que já trabalham com a Procemiza</h2>
        <ul className="clients-marks" role="list">
          {clients.map((client) => (
            <li key={client.id} className={`client-mark client-mark--${client.id}`}>
              <Image
                src={client.image}
                alt={client.alt}
                width={client.width}
                height={client.height}
                sizes="(max-width: 600px) 160px, 220px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
