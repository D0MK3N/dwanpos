// Get last Tripay payment for a specific user
export async function getLastTripayPaymentByUser(userId: string): Promise<any> {
  try {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`/api/payments/tripay/status/last?user_id=${userId}`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error('💥 Error getting last Tripay payment by user:', error);
    throw error;
  }
  // File ini sudah tidak digunakan karena endpoint Tripay sudah dihapus
  }
