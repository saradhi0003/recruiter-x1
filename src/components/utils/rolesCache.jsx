import { Role } from "@/entities/Role";

// Simple in-memory cache with 15-minute TTL (reduced API calls further)
let cache = { ts: 0, data: null };
const TTL = 15 * 60 * 1000;

export async function getRolesCached() {
  const now = Date.now();
  if (cache.data && now - cache.ts < TTL) return cache.data;
  const list = await Role.list();
  cache = { ts: now, data: list };
  return list;
}

export function invalidateRolesCache() {
  cache = { ts: 0, data: null };
}