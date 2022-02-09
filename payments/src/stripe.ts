import Stripe from 'stripe';

// 1st api key, 2nd options object with api option (autocomplete)
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2020-08-27',
});
