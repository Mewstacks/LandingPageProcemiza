export type Client = {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  displayWidth: number;
  mobileDisplayWidth: number;
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
    displayWidth: 88,
    mobileDisplayWidth: 76,
    alt: "Di Bracco Enopizzeria",
    source: "https://linktr.ee/DiBraccoEnopizzeria",
  },
  {
    id: "roselar",
    name: "Roselar Móveis",
    image: "/media/procemiza/clients/roselar.webp",
    width: 600,
    height: 187,
    displayWidth: 204,
    mobileDisplayWidth: 184,
    alt: "Roselar Móveis",
    source: "https://roselar.com.br/",
  },
  {
    id: "fedrizzi",
    name: "Fedrizzi Contabilidade & Consultoria",
    image: "/media/procemiza/clients/fedrizzi.webp",
    width: 600,
    height: 417,
    displayWidth: 128,
    mobileDisplayWidth: 112,
    alt: "Fedrizzi Contabilidade & Consultoria",
    source: "https://fedrizzicontabilidade.com.br/",
  },
  {
    id: "rafael-pandolfo",
    name: "Rafael Pandolfo Advogados Associados",
    image: "/media/procemiza/clients/rafael-pandolfo.webp",
    width: 800,
    height: 281,
    displayWidth: 352,
    mobileDisplayWidth: 304,
    alt: "Rafael Pandolfo Advogados Associados",
    source: "https://www.rafaelpandolfo.com.br/",
  },
  {
    id: "crescer-rh",
    name: "Crescer Consultoria em RH",
    image: "/media/procemiza/clients/crescer-rh.webp",
    width: 249,
    height: 45,
    displayWidth: 224,
    mobileDisplayWidth: 208,
    alt: "Crescer Consultoria em RH",
    source: "https://www.crescerconsultoriarh.com.br/",
  },
  {
    id: "miolo",
    name: "Miolo",
    image: "/media/procemiza/clients/miolo.webp",
    width: 600,
    height: 195,
    displayWidth: 168,
    mobileDisplayWidth: 152,
    alt: "Miolo Wine Group",
    source: "https://institucional.miolo.com.br/",
  },
];
