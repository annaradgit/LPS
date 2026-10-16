export type PaymentResult = {
  success: boolean;
  paymentId?: string;
  message: string;
};

/**
 * Demo payment adapter.
 * Production: create a PaymentIntent on your server and use Stripe PaymentSheet.
 */
// export async function payInvoice(
//   ticketId: string,
//   amount: number,
// ): Promise<PaymentResult> {
//   await new Promise(resolve => setTimeout(resolve, 900));
//   return {
//     success: true,
//     paymentId: `demo_${ticketId}_${Math.round(amount * 100)}`,
//     message: 'Payment successful',
//   };
// }





// import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

// // Replace with your real backend endpoint
// const API_BASE_URL = 'https://lps-production-319e.up.railway.app';

// export type PaymentResult = {
//   success: boolean;
//   paymentId?: string;
//   message: string;
// };

// /**
//  * Production Payment Adapter
//  * Communicates with your server backend and opens the native Stripe checkout sheet.
//  */
// export async function payInvoice(
//   ticketId: string,
//   amount: number,
// ): Promise<PaymentResult> {
//   try {
//     // 1. Fetch Payment Intent configs from your server
//     const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // 'Authorization': `Bearer ${userToken}`, // Pass your user auth session if required
//       },
//       body: JSON.stringify({
//         ticketId,
//         amount, // Ensure your backend handles currency correctly (Stripe expects cents/pence integers)
//       }),
//     });

//     if (!response.ok) {
//       return { success: false, message: 'Could not communicate with payment server.' };
//     }

//     const { paymentIntentSecret, ephemeralKey, customerId } = await response.json();

//     // 2. Initialize the native mobile Stripe UI sheet
//     const { error: initError } = await initPaymentSheet({
//       merchantDisplayName: 'Your Business Name, Ltd.',
//       paymentIntentClientSecret: paymentIntentSecret,
//       customerId: customerId, // Optional: for saving cards
//       customerEphemeralKeySecret: ephemeralKey, // Optional: for saving cards
//       allowsDelayedPaymentMethods: false,
//     });

//     if (initError) {
//       return { success: false, message: `Payment setup failed: ${initError.message}` };
//     }

//     // 3. Open the Stripe Modal Sheet directly over your app view
//     const { error: presentError } = await presentPaymentSheet();

//     if (presentError) {
//       // Handle cases where the user intentionally closed the checkout window
//       if (presentError.code === 'Canceled') {
//         return { success: false, message: 'Payment window closed.' };
//       }
//       return { success: false, message: presentError.message };
//     }

//     // 4. Payment complete on client-side
//     return {
//       success: true,
//       paymentId: paymentIntentSecret.split('_secret')[0], // Extracting base PaymentIntent ID
//       message: 'Payment processed successfully.',
//     };

//   } catch (error: any) {
//     console.error('Stripe Integration Error:', error);
//     return {
//       success: false,
//       message: error?.message || 'An unexpected error occurred during checkout.',
//     };
//   }
// }







import { API_URL } from '../config/api';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export async function payInvoice(ticketId: string, amount: number) {
  try {
    // ارسال درخواست به روت پرداخت بک‌اند در ریلوای
    const response = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId,
        amount: Math.round(amount * 100), // تبدیل به سنت/پنس برای استرایپ
      }),
    });

    const { paymentIntentSecret } = await response.json();

    // باقی کدهای مربوط به presentPaymentSheet استرایپ...
    
  } catch (error) {
    console.error(error);
  }
}
