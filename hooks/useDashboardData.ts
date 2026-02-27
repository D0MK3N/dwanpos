// hooks/useDashboardData.ts
"use client";

import { useState, useEffect } from "react";
import type { Payment, UserSubscription, PricingOverview } from "@/types/dashboard";

interface DashboardData {
  payments: Payment[];
  subscriptions: UserSubscription[];
  pricingOverview: PricingOverview;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(apiUrl: string = "http://localhost:8080"): DashboardData {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [pricingOverview, setPricingOverview] = useState<PricingOverview>({
    free: 0,
    standard: 0,
    premium: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch dari backend Go
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [paymentsRes, subscriptionsRes] = await Promise.all([
          fetch(`${apiUrl}/api/payments/history`, { headers }),
          fetch(`${apiUrl}/api/subscriptions`, { headers })
        ]);

        if (!paymentsRes.ok || !subscriptionsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const paymentsData = await paymentsRes.json();
        const subscriptionsData = await subscriptionsRes.json();

        // Handle response data
        const paymentsList: Payment[] = paymentsData?.data || paymentsData || [];
        const subscriptionsList: UserSubscription[] = subscriptionsData?.data || subscriptionsData || [];

        // Set transactions
        setPayments(paymentsList);

        // Set subscriptions
        setSubscriptions(subscriptionsList);

        // Hitung Pricing Overview dari subscriptions
        const overview: PricingOverview = { free: 0, standard: 0, premium: 0, totalRevenue: 0 };
        subscriptionsList.forEach((sub) => {
          if (sub.plan_type === "free") {
            overview.free++;
          } else if (sub.plan_type === "standard") {
            overview.standard++;
            overview.totalRevenue += 50000; // Harga standard plan
          } else if (sub.plan_type === "premium") {
            overview.premium++;
            overview.totalRevenue += 120000; // Harga premium plan
          }
        });
        setPricingOverview(overview);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [apiUrl]);

  return {
    payments,
    subscriptions,
    pricingOverview,
    loading,
    error
  };
}
