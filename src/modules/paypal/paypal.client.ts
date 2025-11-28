import { Client, Environment } from '@paypal/paypal-server-sdk';

const paypalEnvironment =
  process.env.PAYPAL_ENVIRONMENT?.toLowerCase() === 'live'
    ? Environment.Production
    : Environment.Sandbox;

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || '',
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || ''
  },
  timeout: 0,
  environment: paypalEnvironment
});