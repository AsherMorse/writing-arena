import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export default function Login() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isPending) return <div className="h-screen bg-black" />;
  if (session) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await authClient.signIn.email({ email, password });
    if (error?.message) setError(error.message);
  };

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg w-80 space-y-4">
        <h1 className="text-xl font-semibold">Sign In</h1>
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
          Sign In
        </button>
        <Link to="/signup" className="block text-center text-zinc-400 text-sm">
          Need an account? Sign up
        </Link>
      </form>
    </div>
  );
}

