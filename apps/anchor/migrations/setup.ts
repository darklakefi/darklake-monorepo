/*
  This script is used to setup the any network environment for the Darklake program.
  It creates a PYUSD/WSOL pool and transfers initial liquidity to the pool.
  It is used to test the Darklake program.
 */

import * as anchor from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  // NATIVE_MINT works on all networks
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  createSyncNativeInstruction,
} from '@solana/spl-token';
import { AnchorProvider, web3, Program, Idl } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

// Load the IDL using require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const darklakeIdl = require('../target/idl/darklake.json') as Idl;

// TOKEN_METADATA_ID doesn't exist in localnet so need to load dumps/metadata.so to the validator
const TOKEN_METADATA_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);
// devnet/testnet/mainnet
const PYUSD_MINT = new PublicKey(
  'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM',
);

const PYUSD_AMOUNT = 1 * 10 ** 6; // 1 PYUSD (assuming 6 decimals)
const WSOL_AMOUNT = 1 * 10 ** 7; // 0.01 WSOL (9 decimals)
const localnetPyUsdKeypairPath = 'anchor/localnet/pyusd.json';

function getDarklakeProgram(
  provider: AnchorProvider,
): Program<typeof darklakeIdl> {
  return new Program<typeof darklakeIdl>(darklakeIdl, provider);
}

function getDarklakeProgramId(network: string): PublicKey {
  switch (network) {
    case 'localnet':
    case 'devnet':
      return new PublicKey(darklakeIdl.address);
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

async function getPyUsdMint(
  provider: AnchorProvider,
  network: string,
): Promise<PublicKey> {
  switch (network) {
    case 'localnet': {
      const keypairData = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), localnetPyUsdKeypairPath),
          'utf8',
        ),
      );
      const keypair = web3.Keypair.fromSecretKey(new Uint8Array(keypairData));
      return await getOrDeployDummyToken2022(provider, keypair);
    }
    case 'devnet':
      return PYUSD_MINT;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

async function deployPoolAtas(
  provider: AnchorProvider,
  pyUsdMint: PublicKey,
  poolPubkey: PublicKey,
) {
  // Create associated token accounts for the pool
  const poolPYUSDAccount = await getAssociatedTokenAddress(
    pyUsdMint,
    poolPubkey,
    true,
    TOKEN_2022_PROGRAM_ID,
  );

  const poolWSOLAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    poolPubkey,
    true,
  );

  // Check if pool token accounts exist
  const poolPYUSDAccountInfo =
    await provider.connection.getAccountInfo(poolPYUSDAccount);
  const poolWSOLAccountInfo =
    await provider.connection.getAccountInfo(poolWSOLAccount);

  const lastBlock = await provider.connection.getLatestBlockhash();
  const createATAsTx = new web3.Transaction({
    blockhash: lastBlock.blockhash,
    lastValidBlockHeight: lastBlock.lastValidBlockHeight,
    feePayer: provider.wallet.publicKey,
  });
  let needToCreateATAs = false;

  if (!poolPYUSDAccountInfo) {
    console.log('Constructing pool PYUSD ATA...');
    createATAsTx.add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        poolPYUSDAccount,
        poolPubkey,
        pyUsdMint,
        TOKEN_2022_PROGRAM_ID,
      ),
    );
    needToCreateATAs = true;
  }

  if (!poolWSOLAccountInfo) {
    console.log('Constructing pool WSOL ATA...');
    createATAsTx.add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        poolWSOLAccount,
        poolPubkey,
        NATIVE_MINT,
      ),
    );
    needToCreateATAs = true;
  }

  if (needToCreateATAs) {
    const tx = await provider.sendAndConfirm(
      await provider.wallet.signTransaction(createATAsTx),
    );
    console.log('Pool ATAs created. Transaction:', tx);
    return;
  }

  console.log('All pool ATAs already exist.');
}

