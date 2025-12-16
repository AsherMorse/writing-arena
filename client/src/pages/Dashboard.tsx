import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";

type Entry = { id: number; content: string; userName: string | null };

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");

  const load = () => api<Entry[]>("/entries").then(setEntries);

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!input.trim()) return;
    await api("/entries", { method: "POST", body: { content: input } });
    setInput("");
    load();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-zinc-400">{session?.user.email}</span>
        <button onClick={() => authClient.signOut()} className="text-zinc-400 hover:text-white">Sign out</button>
      </div>
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

