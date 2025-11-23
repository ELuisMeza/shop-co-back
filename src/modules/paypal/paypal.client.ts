import { Client, Environment, LogLevel } from '@paypal/paypal-server-sdk';

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || '',
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || ''
  },
  timeout: 0,
  environment: Environment.Sandbox
});