async function createPYUSDWSOLPool(provider: AnchorProvider, network: string) {
  const program = getDarklakeProgram(provider);
  console.log('Using darklake programId: ', darklakeIdl.address);

  const programId = getDarklakeProgramId(network);

  const pyUsdMint = await getPyUsdMint(provider, network);
  console.info('PyUsd address: ', pyUsdMint.toString());

  const [token0, token1] = [pyUsdMint, NATIVE_MINT].sort((a, b) =>
    a.toBuffer().compare(b.toBuffer()),
  );

  // Find pool PDA using sorted token public keys
  const [poolPubkey] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), token0.toBuffer(), token1.toBuffer()],
    programId,
  );

  // Check if the pool already exists
  const poolAccount = await provider.connection.getAccountInfo(poolPubkey);

  if (poolAccount === null) {
    // SETUP POOL ATAs

    console.log('Pool doesn`t exist. Verify ATAs existance...');

    await deployPoolAtas(provider, pyUsdMint, poolPubkey);

    // INITIALIZE POOL

    // Find LP token mint PDA
    const [lpTokenMint] = PublicKey.findProgramAddressSync(
      [Buffer.from('lp'), token0.toBuffer(), token1.toBuffer()],
      programId,
    );

    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_ID.toBuffer(),
        lpTokenMint.toBuffer(),
      ],
      TOKEN_METADATA_ID,
    );

    console.log('Initializing pool...');
    const tx = await program.methods
      .initializePool()
      .accounts({
        pool: poolPubkey,
        tokenMintX: token0,
        tokenMintY: token1,
        tokenMintLp: lpTokenMint,
        metadataAccount: metadataAccount,
        payer: provider.wallet.publicKey,
        lpTokenProgram: TOKEN_PROGRAM_ID,
        mplProgram: TOKEN_METADATA_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log('---Pool initialized. Transaction signature---:', tx);
  }

  // --- VERIFY POOL ATA BALANCES ---

  const poolPYUSDAccount = await getAssociatedTokenAddress(
    pyUsdMint,
    poolPubkey,
    true,
    TOKEN_2022_PROGRAM_ID,
  );
  const poolWSOLAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    poolPubkey,
    true,
  );

  const poolPYUSDBalance =
    await provider.connection.getTokenAccountBalance(poolPYUSDAccount);
  const poolWSOLBalance =
    await provider.connection.getTokenAccountBalance(poolWSOLAccount);

  console.log('Current pool balances:');
  console.log('PYUSD:', poolPYUSDBalance.value.uiAmount);
  console.log('WSOL:', poolWSOLBalance.value.uiAmount);

  if (
    (poolPYUSDBalance.value.uiAmount ?? 0) > 0 ||
    (poolWSOLBalance.value.uiAmount ?? 0) > 0
  ) {
    console.log(
      'Pool already has liquidity. Skipping initial liquidity transfer.',
    );

    return;
  }

  // --- FUND POOLS ---

  console.log('Funding pools');

  console.log('Fetching or creating user PyUSD ATA');
  // Check if user's PYUSD account exists and has sufficient balance
  const userPYUSDAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    // @ts-expect-error anchor wallet has payer
    provider.wallet.payer,
    pyUsdMint,
    provider.wallet.publicKey,
    false,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  // other networks use pre-exsiting token PYUSD whose mint we don't have access to
  if (network === 'localnet') {
    console.log('Minting dummy PyUSD to user ATA');
    await mintTo(
      provider.connection,
      // @ts-expect-error anchor wallet has payer
      provider.wallet.payer,
      pyUsdMint,
      userPYUSDAccount.address,
      provider.wallet.publicKey,
      PYUSD_AMOUNT * 2,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
  }

  // VERIFY PYUSD USER BALANCE

  const userPYUSDBalance = await provider.connection.getTokenAccountBalance(
    userPYUSDAccount.address,
  );

  console.log('User PYUSD balance:', userPYUSDBalance.value.uiAmount);

  if ((userPYUSDBalance.value.uiAmount ?? 0) < PYUSD_AMOUNT / 10 ** 6) {
    throw new Error(
      `Insufficient PYUSD balance. You need at least ${
        PYUSD_AMOUNT / 10 ** 6
      } PYUSD.`,
    );
  }

  const userPYUSDAccountInfo = await provider.connection.getAccountInfo(
    userPYUSDAccount.address,
  );

  if (
    !userPYUSDAccountInfo ||
    userPYUSDAccountInfo.owner.toString() !== TOKEN_2022_PROGRAM_ID.toString()
  ) {
    throw new Error(
      'User`s PYUSD account is not a Token-2022 account. Please check the account.',
    );
  }

  // VERIFY WSOL USER BALANCE

  console.log('Fetching user WSOL account');

  const userWSOLAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    // @ts-expect-error anchor wallet has payer
    provider.wallet.payer,
    NATIVE_MINT,
    provider.wallet.publicKey,
    false,
  );

  // Wrap SOL to WSOL
  const transferTx = new web3.Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: userWSOLAccount.address,
      lamports: WSOL_AMOUNT * 2,
    }),
    createSyncNativeInstruction(userWSOLAccount.address),
  );

  // Send transaction to wrap SOL
  console.log('Wrapping user`s SOL to WSOL...');
  await provider.sendAndConfirm(transferTx);

  const userWSOLBalance = await provider.connection.getTokenAccountBalance(
    userWSOLAccount.address,
  );
  console.log('User WSOL balance:', userWSOLBalance.value.uiAmount);

  // Call add_liquidity method on Darklake
  const [sortedToken0, sortedToken1] = [pyUsdMint, NATIVE_MINT].sort((a, b) =>
    a.toBuffer().compare(b.toBuffer()),
  );

  const [sortedAmount0, sortedAmount1] = sortedToken0.equals(pyUsdMint)
    ? [PYUSD_AMOUNT, WSOL_AMOUNT]
    : [WSOL_AMOUNT, PYUSD_AMOUNT];

  console.log('Adding liquidity to the pool');
  const addLiquidityTx = await program.methods
    .addLiquidity(new anchor.BN(sortedAmount0), new anchor.BN(sortedAmount1))
    .accounts({
      pool: poolPubkey,
      tokenMintX: sortedToken0,
      tokenMintY: sortedToken1,
      poolTokenAccountX: sortedToken0.equals(pyUsdMint)
        ? poolPYUSDAccount
        : poolWSOLAccount,
      poolTokenAccountY: sortedToken0.equals(pyUsdMint)
        ? poolWSOLAccount
        : poolPYUSDAccount,
      userTokenAccountX: sortedToken0.equals(pyUsdMint)
        ? userPYUSDAccount.address
        : userWSOLAccount.address,
      userTokenAccountY: sortedToken0.equals(pyUsdMint)
        ? userWSOLAccount.address
        : userPYUSDAccount.address,
      user: provider.wallet.publicKey,
      tokenMintXProgram: sortedToken0.equals(pyUsdMint)
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID,
      tokenMintYProgram: sortedToken0.equals(pyUsdMint)
        ? TOKEN_PROGRAM_ID
        : TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log('Liquidity added. Transaction signature:', addLiquidityTx);
}

async function getOrDeployDummyToken2022(
  provider: AnchorProvider,
  keypair?: web3.Keypair,
): Promise<PublicKey> {
  if (keypair) {
    const mintExists = await provider.connection.getAccountInfo(
      keypair.publicKey,
    );

    if (mintExists) {
      console.log('Dummy token mint already exists');
      return keypair.publicKey;
    }
  }

  // Create mint
  console.log('Creating dummy token mint...');
  return await createMint(
    provider.connection,
    // @ts-expect-error anchor wallet has payer
    provider.wallet.payer,
    provider.wallet.publicKey,
    null,
    6,
    keypair,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
}

export async function deploy(provider: AnchorProvider, network: string) {
  if (!['devnet', 'localnet', 'testnet', 'mainnet'].includes(network)) {
    throw new Error(
      `Invalid network: ${network}. Must be one of "devnet", "localnet", "testnet", or "mainnet".`,
    );
  }

  // anchor injects incorrect commitment level, so we need to override it
  const overridenConnection = new web3.Connection(
    provider.connection.rpcEndpoint,
    {
      commitment: 'confirmed',
    },
  );

  const overrideProvider = new AnchorProvider(
    overridenConnection,
    provider.wallet,
  );
  anchor.setProvider(overrideProvider);

  const wallet = overrideProvider.wallet;

  // Print header and wallet address
  console.log(`=== Setup - ${network} ===`);
  console.log('Wallet address:', wallet.publicKey.toString());

  // Run the pool creation function
  await createPYUSDWSOLPool(overrideProvider, network);
}
