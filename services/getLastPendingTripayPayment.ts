// Get last pending Tripay payment for a user
export async function getLastPendingTripayPayment(userId: string): Promise<any> {
  try {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`/api/payments/tripay/status/last?user_id=${userId}`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
  // File ini sudah tidak digunakan karena endpoint Tripay sudah dihapus
    return await response.json();
