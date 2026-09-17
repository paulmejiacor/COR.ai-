export type PlanId = 'free' | 'pro' | 'dealer' | 'enterprise';

export interface Plan {
  id: PlanId;
  label: string;
  monthlyGenerations: number;
  maxExportResolution: number;
  advancedTemplates: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: { id: 'free', label: 'Free', monthlyGenerations: 10, maxExportResolution: 1080, advancedTemplates: false },
  pro: { id: 'pro', label: 'Pro', monthlyGenerations: 200, maxExportResolution: 4096, advancedTemplates: true },
  dealer: { id: 'dealer', label: 'Dealer', monthlyGenerations: 1000, maxExportResolution: 4096, advancedTemplates: true },
  enterprise: { id: 'enterprise', label: 'Enterprise', monthlyGenerations: Infinity, maxExportResolution: 8192, advancedTemplates: true },
};

export interface User {
  id: string;
  name: string;
  email: string;
  planId: PlanId;
}

export interface CreditBalance {
  userId: string;
  remaining: number;
  resetsAt: string;
}
