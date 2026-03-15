export const PLAN_LIMITS = {
  STARTER: {
    maxRouters: 3,
    maxHotspotUsers: 50,
    maxVouchersPerMonth: 5000,
    priceUSD: 9,
  },
  PRO: {
    maxRouters: 10,
    maxHotspotUsers: -1, // unlimited
    maxVouchersPerMonth: -1,
    priceUSD: 29,
  },
  ENTERPRISE: {
    maxRouters: -1,
    maxHotspotUsers: -1,
    maxVouchersPerMonth: -1,
    priceUSD: 79,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
