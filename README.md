# Solana Time-Locked Wallet

A decentralized time-locked wallet built on Solana that allows users to deposit SOL and withdraw it only after a specified unlock timestamp.

![Demo](./app/public/demo.gif)

## Demo

Demo deployed on **Devnet** at [https://dancing-kitten-128462.netlify.app/](https://dancing-kitten-128462.netlify.app/)

## Features

- **Time-locked deposits**: Lock SOL for a specific duration
- **Secure withdrawals**: Only withdraw after unlock timestamp
- **React UI**: Modern web interface for wallet interaction
- **Anchor framework**: Built with Solana's Anchor framework

## Project Structure

```
├── programs/               # Anchor program (Rust)
│   └── solana-time-locked-wallet/
├── app/                   # React frontend
├── tests/                 # Test files
├── migrations/            # Deployment scripts
└── Anchor.toml           # Anchor configuration
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Yarn](https://yarnpkg.com/)
- [PNPM](https://pnpm.io/)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:lukenguyen-me/solana-time-locked-wallet.git
cd solana-time-locked-wallet
yarn install
```

### 2. Setup Solana Environment

```bash
# Configure Solana CLI for local development
solana config set -ul

# Start local validator
solana-test-validator
```

### 3. Build and Deploy Program

```bash
# Build the Anchor program
anchor build

# Deploy to local validator
anchor deploy

# Copy program ID to Anchor.toml and app/.env
```

### 4. Run Tests

```bash
# Run Anchor tests
anchor test
```

### 5. Setup Frontend

Create `app/.env.local` file:

```env
VITE_RPC_URL=http://localhost:8899
VITE_CROWDFUNDING_PROGRAM_ID=AgrusQgGxVBPiKBjjNAQx82u1KWP1fwAJ1wmkxNVKHWQ
VITE_NETWORK=localnet
```

### 6. Start Frontend

```bash
cd app
pnpm install
pnpm run dev
```

### Program Instructions

- **initialize_lock**: Create a time-locked wallet with SOL deposit
- **withdraw**: Withdraw SOL after unlock timestamp
