"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedLinkProps {
  children: React.ReactNode;
  plan: "standard" | "premium";
  className?: string;
  onUnauthenticated?: () => void;
}

export default function ProtectedLink({ 
  children, 
  plan, 
  className = "",
  onUnauthenticated 
}: ProtectedLinkProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        // Redirect ke login page
        router.push('/login');
      }
    } else {
      // Jika user sudah login, redirect ke homepage/frontend
      router.push('/');
    }
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
}