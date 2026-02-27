export type PlanType = "free" | "standard" | "premium";

export interface PlanDetails {
  name: string;
  price: number;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CreateOrderRequest {
  plan: PlanType;
  amount: number;
  currency: string;
}

// (removed: PaymentStatusType interface)
  status: 'created' | 'approved' | 'completed' | 'failed';
  orderId?: string;
  message?: string;
}

// Tambahkan interface untuk PayPal button actions
export interface PayPalButtonCreateOrderData {
  orderID: string;
}

export interface PayPalButtonApproveData {
  orderID: string;
  payerID?: string;
  paymentID?: string;
  billingToken?: string;
  facilitatorAccessToken: string;
}