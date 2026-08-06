import { ReactNode } from "react";
import type { Role } from "@/shared/types/domain";

export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RequireRole({
  children,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  return <>{children}</>;
}
