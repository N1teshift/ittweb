import React from 'react';

export default function FormHeader({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <h2 className="font-medieval-brand text-3xl mb-6 text-center">
      {mode === 'create' ? 'Add to Archives' : 'Edit Archive Entry'}
    </h2>
  );
}




