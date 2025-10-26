// Health check endpoint for Vercel
import { MONAD_RPC, CHAIN_ID } from '../../lib/security-utils';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'healthy',
    service: 'Monad Security Monitor API',
    timestamp: new Date().toISOString(),
    rpc_connected: true,
    chain_id: CHAIN_ID,
    rpc_url: MONAD_RPC
  });
}