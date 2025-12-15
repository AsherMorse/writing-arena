import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const [entries, setEntries] = useState<{ id: number; content: string; userName: string | null }[]>([]);

  useEffect(() => {
    fetch(`${API}/entries`).then((r) => r.json()).then(setEntries);
  }, []);

  return (
    <div className="h-screen bg-black text-white flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Entries</h1>
        <Link to="/login" className="text-zinc-400 hover:text-white">Sign in</Link>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {entries.map((e) => (
          <div key={e.id} className="bg-zinc-900 px-3 py-2 rounded flex justify-between">
            <span>{e.content}</span>
            <span className="text-zinc-500 text-sm">{e.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

