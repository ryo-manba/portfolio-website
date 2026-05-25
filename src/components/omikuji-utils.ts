export type OmikujiResult =
  | "daikichi"
  | "chu-kichi"
  | "sho-kichi"
  | "kichi"
  | "kyo"
  | "daikyo";

export type OmikujiCard = {
  key: OmikujiResult;
  label: string;
  src: string;
  weight: number;
};

export const OMIKUJI_CARDS: ReadonlyArray<OmikujiCard> = [
  { key: "daikichi", label: "大吉", src: "/assets/omikuji/daikichi.png", weight: 0.3 },
  { key: "chu-kichi", label: "中吉", src: "/assets/omikuji/chu-kichi.png", weight: 0.2 },
  { key: "sho-kichi", label: "小吉", src: "/assets/omikuji/sho-kichi.png", weight: 0.2 },
  { key: "kichi", label: "吉", src: "/assets/omikuji/kichi.png", weight: 0.15 },
  { key: "kyo", label: "凶", src: "/assets/omikuji/kyo.png", weight: 0.1 },
  { key: "daikyo", label: "大凶", src: "/assets/omikuji/daikyo.png", weight: 0.05 },
];

export const pickRandomOmikuji = (random: () => number = Math.random): OmikujiCard => {
  const r = random();
  let cumulative = 0;
  for (const card of OMIKUJI_CARDS) {
    cumulative += card.weight;
    if (r < cumulative) return card;
  }
  return OMIKUJI_CARDS[OMIKUJI_CARDS.length - 1];
};
