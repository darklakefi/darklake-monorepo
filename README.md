# Darklake

Darklake is a decentralized exchange (DEX) protocol built on the Solana blockchain, inspired by Uniswap v3. It aims to provide efficient and flexible liquidity provision with concentrated liquidity and confidential swaps.

Further information can be found in the [website](https://darklake.fi).

## Turbin3 Capstone

This project is my Turbin3 Capstone project.

Devnet deployment tx: https://solana.fm/tx/UizYmmM6vazxs9si7XWBxP864SRrdJpXYE9H7bs9jHmUFVJu6ymJY7F2NUJgXQeMXX7DntdWAJDbBAwehyMMyAz?cluster=devnet-alpha

## Features

- Concentrated liquidity for capital efficiency
- Confidential swaps using zero-knowledge proofs
- Built on Solana for high speed and low transaction costs

## Getting Started

### Prerequisites

- Node.js v18.18.0 or higher
- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 2.0.15 or higher

**Optional testing**
- Circom 2 or higher

## Project Structure

### Anchor Program

The `anchor` directory contains the Solana program written in Rust using the Anchor framework.

#### Key Commands - Anchor

- Sync program ID: `npm run anchor keys sync`
- Build the program: `npm run anchor-build`
- Start local test validator: `npm run anchor-localnet`
- Run tests: `npm run anchor-test`
- Deploy to Devnet: `npm run anchor deploy --provider.cluster devnet`

### Web Application

The `web` directory contains a React app that interacts with the Solana program using the Anchor-generated client.

#### Key Commands - Web

- Start the web app: `npm run dev`
- Build the web app: `npm run build`

### Tests

Currently, only the blockchain (Anchor) part has tests, which are both Rust and TypeScript. Rust focuses more on Solana's inner workings, while TypeScript focuses on external interactions (though there is some overlap).

Typescript tests are stored in: `anchor/tests/jest/*`

Rust tests are stored in: `anchor/tests/src/*`


To run typescript tests:

`npm run anchor-jest-test`

To run rust tests:

`npm run anchor-rust-test`

To run both:

`npm run anchor-test`

### Setup/Deployment

#### Localnet

On a localnet validator token metadata id program does not exist, so we include a dump (anchor/localnet/dumps/metadata.so) from mainnet, which has to be redeployed. Also to avoid getting new dummy PYUSD program id each time we use a committed keypair (anchor/localnet/pyusd.json).

To re-create a new MPL_TOKEN_METADATA_ID dump use:

`solana program dump --url mainnet-beta metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so`

Start a validator with metadata id program:

`solana-test-validator --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so`

**Deploy darklake**

Deploy darklake program, keypair is optional and program-name only mandatory if the former is provided:

`anchor deploy --program-name darklake --program-keypair {keypair} --provider.cluster localnet`

**Rebuild (if using a new keypair)**

If deploying without keypair make sure that the deployed program id matches declared_id! in - (anchor/programs/darklake/src/lib.rs). And run:

`npm run anchor-build`

So that the IDL would also be updated to the new program id.

Run to initialize a PYUSD/WSOL pool with initial balances of 1 PYUSD and 0.001 WSOL:

`npm run anchor-migrate-localnet`

The localnet script will give you 1 PYUSD (dummy token) / 0.001 WSOL. Currently front-end localnet PYUSD faucet is not supported - "Get PYUSD test tokens" will not work.

Dummy PYUSD program id: 6kPRYPhyPv7pdN4entFM9ouLj31aMDHtkoL55yQUSFW9

Update the web/constants/tokens.json PYUSD to the above address when running locally.

#### Devnet

Same steps as localnet "Deploy darklake" and "Rebuild" with commands:

`anchor deploy --program-name darklake --program-keypair {keypair} --provider.cluster devnet`

`npm run anchor-build`

Difference from localnet is that the devnet is using a pre-existing PYUSD, so before running the migration, make sure you have atleast 1 PYUSD and 0.001SOL in your wallet. [PYUSD devnet faucet](https://faucet.paxos.com/)

`npm run anchor-migrate-devnet`

## Contributing

We welcome contributions to Darklake! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please open an issue on the GitHub repository or contact the maintainers directly.
