// Port for pushing a real-time event to everyone connected for an
// organization. Implemented by the Socket.IO gateway in
// src/plugins/socket-gateway.ts — kept here (not there) so this module's
// application layer depends on an interface it owns, not on the plugin.
export interface RealtimeGateway {
  emitToOrganization<TPayload>(organizationId: string, eventName: string, payload: TPayload): void;
}
