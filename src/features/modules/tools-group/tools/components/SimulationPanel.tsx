import React from 'react';

export default function SimulationPanel() {
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 md:p-6 w-full">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="font-medieval-brand text-xl">Simulation</h3>
      </div>
      <div className="text-gray-300 text-sm">
        Configure and run duel simulations here. (Coming soon)
      </div>
    </div>
  );
}



