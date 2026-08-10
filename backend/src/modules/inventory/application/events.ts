// Published on the shared in-process EventBus when a stock movement leaves a
// product below its safety threshold — see docs/architecture.md §10. The
// Notifications module (not yet built) will subscribe to this.
export const LOW_STOCK_DETECTED_EVENT = "inventory.low-stock-detected";

export interface LowStockDetectedEvent {
  organizationId: string;
  productId: string;
  productName: string;
  quantity: number;
  safetyThreshold: number;
}
