import { useEffect, useState } from "react";
import { authClient } from "./lib/auth-client";

const API = import.meta.env.VITE_API_URL;

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isSignUp) {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error?.message) setError(error.message);
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error?.message) setError(error.message);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg w-80 space-y-4">
        <h1 className="text-xl font-semibold">{isSignUp ? "Sign Up" : "Sign In"}</h1>
        {isSignUp && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-zinc-700 py-2 rounded hover:bg-zinc-600">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-zinc-400 text-sm">
          {isSignUp ? "Have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const { data: session, isPending } = authClient.useSession();
  const [entries, setEntries] = useState<{ id: number; content: string; userName: string | null }[]>([]);
  const [input, setInput] = useState("");

  const load = () => fetch(`${API}/entries`, { credentials: "include" }).then((r) => r.json()).then(setEntries);

  useEffect(() => { 
    if (session) load(); 
  }, [session]);

  const submit = async () => {
    if (!input.trim()) return;
    await fetch(`${API}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: input }),
    });
    setInput("");
    load();
  };

  if (isPending) return <div className="h-screen bg-black" />;
  if (!session) return <AuthForm />;

  return (
    <div className="h-screen bg-black text-white flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-zinc-400">{session.user.email}</span>
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

