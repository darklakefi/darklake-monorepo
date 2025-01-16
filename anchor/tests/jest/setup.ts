import * as anchor from '@coral-xyz/anchor';

import { convertToSigner, TokenMintAndProgramId } from './helpers';

import {
  createMint,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

export const setupMint = async (
  provider,
  program,
  tokenMintXDecimals: number = 6,
  tokenMintYDecimals: number = 9,
  tokenXProgramId,
  tokenYProgramId,
) => {
  const payer = provider.wallet as anchor.Wallet;

  const airdropSignature = await provider.connection.requestAirdrop(
    payer.publicKey,
    10 * anchor.web3.LAMPORTS_PER_SOL,
  );
  await provider.connection.confirmTransaction(airdropSignature);

  const signer = convertToSigner(payer);
  const tokenMintX = await createMint(
    provider.connection,
    signer,
    signer.publicKey,
    null,
    tokenMintXDecimals,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const tokenMintY = await createMint(
    provider.connection,
    signer,
    signer.publicKey,
    null,
    tokenMintYDecimals,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID,
  );

  let tokenX: anchor.web3.PublicKey;
  let tokenY: anchor.web3.PublicKey;
  let tokenLp: anchor.web3.PublicKey;

  // Sort token mints by address
  if (tokenMintX.toBuffer().compare(tokenMintY.toBuffer()) < 0) {
    tokenX = tokenMintX;
    tokenY = tokenMintY;
    tokenXProgramId = TOKEN_2022_PROGRAM_ID;
    tokenYProgramId = TOKEN_PROGRAM_ID;
  } else {
    tokenX = tokenMintY;
    tokenY = tokenMintX;
    tokenXProgramId = TOKEN_PROGRAM_ID;
    tokenYProgramId = TOKEN_2022_PROGRAM_ID;
  }

  [tokenLp] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('lp'), tokenX.toBuffer(), tokenY.toBuffer()],
    program.programId,
  );

  let TOKEN_X: TokenMintAndProgramId;
  let TOKEN_Y: TokenMintAndProgramId;
  let TOKEN_LP: TokenMintAndProgramId;

  TOKEN_X = {
    mint: tokenX,
    programId: tokenXProgramId,
  };

  TOKEN_Y = {
    mint: tokenY,
    programId: tokenYProgramId,
  };


  TOKEN_LP = {
    mint: tokenLp,
    programId: TOKEN_PROGRAM_ID,
  };

  return {
    TOKEN_X,
    TOKEN_Y,
    TOKEN_LP
  };
};

export const setupPool = async (
  program,
  payer,
  tokenMintX,
  tokenMintY
): Promise<anchor.web3.PublicKey> => {
  try {
    await program.methods
      .initializePool()
      .accountsPartial({
        tokenMintX,
        tokenMintY,
        user: payer.publicKey,
      })
      .rpc();

      let [poolPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('pool'), tokenMintX.toBuffer(), tokenMintY.toBuffer()],
        program.programId,
      );

      return poolPubkey;
  } catch (error) {
    console.error('Error initializing pool:', error);
    throw error;
  }
};
