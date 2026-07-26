import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: string;
}

const storage = new AsyncLocalStorage<TenantContext>();

export function runWithTenantContext<T>(context: TenantContext, fn: () => T): T {
  return storage.run(context, fn);
}

// Throws rather than silently returning undefined: any repository call made
// outside an authenticated request is a bug, not a valid "no tenant" state.
export function getTenantContext(): TenantContext {
  const context = storage.getStore();

  if (!context) {
    throw new Error("Tenant context accessed outside of an authenticated request");
  }

  return context;
}
