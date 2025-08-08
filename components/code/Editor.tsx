"use client";
import { useState } from "react";

export default function Editor({ initial = "" }: { initial?: string }) {
  const [code, setCode] = useState(initial);
  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-64 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm"
        placeholder="// Tu código aquí..."
      />
      <div className="mt-2 text-xs opacity-70">Autosave local (próximo)</div>
    </div>
  );
}
