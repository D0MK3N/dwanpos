"use client";
import { useState, useEffect } from "react";
// import Tripay payment services dihapus karena endpoint sudah tidak tersedia
import { PlanType } from "@/types/payment";
import { useAuth } from "@/contexts/AuthContext";

interface CheckoutModalProps {
  selectedPlan: PlanType;
  onClose: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  userEmail?: string;
  userId?: string;
  billingCycle?: 'monthly' | 'yearly';
  currency?: 'IDR';
  planPrice?: number;
  onPaymentSuccess?: (orderId: string, plan: PlanType) => void;
}

export default function CheckoutModal({
  selectedPlan,
  onClose,
  isProcessing,
  setIsProcessing,
  userEmail,
  userId,
  billingCycle,
  currency = 'IDR',
  planPrice,
  onPaymentSuccess
}: CheckoutModalProps) {
  const [error, setError] = useState<string>("");
  const { user, updateUserPlan } = useAuth();
  // Tripay logic dihapus karena endpoint sudah tidak tersedia

  // Dummy paymentStatus state to fix 'Cannot find name paymentStatus'
  const [paymentStatus, setPaymentStatus] = useState<{ status: 'idle' | 'completed' | 'failed' }>({ status: 'idle' });

  // ...existing code...

  // Only IDR, so no need for exchange rate logic

  const planDetails = {
    free: {
      name: "Free",
      priceIDR: 0,
      period: "month",
      description: "Perfect for getting started"
    },
    standard: {
      name: "Standard",
      priceIDR: planPrice || 30000,
      period: "month",
      description: "Perfect for regular creators"
    },
    premium: {
      name: "Premium",
      priceIDR: planPrice || 60000,
      period: "month",
      description: "For professionals & agencies"
    }
  };

  const currentPlan = planDetails[selectedPlan];
  const cycle = billingCycle || 'monthly';
  const computeAmount = (baseMonthly: number) => {
    if (cycle === 'monthly') return baseMonthly;
    // Yearly: 10x monthly with 20% discount = 8x monthly price
    return +(baseMonthly * 10 * 0.8).toFixed(0);
  };

  const finalAmount = computeAmount(currentPlan.priceIDR);

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };


  // Tripay payment handler dihapus karena endpoint sudah tidak tersedia

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl max-w-2xl w-full border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Complete Your Purchase</h2>
              <p className="text-gray-300 text-sm">Pembayaran hanya melalui Tripay (IDR)</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plan Summary Card */}
        <div className="p-8 border-b border-gray-700">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl">
                  {selectedPlan === 'standard' ? '⚡' : '👑'}
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-white">{currentPlan.name} Plan</h3>
                  <p className="text-gray-300 text-sm">{currentPlan.description}</p>
                  {userEmail && <p className="text-blue-400 text-xs mt-1">📧 {userEmail}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatCurrency(finalAmount)}
                </div>
                <div className="text-gray-400 text-sm font-medium mt-1">
                  {cycle === 'monthly' ? '/ bulan' : '/ tahun'}
                  {cycle === 'yearly' && <span className="text-green-400 text-xs ml-1">💰 Hemat 20%</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          {/* Success Message */}
          {paymentStatus.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-bounce">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>✅ Pembayaran berhasil! Paket Anda akan segera aktif.</div>
            </div>
          )}

          {/* Tripay Payment Button */}
          {/* Tombol pembayaran Tripay dihapus karena endpoint sudah tidak tersedia */}

          {/* Status Info */}
          {/* Status pembayaran Tripay dihapus karena endpoint sudah tidak tersedia */}

          {/* Security Badge */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secured by SSL encryption • Your data is safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

