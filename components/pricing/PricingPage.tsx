"use client";

import { useState, useEffect } from "react";
import { PlanType } from "@/types/payment";
import CheckoutModal from "./CheckoutModal";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
// import LoginModal from "./LoginModal";
// import { useAuth } from "@/contexts/AuthContext";

interface ApiPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

const PRICING = {
  standard: 30000,
  premium: 60000
};

const planFeatures: Record<string, { features: string[]; highlight?: boolean }> = {
  free: {
    features: [
      "1 Outlet & 1 User",
      "Transaksi Penjualan Dasar",
      "Laporan Penjualan Sederhana",
      "Manajemen Stok Dasar",
      "Support via Email"
    ]
  },
  standard: {
    features: [
      "Multi Outlet & Multi User",
      "Laporan Penjualan & Stok Lengkap",
      "Integrasi Pembayaran Digital (QRIS, e-wallet, kartu)",
      "Manajemen Diskon & Promo",
      "Support Chat & Email",
      "Export Data ke Excel",
      "Backup Data Otomatis"
    ],
    highlight: true
  },
  premium: {
    features: [
      "Semua Fitur Standard",
      "Custom Laporan Bisnis",
      "Integrasi Akuntansi",
      "API & Integrasi Eksternal",
      "Training & Support 24/7",
      "Akses Fitur Baru Lebih Dulu",
      "Konsultasi Bisnis Gratis"
    ]
  }
};

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function PricingPage() {
  const [lastTripayStatus, setLastTripayStatus] = useState<string | null>(null);
  const [lastTripayOrderId, setLastTripayOrderId] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  // Cek status pembayaran Tripay terakhir per user
  useEffect(() => {
    if (user?.id) {
      // ...kode pemanggilan Tripay dihapus karena endpoint sudah tidak tersedia
      setLastTripayStatus(null);
      setLastTripayOrderId(null);
    }
  }, [user?.id]);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  // Removed duplicate useAuth destructuring

  useEffect(() => {
    setPlans([
      { id: 'free', name: 'Free', price: 0, currency: 'IDR', description: 'Cocok untuk pemula dan bisnis kecil.' },
      { id: 'standard', name: 'Standard', price: PRICING.standard, currency: 'IDR', description: 'Fitur lengkap untuk bisnis berkembang.' },
      { id: 'premium', name: 'Premium', price: PRICING.premium, currency: 'IDR', description: 'Solusi premium untuk bisnis besar.' }
    ]);
    setPlansLoading(false);
  }, []);

  const calculatePrice = (planKey: 'standard' | 'premium'): number => {
    const monthlyPrice = PRICING[planKey];
    if (billingCycle === 'monthly') return monthlyPrice;
    return Math.round(monthlyPrice * 10 * 0.8);
  };

  const handlePlanSelect = (planId: string) => {
    setConsentError(null);
    setSelectedPlan(planId);
    if (!agreeToTerms || !agreeToPrivacy) {
      setConsentError('Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.');
      return;
    }
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    // Optionally refresh user plan here
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowCheckout(true);
  };

  if (plansLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
    );
  }
  if (plansError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{plansError}</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-2">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-blue-900">Pilih Paket DWAN POS</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">Pilih paket sesuai kebutuhan bisnismu. Pembayaran otomatis via Tripay (IDR). Upgrade kapan saja!</p>
      {/* Status pembayaran Tripay terakhir */}
      {lastTripayStatus && (
        <div className="w-full max-w-5xl mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800 text-sm">
          <b>Status Pembayaran Terakhir:</b> {lastTripayStatus.toUpperCase()} {lastTripayOrderId && <span>(Order ID: {lastTripayOrderId})</span>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-10">
        {plans.map((plan) => {
          const features = planFeatures[plan.id]?.features || [];
          const highlight = planFeatures[plan.id]?.highlight;
          const isCurrent = !!(user && (user.subscription === plan.id || user.plan === plan.id));
          let finalPrice = 0;
          if (plan.id === 'standard') finalPrice = calculatePrice('standard');
          else if (plan.id === 'premium') finalPrice = calculatePrice('premium');
          else if (plan.id === 'free') finalPrice = 0;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border shadow-md p-6 flex flex-col bg-white relative ${highlight ? 'ring-4 ring-blue-400 scale-105 z-10' : ''}`}
            >
              {highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow">Paling Populer</div>}
              <div className="flex flex-col items-center mb-4">
                <div className="font-bold text-xl mb-1 text-blue-800">{plan.name}</div>
                <div className="text-3xl font-extrabold mb-1 text-blue-700">{plan.price === 0 ? 'Rp 0' : formatCurrency(finalPrice)}</div>
                <div className="text-xs text-gray-500 mb-2">{plan.description}</div>
              </div>
              <ul className="text-xs text-gray-700 mb-4 space-y-1">
                {features.map((feature, idx) => <li key={idx} className="flex items-center gap-2"><span className="text-green-500">✔</span>{feature}</li>)}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isProcessing || isCurrent}
                className={`w-full py-2 rounded-lg font-semibold transition text-white ${isCurrent ? 'bg-green-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isCurrent ? '✓ Paket Aktif' : 'Pilih Paket'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="w-full max-w-md mb-8">
        <div id="consent-area" className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
          <label className="inline-flex items-center text-xs text-gray-700">
            <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-400 mr-2" />
            Saya setuju dengan <a href="#" className="underline text-blue-600 ml-1">Syarat & Ketentuan</a>
          </label>
          <label className="inline-flex items-center text-xs text-gray-700">
            <input type="checkbox" checked={agreeToPrivacy} onChange={(e) => setAgreeToPrivacy(e.target.checked)} className="h-4 w-4 rounded border-gray-400 mr-2" />
            Saya setuju dengan <a href="#" className="underline text-blue-600 ml-1">Kebijakan Privasi</a>
          </label>
          {consentError && <div className="text-xs text-red-500 mt-1">{consentError}</div>}
        </div>
      </div>
      {showCheckout && (
        <CheckoutModal
          selectedPlan={selectedPlan as PlanType}
          onClose={() => setShowCheckout(false)}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          userEmail={user?.email}
          userId={user?.id}
          billingCycle={billingCycle}
          currency={"IDR"}
          planPrice={PRICING[selectedPlan as keyof typeof PRICING] || 0}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

