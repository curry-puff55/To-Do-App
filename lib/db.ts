import { init } from '@instantdb/react';
import schema from '../instant.schema';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '';

// Only throw error in browser, not during build
if (typeof window !== 'undefined' && !APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is not set');
}

const db = init({ appId: APP_ID, schema });

export default db;
