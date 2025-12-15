import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [entries, setEntries] = useState<{ id: number; content: string }[]>([]);
  const [input, setInput] = useState("");

  const load = () => fetch(`${API}/entries`).then((r) => r.json()).then(setEntries);

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!input.trim()) return;
    await fetch(`${API}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    setInput("");
    load();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col p-4">
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type something..."
          className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded"
        />
        <button onClick={submit} className="bg-zinc-800 px-4 py-2 rounded">Add</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {entries.map((e) => <div key={e.id} className="bg-zinc-900 px-3 py-2 rounded">{e.content}</div>)}
      </div>
    </div>
  );
}

