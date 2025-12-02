import React from 'react';

export default function MapFileUploader({ onJsonLoaded }: { onJsonLoaded?: (data: unknown) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [saved, setSaved] = React.useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('itt_saved_maps');
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const persistList = (list: Array<{ id: string; name: string }>) => {
    setSaved(list);
    try { localStorage.setItem('itt_saved_maps', JSON.stringify(list)); } catch {}
  };

  const openDialog = () => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    if (!file) return;
    const lower = file.name.toLowerCase();
    try {
      setIsProcessing(true);
      if (lower.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const id = `${file.name.replace(/\.[^/.]+$/, '')}_${Date.now().toString(36)}`;
        try { localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(parsed)); } catch {}
        persistList([{ id, name: file.name }, ...saved.filter(s => s.id !== id)].slice(0, 50));
        onJsonLoaded?.(parsed);
      } else if (lower.endsWith('.w3e')) {
        const arrayBuf = await file.arrayBuffer();
        const [{ Buffer }, wc3] = await Promise.all([
          import('buffer'),
          import('wc3maptranslator'),
        ]);
        const { TerrainTranslator } = wc3 as unknown as { TerrainTranslator: { warToJson: (buf: Buffer) => { json: unknown } } };
        const buf = Buffer.from(arrayBuf);
        const result = TerrainTranslator.warToJson(buf);
        if (!result || !('json' in result)) throw new Error('Translator returned no JSON');
        const parsed = result.json;
        const id = `${file.name.replace(/\.[^/.]+$/, '')}_${Date.now().toString(36)}`;
        try { localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(parsed)); } catch {}
        persistList([{ id, name: file.name }, ...saved.filter(s => s.id !== id)].slice(0, 50));
        onJsonLoaded?.(parsed);
      } else {
        console.warn('Unsupported file type:', file.name);
      }
    } catch (err) {
      console.error('Failed to process file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 text-gray-200">
      <h2 className="font-medieval-brand text-2xl mb-3">Upload Map</h2>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".w3e,.json"
          className="hidden"
          onChange={handleChange}
        />
        <button className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded disabled:opacity-50" onClick={openDialog} disabled={isProcessing}>
          {isProcessing ? 'Processing…' : 'Choose File'}
        </button>
        <span className="text-sm text-gray-400">.w3e or .json</span>
        {fileName && <span className="text-sm text-amber-300 truncate max-w-[16rem]" title={fileName}>{fileName}</span>}
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Saved Maps</div>
        {saved.length === 0 ? (
          <div className="text-sm text-gray-400">No saved maps yet</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {saved.map((s) => (
              <li key={s.id} className="flex items-center justify-between bg-black/20 border border-amber-500/20 rounded px-2 py-1">
                <span className="truncate mr-2" title={s.name}>{s.name}</span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-0.5 bg-gray-700 text-white rounded" onClick={() => {
                    try {
                      const raw = localStorage.getItem(`itt_map_data_${s.id}`);
                      if (raw) onJsonLoaded?.(JSON.parse(raw));
                    } catch {}
                  }}>Load</button>
                  <button className="px-2 py-0.5 bg-red-700 text-white rounded" onClick={() => {
                    try { localStorage.removeItem(`itt_map_data_${s.id}`); } catch {}
                    persistList(saved.filter(x => x.id !== s.id));
                  }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}



