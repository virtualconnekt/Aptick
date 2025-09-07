import Head from 'next/head'
import { useState } from 'react'

const MODULE_ADDR = "0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [billingId, setBillingId] = useState('1');
  const [amount, setAmount] = useState('1000000');

  async function connectWallet() {
    if (!window.aptos) return alert('Install an Aptos wallet like Petra or Martian');
    const account = await window.aptos.connect();
    setAddress(account.address);
  }

  async function readProvider() {
    const res = await fetch(`/api/provider?billing_id=${billingId}&user=${address||''}`);
    const j = await res.json();
    alert(JSON.stringify(j, null, 2));
  }

  async function deposit() {
    if (!window.aptos) return alert('Install wallet');
    const payload = {
      type: 'entry_function_payload',
      function: `${MODULE_ADDR}::billing::deposit`,
      type_arguments: [],
      arguments: [Number(billingId), Number(amount)]
    }
    try {
      const tx = await window.aptos.signAndSubmitTransaction(payload);
      alert('Submitted: ' + tx.hash);
    } catch (e: any) { alert('Error: ' + e?.message ?? String(e)) }
  }

  return (
    <div style={{padding:20}}>
      <Head>
        <title>Aptick Frontend</title>
      </Head>
      <h1>Aptick demo</h1>
      <div>
        <button onClick={connectWallet}>{address? 'Connected: ' + address : 'Connect Wallet'}</button>
      </div>
      <hr />
      <div>
        <label>Billing ID: </label>
        <input value={billingId} onChange={e=>setBillingId(e.target.value)} />
      </div>
      <div>
        <label>Amount (octas): </label>
        <input value={amount} onChange={e=>setAmount(e.target.value)} />
      </div>
      <div style={{marginTop:10}}>
        <button onClick={readProvider}>Read Provider & Balance</button>
        <button onClick={deposit} style={{marginLeft:10}}>Deposit</button>
      </div>
    </div>
  )
}
