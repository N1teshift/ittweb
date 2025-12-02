type Props = {
  level1: { str: number; agi: number; int: number; hp: number; mana: number; ms: number; atkSpd: number };
  growth: { str: number; agi: number; int: number };
  msOffset: number;
  perLevelMsBonus?: number;
};

export default function StatsCard({ level1, growth, msOffset, perLevelMsBonus = 7 }: Props) {
  return (
    <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 mb-6">
      <h2 className="font-medieval-brand text-2xl mb-3">Level 1 Stats</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-gray-300">
        <div>
          <div>Strength: {level1.str}</div>
          <div>Agility: {level1.agi}</div>
          <div>Intelligence: {level1.int}</div>
        </div>
        <div>
          <div>HP: {level1.hp}</div>
          <div>Mana: {level1.mana}</div>
          <div>Move Speed: {level1.ms}</div>
          <div>Attack Speed: {level1.atkSpd}</div>
        </div>
      </div>
      <h3 className="mt-4 font-medieval-brand text-xl">Growth per Level</h3>
      <div className="text-gray-300">+{growth.str} Str, +{growth.agi} Agi, +{growth.int} Int</div>
      <h3 className="mt-4 font-medieval-brand text-xl">Movement Speed Scaling</h3>
      <div className="text-gray-300">
        Per level bonus: +{perLevelMsBonus} move speed. Effective bonus at level L: {perLevelMsBonus} × (L + {msOffset}). At level 1: +
        {perLevelMsBonus * (1 + msOffset)}.
      </div>
    </section>
  );
}



