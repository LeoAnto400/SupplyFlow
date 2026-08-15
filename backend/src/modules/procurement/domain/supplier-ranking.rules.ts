// Pure, framework-free business rule implementing the "backend decides"
// half of the AI Philosophy in docs/architecture.md — a candidate supplier
// is ranked from structured contract terms alone, with zero LLM/AI
// involvement, so it's unit-testable and auditable. When the AI Assistant
// module is built, its RAG step only *explains* whichever candidate this
// function ranks first; it never overrides the ranking.
export interface SupplierCandidate {
  supplierId: string;
  supplierProductId: string;
  price: number;
  leadTimeDays: number;
  minOrderQty: number;
  // 0-100 — higher is better.
  reliabilityScore: number;
}

export interface RankedSupplierCandidate extends SupplierCandidate {
  score: number;
}

// Reliability weighted slightly above price and lead time — a supplier that
// reliably delivers matters more than shaving cost/time at MVP scale.
const WEIGHTS = { reliability: 0.4, price: 0.35, leadTime: 0.25 };

export function rankSupplierCandidates(candidates: SupplierCandidate[]): RankedSupplierCandidate[] {
  if (candidates.length === 0) {
    return [];
  }

  const prices = candidates.map((candidate) => candidate.price);
  const leadTimes = candidates.map((candidate) => candidate.leadTimeDays);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minLeadTime = Math.min(...leadTimes);
  const maxLeadTime = Math.max(...leadTimes);

  // Lower is better for price/lead time, so the normalization is inverted:
  // the cheapest/fastest candidate scores 1, the worst scores 0.
  const normalizeInverted = (value: number, min: number, max: number): number =>
    max === min ? 1 : (max - value) / (max - min);

  const scored = candidates.map((candidate) => {
    const priceScore = normalizeInverted(candidate.price, minPrice, maxPrice);
    const leadTimeScore = normalizeInverted(candidate.leadTimeDays, minLeadTime, maxLeadTime);
    const reliabilityScore = candidate.reliabilityScore / 100;

    const score =
      reliabilityScore * WEIGHTS.reliability +
      priceScore * WEIGHTS.price +
      leadTimeScore * WEIGHTS.leadTime;

    return { ...candidate, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}
