import type { NextApiRequest, NextApiResponse } from 'next';
import { AptosClient } from 'aptos';

const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE || 'https://fullnode.testnet.aptoslabs.com';
const MODULE_ADDR = "0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1";
const client = new AptosClient(NODE_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { billing_id, user } = req.query as { billing_id?: string; user?: string };
  if (!billing_id) return res.status(400).json({ error: 'billing_id required' });

  try {
    const resourceType = `${MODULE_ADDR}::billing::Aptick`;
    const aptick = await client.getAccountResource(MODULE_ADDR, resourceType);
    const providersHandle = (aptick as any).data.providers.handle;
    const balancesHandle = (aptick as any).data.balances.handle;

    const provider = await client.getTableItem(providersHandle, 'u64', `${MODULE_ADDR}::billing::Provider`, billing_id);

    let balance = 0;
    let usage_units = 0;
    if (user) {
      const key = { billing_id: Number(billing_id), user };
      try {
        const esc = await client.getTableItem(balancesHandle, `${MODULE_ADDR}::billing::BalanceKey`, `${MODULE_ADDR}::billing::UserEscrow`, key);
        if (esc) {
          if (esc.coins && esc.coins.value) balance = Number(esc.coins.value);
          else if (esc.coins && esc.coins.amount) balance = Number(esc.coins.amount);
          usage_units = Number(esc.usage_units || 0);
        }
      } catch (e) {
        // missing key is normal
      }
    }

    res.json({ provider, user: { balance, usage_units } });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
