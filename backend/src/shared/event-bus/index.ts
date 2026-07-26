import { EventEmitter } from "node:events";

// Generic port. Modules depend on this interface only, so the in-process
// implementation below can be swapped for a broker-backed one later
// (see docs/architecture.md, section 13) without touching module code.
export interface EventBus {
  publish<TPayload>(eventName: string, payload: TPayload): void;
  subscribe<TPayload>(eventName: string, handler: (payload: TPayload) => void | Promise<void>): void;
}

class InProcessEventBus implements EventBus {
  private readonly emitter = new EventEmitter();

  publish<TPayload>(eventName: string, payload: TPayload): void {
    this.emitter.emit(eventName, payload);
  }

  subscribe<TPayload>(eventName: string, handler: (payload: TPayload) => void | Promise<void>): void {
    this.emitter.on(eventName, handler);
  }
}

export const eventBus: EventBus = new InProcessEventBus();
