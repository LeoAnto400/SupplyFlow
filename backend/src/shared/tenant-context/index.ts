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

// Used from the auth-guard preHandler: sets the context for the rest of this
// request's async continuation without needing to nest the remaining
// lifecycle (route handler, etc.) inside a callback the way .run() requires.
export function enterTenantContext(context: TenantContext): void {
  storage.enterWith(context);
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
