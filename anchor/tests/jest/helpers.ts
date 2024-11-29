import * as anchor from '@coral-xyz/anchor';
import {
  Account,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Darklake } from '../../target/types/darklake';
import { Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import { generateProof } from './proof';
// uncomment to run simulations
// import { simulateTransaction } from '@coral-xyz/anchor/dist/cjs/utils/rpc';

export const convertToSigner = (wallet: anchor.Wallet): anchor.web3.Signer => ({
  publicKey: wallet.publicKey,
  secretKey: wallet.payer.secretKey,
});

export const getOrCreateAssociatedTokenAccountWrap =
  (connection: Connection, allowOwnerOffCurve: boolean) =>
  async (
    signer: anchor.web3.Signer,
    tokenMint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    programId: anchor.web3.PublicKey,
  ) =>
    getOrCreateAssociatedTokenAccount(
      connection,
      signer,
      tokenMint,
      owner,
      allowOwnerOffCurve,
      undefined,
      undefined,
      programId,
    );

export type TokenMintAndProgramId = {
  mint: anchor.web3.PublicKey;
  programId: anchor.web3.PublicKey;
};

// returns accounts in same order as tokens
export const getOrCreateAssociatedTokenAccountsMulti = async (
  connection: Connection,
  allowOwnerOffCurve: boolean,
  payer: anchor.Wallet,
  owner: anchor.web3.PublicKey,
  tokens: TokenMintAndProgramId[],
): Promise<Account[]> => {
  const getAssociatedTokenAccountWrap = getOrCreateAssociatedTokenAccountWrap(
    connection,
    allowOwnerOffCurve,
  );

  const accounts: Account[] = [];
  for (const token of tokens) {
    const tokenAccount = await getAssociatedTokenAccountWrap(
      convertToSigner(payer),
      token.mint,
      owner,
      token.programId,
    );
    accounts.push(tokenAccount);
  }

  return accounts;
};

export const fundTokenAccounts = async (
  connection: Connection,
  payer: anchor.Wallet,
  tokenXProgramId: anchor.web3.PublicKey,
  tokenYProgramId: anchor.web3.PublicKey,
  tokenX: anchor.web3.PublicKey,
  tokenY: anchor.web3.PublicKey,
  amountX: number,
  amountY: number,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  if (amountX > 0) {
    await mintTo(
      connection,
      convertToSigner(payer),
      tokenX,
      userTokenAccountX.address,
      convertToSigner(payer),
      amountX,
      undefined,
      undefined,
      tokenXProgramId,
    );
  }

  if (amountY > 0) {
    await mintTo(
      connection,
      convertToSigner(payer),
      tokenY,
      userTokenAccountY.address,
      convertToSigner(payer),
      amountY,
      undefined,
      undefined,
      tokenYProgramId,
    );
  }
};

export const addLiquidity = async (
  connection: Connection,
  program: anchor.Program<Darklake>,
  payer: anchor.Wallet,
  poolPubkey: anchor.web3.PublicKey,
  tokenXProgramId: anchor.web3.PublicKey,
  tokenYProgramId: anchor.web3.PublicKey,
  tokenX: anchor.web3.PublicKey,
  tokenY: anchor.web3.PublicKey,
  amountX: number,
  amountY: number,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  await program.methods
    .addLiquidity(new anchor.BN(amountX), new anchor.BN(amountY))
    .accountsPartial({
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      tokenMintXProgram: tokenXProgramId,
      tokenMintYProgram: tokenYProgramId,
      tokenMintLpProgram: TOKEN_PROGRAM_ID,
      pool: poolPubkey,
      userTokenAccountX: userTokenAccountX.address,
      userTokenAccountY: userTokenAccountY.address,
      poolTokenAccountX: poolTokenAccountX.address,
      poolTokenAccountY: poolTokenAccountY.address,
      user: payer.publicKey,
    })
    .rpc();
};

export const swap = async (
  connection: Connection,
  program: anchor.Program<Darklake>,
  payer: anchor.Wallet,
  poolPubkey: anchor.web3.PublicKey,
  tokenXProgramId: anchor.web3.PublicKey,
  tokenYProgramId: anchor.web3.PublicKey,
  tokenX: anchor.web3.PublicKey,
  tokenY: anchor.web3.PublicKey,
  publicInputs,
  privateInputs,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  const { proofA, proofB, proofC, publicSignals } = await generateProof(
    privateInputs,
    publicInputs,
  );

  const tx = await program.methods
    .confidentialSwap(
      Array.from(proofA),
      Array.from(proofB),
      Array.from(proofC),
      publicSignals.map((signal) => Array.from(signal)),
    )
    .accountsPartial({
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      tokenMintXProgram: tokenXProgramId,
      tokenMintYProgram: tokenYProgramId,
      pool: poolPubkey,
      userTokenAccountX: userTokenAccountX.address,
      userTokenAccountY: userTokenAccountY.address,
      poolTokenAccountX: poolTokenAccountX.address,
      poolTokenAccountY: poolTokenAccountY.address,
      user: payer.publicKey,
    })
    .transaction();

  const modifyComputeUnits =
    anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 250_000,
    });

  tx.add(modifyComputeUnits);

  // simulation keeps returning different CU results
  // approximate failure point is 240_000 -> so setting 250_000
  // actual measurements: 235_675, 239_734, 246_688

  // **uncomment to run simulations**
  // tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  // const resSim = await simulateTransaction(connection, tx, [payer.payer]);
  // console.info('resSim:', resSim);

  await sendAndConfirmTransaction(connection, tx, [payer.payer]);
};

export const removeLiquidity = async (
  connection: Connection,
  program: anchor.Program<Darklake>,
  payer: anchor.Wallet,
  poolPubkey: anchor.web3.PublicKey,
  tokenXProgramId: anchor.web3.PublicKey,
  tokenYProgramId: anchor.web3.PublicKey,
  tokenLpProgramId: anchor.web3.PublicKey,
  tokenX: anchor.web3.PublicKey,
  tokenY: anchor.web3.PublicKey,
  tokenLp: anchor.web3.PublicKey,
  tokenAmountLp: number,
) => {
  const [userTokenAccountX, userTokenAccountY, userTokenAccountLp] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
        {
          mint: tokenLp,
          programId: tokenLpProgramId,
        },
      ],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [
        {
          mint: tokenX,
          programId: tokenXProgramId,
        },
        {
          mint: tokenY,
          programId: tokenYProgramId,
        },
      ],
    );

  await program.methods
    .removeLiquidity(tokenAmountLp)
    .accountsPartial({
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      tokenMintXProgram: tokenXProgramId,
      tokenMintYProgram: tokenYProgramId,
      tokenMintLp: tokenLp,
      tokenMintLpProgram: TOKEN_PROGRAM_ID,
      pool: poolPubkey,
      userTokenAccountX: userTokenAccountX.address,
      userTokenAccountY: userTokenAccountY.address,
      userTokenAccountLp: userTokenAccountLp.address,
      poolTokenAccountX: poolTokenAccountX.address,
      poolTokenAccountY: poolTokenAccountY.address,
      user: payer.publicKey,
    })
    .rpc();
};
