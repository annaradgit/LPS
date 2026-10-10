export type PaymentResult = {
  success: boolean;
  paymentId?: string;
  message: string;
};

/**
 * Demo payment adapter.
 * Production: create a PaymentIntent on your server and use Stripe PaymentSheet.
 */
export async function payInvoice(
  ticketId: string,
  amount: number,
): Promise<PaymentResult> {
  await new Promise(resolve => setTimeout(resolve, 900));
  return {
    success: true,
    paymentId: `demo_${ticketId}_${Math.round(amount * 100)}`,
    message: 'Payment successful',
  };
}