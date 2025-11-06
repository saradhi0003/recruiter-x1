
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User as UserEntity } from "@/entities/User";
import { getRolesCached, invalidateRolesCache } from "@/components/utils/rolesCache";

// Default permission if none is configured for a role
const DEFAULT_PERM = { view: false, create: false, update: false, delete: false, scope: "own" };

const Ctx = createContext({
  me: null,
  role: null,
  isAdmin: false,
  can: () => false,
  scopeFor: () => "own",
  listFilterFor: () => null,
});

export function PermissionsProvider({ children }) {
  const [me, setMe] = useState(null);
  const [role, setRole] = useState(null);

  const loadUserAndRole = async () => {
    const u = await UserEntity.me().catch(() => null);
    setMe(u);
    if (u?.role_id) {
      const roles = await getRolesCached().catch(() => []); // Added .catch(() => []) for robustness
      setRole(roles.find(r => r.id === u.role_id) || null);
    } else {
      setRole(null);
    }
  };

  useEffect(() => { loadUserAndRole(); }, []);

  // Live-update roles when Access Control saves and broadcasts a cache-bust signal
  useEffect(() => {
    const onStorage = async (e) => {
      if (e.key === "roles_cache_bust") {
        invalidateRolesCache();
        await loadUserAndRole();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAdmin = useMemo(() => {
    const byBuiltin = (me?.role || "").toLowerCase() === "admin";
    const byRoleName = (role?.name || "").toLowerCase() === "admin";
    return !!me && (byBuiltin || byRoleName);
  }, [me, role]);

  const permsFor = (entity) => {
    if (isAdmin) return { view: true, create: true, update: true, delete: true, scope: "all" };
    const p = (role?.permissions || {})[entity];
    if (!p) return DEFAULT_PERM;
    return { ...DEFAULT_PERM, ...p };
  };

  const can = (entity, action = "view", record = null) => {
    if (isAdmin) return true;
    const p = permsFor(entity);
    return !!p[action];
  };

  const scopeFor = (entity) => {
    if (isAdmin) return "all";
    const p = permsFor(entity);
    return p.scope || "own";
  };

  // Build filter to enforce scope when listing on the client
  const listFilterFor = (entity) => {
    if (!me) return null;
    const scope = scopeFor(entity);
    if (scope === "all") return null;

    // Entity-specific "own" semantics
    switch (entity) {
      case "Task":
        return { assigned_to: me.email };
      case "Submission":
        return { recruiter_id: me.id };
      // Most entities use created_by ownership
      case "Candidate":
      case "Company":
      case "Job":
      case "Application":
      case "Invoice":
      case "Expense":
      case "Playbook":
      case "Recruiter":
      case "Consultant":
      case "Resume":
      case "EmailTemplate":
      default:
        return { created_by: me.email };
    }
  };

  const value = { me, role, isAdmin, can, scopeFor, listFilterFor };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePermissions() {
  return useContext(Ctx);
}
