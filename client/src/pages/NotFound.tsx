import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-zinc-400 mb-4">Page not found</p>
      <Link to="/" className="text-zinc-400 hover:text-white">Go home</Link>
    </div>
  );
}

