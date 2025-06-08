# CertiBadge Issuer Dashboard

The CertiBadge Issuer Dashboard is a professional-grade DApp for issuing soulbound NFT certificates as proof of course completion or credential verification. Built with React, Ethers.js, and web3.storage, it features image + metadata uploads to IPFS, ENS name resolution, real-time previews, and CSV logging for audit tracking.

## Features

-  Upload badge image and metadata to IPFS via web3.storage
-  Preview badge details before minting
-  ENS name resolution for recipient validation
-  Ethers.js integration to issue NFTs on-chain
-  Downloadable CSV log of issued badges
-  Tailwind + Shadcn UI with professional styling

---

## Getting Started

### Install Dependencies
```bash
npm install
```

### Required Environment Variables

Create a `.env.local` file in the root with:

```
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

### Run Locally
```bash
npm run dev
```

### Compile and Deploy Smart Contract
Use Hardhat:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Smart Contract Method

Ensure your contract implements:
```solidity
function issueBadge(address recipient, string memory courseId, string memory issuedBy, string memory issuedDate, string memory metadataURI) external;
```

---

## Tech Stack

- React + Next.js
- TailwindCSS + Shadcn UI
- Ethers.js
- web3.storage (IPFS)
- CSV Export (Blob + download)

---

## Contributing

Pull requests welcome! Please fork the repo and submit a well-documented PR.

---

## License

MIT
