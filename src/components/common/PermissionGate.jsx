import React from "react";
import { usePermissions } from "./PermissionsContext";

export default function PermissionGate({ entity, action = "view", record = null, children, fallback = null }) {
  const { can } = usePermissions();
  if (!can(entity, action, record)) return fallback;
  return <>{children}</>;
}