import Stripe from 'stripe';
import config from '../config';

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

export const isTeacherTransfersActive = async (id: any, capability: any) => {
  const isCapability = await stripe.accounts.retrieveCapability(
    `${id}`,
    `${capability}`
  );

  return isCapability.status === 'active';
};
