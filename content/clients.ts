export type Client = {
  id: string;
  name: string;
  image: string;
  /** Tamanho intrínseco do arquivo. */
  width: number;
  height: number;
  /** Altura de exibição (px): marcas largas ficam mais baixas, marcas compactas mais altas. */
  markHeight: number;
  markHeightMobile: number;
  alt: string;
  source: string;
};

/** Official client artwork. Source URLs and processing are recorded beside the assets. */
export const clients: readonly Client[] = [
  {
    id: "di-bracco",
    name: "Di Bracco Enopizzeria",
    image: "/media/procemiza/clients/di-bracco.webp",
    width: 400,
    height: 400,
    markHeight: 56,
    markHeightMobile: 48,
    alt: "Di Bracco Enopizzeria",
    source: "https://linktr.ee/DiBraccoEnopizzeria",
  },
  {
    id: "roselar",
    name: "Roselar Móveis",
    image: "/media/procemiza/clients/roselar.webp",
    width: 600,
    height: 187,
    markHeight: 40,
    markHeightMobile: 34,
    alt: "Roselar Móveis",
    source: "https://roselar.com.br/",
  },
  {
    id: "fedrizzi",
    name: "Fedrizzi Contabilidade & Consultoria",
    image: "/media/procemiza/clients/fedrizzi.webp",
    width: 600,
    height: 417,
    markHeight: 52,
    markHeightMobile: 44,
    alt: "Fedrizzi Contabilidade & Consultoria",
    source: "https://fedrizzicontabilidade.com.br/",
  },
  {
    id: "rafael-pandolfo",
    name: "Rafael Pandolfo Advogados Associados",
    image: "/media/procemiza/clients/rafael-pandolfo.webp",
    width: 800,
    height: 281,
    markHeight: 54,
    markHeightMobile: 46,
    alt: "Rafael Pandolfo Advogados Associados",
    source: "https://www.rafaelpandolfo.com.br/",
  },
  {
    id: "crescer-rh",
    name: "Crescer Consultoria em RH",
    image: "/media/procemiza/clients/crescer-rh.webp",
    width: 249,
    height: 45,
    markHeight: 32,
    markHeightMobile: 28,
    alt: "Crescer Consultoria em RH",
    source: "https://www.crescerconsultoriarh.com.br/",
  },
  {
    id: "miolo",
    name: "Miolo",
    image: "/media/procemiza/clients/miolo.webp",
    width: 600,
    height: 195,
    markHeight: 40,
    markHeightMobile: 34,
    alt: "Miolo Wine Group",
    source: "https://institucional.miolo.com.br/",
  },
  {
    id: "eletrovoltz",
    name: "EletroVoltz",
    image: "/media/procemiza/clients/eletrovoltz.webp",
    width: 235,
    height: 44,
    markHeight: 34,
    markHeightMobile: 28,
    alt: "EletroVoltz Sistemas de PPCI",
    source: "https://eletrovoltz.com/",
  },
  {
    id: "flores-tintas",
    name: "Flores Tintas",
    image: "/media/procemiza/clients/flores-tintas.webp",
    width: 800,
    height: 201,
    markHeight: 44,
    markHeightMobile: 38,
    alt: "Flores Tintas",
    source: "https://www.florestintas.com.br/",
  },
];
