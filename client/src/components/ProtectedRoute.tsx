import { Navigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div className="h-screen bg-black" />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

