Aptick frontend demo

Quick start

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open http://localhost:3000

Notes
- This project is converted to TypeScript; install dev types if your environment needs them:

```powershell
npm install --save-dev typescript @types/react @types/node
```

- The demo expects an injected `window.aptos` wallet (Petra, Martian, etc.)
- Configure `NEXT_PUBLIC_APTOS_NODE` to point to the Aptos fullnode you want (testnet/mainnet)
- Update `MODULE_ADDR` in `pages/index.tsx` and `pages/api/provider.ts` if you redeploy the module to a different address
