import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Darklake } from '../../target/types/darklake';
import {
  createMint,
  mintTo,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { generateProof } from './proof';

const convertToSigner = (wallet: anchor.Wallet): anchor.web3.Signer => ({
  publicKey: wallet.publicKey,
  secretKey: wallet.payer.secretKey,
});

describe('darklake', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Darklake as Program<Darklake>;

  let poolPubkey: anchor.web3.PublicKey;
  let tokenX: anchor.web3.PublicKey;
  let tokenY: anchor.web3.PublicKey;
  const tokenMint0Decimals = 6;
  const tokenMint1Decimals = 9; // Updated to 9 decimals
  let tokenXProgramId: anchor.web3.PublicKey;
  let tokenYProgramId: anchor.web3.PublicKey;

  const setupMint = async () => {
    const airdropSignature = await provider.connection.requestAirdrop(
      payer.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSignature);

    const signer = convertToSigner(payer);
    const tokenMint0 = await createMint(
      provider.connection,
      signer,
      signer.publicKey,
      null,
      tokenMint0Decimals,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    const tokenMint1 = await createMint(
      provider.connection,
      signer,
      signer.publicKey,
      null,
      tokenMint1Decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );

    // Sort token mints by address
    if (tokenMint0.toBuffer().compare(tokenMint1.toBuffer()) < 0) {
      tokenX = tokenMint0;
      tokenY = tokenMint1;
      tokenXProgramId = TOKEN_2022_PROGRAM_ID;
      tokenYProgramId = TOKEN_PROGRAM_ID;
    } else {
      tokenX = tokenMint1;
      tokenY = tokenMint0;
      tokenXProgramId = TOKEN_PROGRAM_ID;
      tokenYProgramId = TOKEN_2022_PROGRAM_ID;
    }

    [poolPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), tokenX.toBuffer(), tokenY.toBuffer()],
      program.programId,
    );
  };

  const setupPool = async () => {
    try {
      await program.methods
        .initializePool()
        .accountsPartial({
          tokenMintX: tokenX,
          tokenMintY: tokenY,
          payer: payer.publicKey,
        })
        .rpc();
    } catch (error) {
      console.error('Error initializing pool:', error);
      throw error;
    }
  };

  it('Initialize Pool', async () => {
    await setupMint();
    await setupPool();

    const poolAccount = await program.account.pool.fetch(poolPubkey);
    expect(poolAccount.tokenMintX.equals(tokenX)).toBe(true);
    expect(poolAccount.tokenMintY.equals(tokenY)).toBe(true);
  });

  it('Add Liquidity', async () => {
    const userTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      payer.publicKey,
      false,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const userTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      payer.publicKey,
      false,
      undefined,
      undefined,
      tokenYProgramId,
    );

    const poolTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const poolTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenYProgramId,
    );

    const amountX = 1_000_000; // 1 token with 6 decimals
    const amountY = 2_000_000_000; // 2 tokens with 9 decimals
    await mintTo(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      userTokenAccountX.address,
      convertToSigner(payer),
      amountX,
      undefined,
      undefined,
      tokenXProgramId,
    );
    await mintTo(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      userTokenAccountY.address,
      convertToSigner(payer),
      amountY,
      undefined,
      undefined,
      tokenYProgramId,
    );

    try {
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

      const updatedPoolAccount = await program.account.pool.fetch(poolPubkey);

      expect(updatedPoolAccount.reserveX.toNumber()).toBe(amountX);
      expect(updatedPoolAccount.reserveY.toNumber()).toBe(amountY);

      const userAccountXInfo = await getAccount(
        provider.connection,
        userTokenAccountX.address,
        undefined,
        tokenXProgramId,
      );
      const userAccountYInfo = await getAccount(
        provider.connection,
        userTokenAccountY.address,
        undefined,
        tokenYProgramId,
      );

      expect(Number(userAccountXInfo.amount)).toBe(0);
      expect(Number(userAccountYInfo.amount)).toBe(0);
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }, 10000000);

  it('Confidential Swap', async () => {
    const poolAccount = await program.account.pool.fetch(poolPubkey);

    const userTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      payer.publicKey,
      true,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const userTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      payer.publicKey,
      true,
      undefined,
      undefined,
      tokenYProgramId,
    );

    const poolTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const poolTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenYProgramId,
    );

    const amountToMint = 1_000_000; // 1 token with 6 decimals for tokenX
    await mintTo(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      userTokenAccountX.address,
      convertToSigner(payer),
      amountToMint,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const publicInputs = {
      publicBalanceX: poolAccount.reserveX.toString(),
      publicBalanceY: poolAccount.reserveY.toString(),
      isSwapXtoY: 1, // Swapping tokenX for tokenY
    };

    const privateInputs = {
      privateInputAmount: '100000', // 0.1 token of tokenX
      privateMinReceived: '180000000', // Adjust this based on your expected output
    };

    const { proofA, proofB, proofC, publicSignals } = await generateProof(
      privateInputs,
      publicInputs,
    );

    try {
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

      tx.instructions.unshift(
        anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
          units: 2_000_000,
        }),
      );

      await provider.sendAndConfirm(tx);

      const userAccountXAfterSwap = await getAccount(
        provider.connection,
        userTokenAccountX.address,
        undefined,
        tokenXProgramId,
      );
      const userAccountYAfterSwap = await getAccount(
        provider.connection,
        userTokenAccountY.address,
        undefined,
        tokenYProgramId,
      );

      expect(Number(userAccountXAfterSwap.amount)).toBeLessThan(amountToMint);
      expect(Number(userAccountYAfterSwap.amount)).toBeGreaterThan(0);

      const poolAccountXAfterSwap = await getAccount(
        provider.connection,
        poolTokenAccountX.address,
        undefined,
        tokenXProgramId,
      );
      const poolAccountYAfterSwap = await getAccount(
        provider.connection,
        poolTokenAccountY.address,
        undefined,
        tokenYProgramId,
      );

      expect(Number(poolAccountXAfterSwap.amount)).toBeGreaterThan(0);
      expect(Number(poolAccountYAfterSwap.amount)).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error performing confidential swap:', error);
      throw error;
    }
  }, 10000000);

  it('Remove Liquidity', async () => {
    const poolAccount = await program.account.pool.fetch(poolPubkey);

    const balanceX = poolAccount.reserveX.toNumber();
    const balanceY = poolAccount.reserveY.toNumber();

    const [lpMintPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('lp'), tokenX.toBuffer(), tokenY.toBuffer()],
      program.programId,
    );

    const userTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      payer.publicKey,
      false,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const userTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      payer.publicKey,
      false,
      undefined,
      undefined,
      tokenYProgramId,
    );

    const userTokenAccountLp = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      lpMintPubkey,
      payer.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );

    const poolTokenAccountX = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenX,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenXProgramId,
    );

    const poolTokenAccountY = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      convertToSigner(payer),
      tokenY,
      poolPubkey,
      true,
      undefined,
      undefined,
      tokenYProgramId,
    );

    // Get the current LP token balance
    const lpTokenBalance = await provider.connection.getTokenAccountBalance(
      userTokenAccountLp.address,
    );
    const halfLpTokens = new anchor.BN(lpTokenBalance.value.amount).div(
      new anchor.BN(2),
    );

    try {
      await program.methods
        .removeLiquidity(halfLpTokens)
        .accountsPartial({
          tokenMintX: tokenX,
          tokenMintY: tokenY,
          tokenMintXProgram: tokenXProgramId,
          tokenMintYProgram: tokenYProgramId,
          tokenMintLp: lpMintPubkey,
          tokenMintLpProgram: TOKEN_PROGRAM_ID,
          pool: poolPubkey,
          userTokenAccountX: userTokenAccountX.address,
          userTokenAccountY: userTokenAccountY.address,
          userTokenAccountLp: userTokenAccountLp.address,
          poolTokenAccountX: poolTokenAccountX.address,
          poolTokenAccountY: poolTokenAccountY.address,
          user: payer.publicKey,
        })
        .rpc({ commitment: 'confirmed' });

      const updatedPoolAccount = await program.account.pool.fetch(poolPubkey);
      const updatedUserLpBalance =
        await provider.connection.getTokenAccountBalance(
          userTokenAccountLp.address,
        );

      // Check that LP tokens were burned
      expect(new anchor.BN(updatedUserLpBalance.value.amount)).toEqual(
        new anchor.BN(lpTokenBalance.value.amount).sub(halfLpTokens),
      );

      // Check that reserves were reduced by approximately half
      expect(updatedPoolAccount.reserveX.toNumber()).toBeLessThan(balanceX);
      expect(updatedPoolAccount.reserveY.toNumber()).toBeLessThan(balanceY);

      // Check that user received tokens
      const updatedUserXBalance =
        await provider.connection.getTokenAccountBalance(
          userTokenAccountX.address,
        );
      const updatedUserYBalance =
        await provider.connection.getTokenAccountBalance(
          userTokenAccountY.address,
        );
      expect(Number(updatedUserXBalance.value.amount)).toBeGreaterThan(0);
      expect(Number(updatedUserYBalance.value.amount)).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error removing liquidity:', error);
      throw error;
    }
  }, 10000000);
});
