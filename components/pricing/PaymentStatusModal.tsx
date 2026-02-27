"use client";

import { useEffect, useState } from 'react';
import { checkPaymentStatus } from '@/services/paymentServices';

interface PaymentStatusModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentStatusModal({ orderId, isOpen, onClose }: PaymentStatusModalProps) {
  const [status, setStatus] = useState<string>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      checkStatus();
    }
  }, [isOpen, orderId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const result = await checkPaymentStatus(orderId);
      setStatus(result.status);
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          message: 'Payment Completed Successfully!',
          icon: '✅'
        };
      case 'APPROVED':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          message: 'Payment Approved',
          icon: '⏳'
        };
      case 'CREATED':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          message: 'Payment Created',
          icon: '🔄'
        };
      case 'error':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          message: 'Error Checking Status',
          icon: '❌'
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          message: 'Unknown Status',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] rounded-2xl max-w-sm w-full border border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4">Payment Status</h3>
        
        <div className={`p-4 rounded-lg ${statusInfo.bgColor} mb-4`}>
          <div className="flex items-center justify-center space-x-3">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-400">Checking status...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">{statusInfo.icon}</span>
                <span className={statusInfo.color}>{statusInfo.message}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mb-4">
          Order ID: {orderId}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={checkStatus}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Refresh
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}