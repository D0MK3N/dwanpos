"use client";

import { useAuth } from "@/contexts/AuthContext";

interface ProtectedLinkProps {
  children: React.ReactNode;
  plan: "standard" | "premium";
  onClick?: () => void;
}

export default function ProtectedLink({ children, plan, onClick }: ProtectedLinkProps) {
  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }
  };

  return (
    <div onClick={handleClick} className="w-full">
      {children}
    </div>
  );
}