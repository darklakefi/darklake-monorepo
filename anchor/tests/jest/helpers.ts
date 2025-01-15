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
  tokenXMintAndProgramId: TokenMintAndProgramId,
  tokenYMintAndProgramId: TokenMintAndProgramId,
  amountX: number,
  amountY: number,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  if (amountX > 0) {
    await mintTo(
      connection,
      convertToSigner(payer),
      tokenXMintAndProgramId.mint,
      userTokenAccountX.address,
      convertToSigner(payer),
      amountX,
      undefined,
      undefined,
      tokenXMintAndProgramId.programId,
    );
  }

  if (amountY > 0) {
    await mintTo(
      connection,
      convertToSigner(payer),
      tokenYMintAndProgramId.mint,
      userTokenAccountY.address,
      convertToSigner(payer),
      amountY,
      undefined,
      undefined,
      tokenYMintAndProgramId.programId,
    );
  }
};

export const addLiquidity = async (
  connection: Connection,
  program: anchor.Program<Darklake>,
  payer: anchor.Wallet,
  poolPubkey: anchor.web3.PublicKey,
  tokenXMintAndProgramId: TokenMintAndProgramId,
  tokenYMintAndProgramId: TokenMintAndProgramId,
  amountX: number,
  amountY: number,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  await program.methods
    .addLiquidity(new anchor.BN(amountX), new anchor.BN(amountY))
    .accountsPartial({
      tokenMintX: tokenXMintAndProgramId.mint,
      tokenMintY: tokenYMintAndProgramId.mint,
      tokenMintXProgram: tokenXMintAndProgramId.programId,
      tokenMintYProgram: tokenYMintAndProgramId.programId,
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
  tokenXMintAndProgramId: TokenMintAndProgramId,
  tokenYMintAndProgramId: TokenMintAndProgramId,
  publicInputs,
  privateInputs,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
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
      tokenMintX: tokenXMintAndProgramId.mint,
      tokenMintY: tokenYMintAndProgramId.mint,
      tokenMintXProgram: tokenXMintAndProgramId.programId,
      tokenMintYProgram: tokenYMintAndProgramId.programId,
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

export const ibrlSwap = async (
  connection: Connection,
  program: anchor.Program<Darklake>,
  payer: anchor.Wallet,
  poolPubkey: anchor.web3.PublicKey,
  tokenXMintAndProgramId: TokenMintAndProgramId,
  tokenYMintAndProgramId: TokenMintAndProgramId,
  publicInputs,
  privateInputs,
) => {
  const [userTokenAccountX, userTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  const { proofA, proofB, proofC, publicSignals } = await generateProof(
    privateInputs,
    publicInputs,
  );

  const tx = await program.methods
    .ibrlSwap(
      Array.from(proofA),
      Array.from(proofB),
      Array.from(proofC),
      publicSignals.map((signal) => Array.from(signal)),
    )
    .accountsPartial({
      tokenMintX: tokenXMintAndProgramId.mint,
      tokenMintY: tokenYMintAndProgramId.mint,
      tokenMintXProgram: tokenXMintAndProgramId.programId,
      tokenMintYProgram: tokenYMintAndProgramId.programId,
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
  tokenXMintAndProgramId: TokenMintAndProgramId,
  tokenYMintAndProgramId: TokenMintAndProgramId,
  tokenLpMintAndProgramId: TokenMintAndProgramId,
  tokenAmountLp: number,
) => {
  const [userTokenAccountX, userTokenAccountY, userTokenAccountLp] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      false,
      payer,
      payer.publicKey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId, tokenLpMintAndProgramId],
    );

  const [poolTokenAccountX, poolTokenAccountY] =
    await getOrCreateAssociatedTokenAccountsMulti(
      connection,
      true,
      payer,
      poolPubkey,
      [tokenXMintAndProgramId, tokenYMintAndProgramId],
    );

  await program.methods
    .removeLiquidity(tokenAmountLp)
    .accountsPartial({
      tokenMintX: tokenXMintAndProgramId.mint,
      tokenMintY: tokenYMintAndProgramId.mint,
      tokenMintXProgram: tokenXMintAndProgramId.programId,
      tokenMintYProgram: tokenYMintAndProgramId.programId,
      tokenMintLp: tokenLpMintAndProgramId.mint,
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
