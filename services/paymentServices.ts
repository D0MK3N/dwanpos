
// Mendapatkan status pembayaran PayPal berdasarkan orderId
export async function checkPaymentStatus(orderId: string): Promise<{ status: string }> {
	try {
		const res = await fetch(`/api/payment/paypal/order-status/${orderId}`);
		if (!res.ok) throw new Error('Failed to fetch payment status');
		const data = await res.json();
		// PayPal API returns status in 'status' field (e.g., COMPLETED, APPROVED, CREATED)
		return { status: data.status || 'UNKNOWN' };
	} catch (error) {
		return { status: 'error' };
	}
}
