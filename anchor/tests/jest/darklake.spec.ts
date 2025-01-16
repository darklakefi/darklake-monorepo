import * as anchor from '@coral-xyz/anchor';
import { Darklake } from '../../target/types/darklake';
import {
  getAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  addLiquidity,
  fundTokenAccounts,
  getOrCreateAssociatedTokenAccountsMulti,
  removeLiquidity,
  swap,
  TokenMintAndProgramId,
} from './helpers';
import { PublicKey } from '@solana/web3.js';
import { setupMint, setupPool } from './setup';

describe('darklake', () => {
  // project config support only after v30 jest
  const TEST_TIMEOUT = 1000000;

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Darklake as anchor.Program<Darklake>;

  let poolPubkey: anchor.web3.PublicKey;

  const MIN_LIQUIDITY = 1000; // liquidity burned on initial liquidity deposit

  // don't use these values in tests. Instead use TOKEN_X.programId
  const tokenXProgramId: anchor.web3.PublicKey = TOKEN_2022_PROGRAM_ID;
  const tokenYProgramId: anchor.web3.PublicKey = TOKEN_PROGRAM_ID;
  // don't use these values in tests.
  const tokenMintXDecimals = 6;
  const tokenMintYDecimals = 9;

  let TOKEN_X: TokenMintAndProgramId;
  let TOKEN_Y: TokenMintAndProgramId;
  let TOKEN_LP: TokenMintAndProgramId;

  beforeEach(async () => {
    ({ TOKEN_X, TOKEN_Y, TOKEN_LP } = await setupMint(
      provider,
      program,
      tokenMintXDecimals, // decimal x
      tokenMintYDecimals, // decimal y
      tokenXProgramId,
      tokenYProgramId,
    ));

    Object.freeze(TOKEN_X);
    Object.freeze(TOKEN_Y);
    Object.freeze(TOKEN_LP);

    poolPubkey = await setupPool(program, payer, TOKEN_X.mint, TOKEN_Y.mint);
  });

  it('Pool has initial reserves', async () => {
    const poolAccount = await program.account.pool.fetch(poolPubkey);
    expect(poolAccount.tokenMintX.equals(TOKEN_X.mint)).toBe(true);
    expect(poolAccount.tokenMintY.equals(TOKEN_Y.mint)).toBe(true);
  });

  describe('Add Liquidity', () => {
    const amountX = 1_000_000; // 1 token with 6 decimals
    const amountY = 2_000_000_000; // 2 tokens with 9 decimals

    beforeEach(async () => {
      await fundTokenAccounts(
        provider.connection,
        payer,
        TOKEN_X,
        TOKEN_Y,
        amountX,
        amountY,
      );
    });

    it('Both X and Y token default amounts', async () => {
        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          amountX,
          amountY,
        );

        const [userTokenAccountX, userTokenAccountY, userTokenAccountLp] =
          await getOrCreateAssociatedTokenAccountsMulti(
            provider.connection,
            false,
            payer,
            payer.publicKey,
            [TOKEN_X, TOKEN_Y, TOKEN_LP],
          );

        const updatedPoolAccount = await program.account.pool.fetch(poolPubkey);

        expect(updatedPoolAccount.reserveX.toNumber()).toBe(amountX);
        expect(updatedPoolAccount.reserveY.toNumber()).toBe(amountY);

        const userAccountXInfo = await getAccount(
          provider.connection,
          userTokenAccountX.address,
          undefined,
          TOKEN_X.programId,
        );

        const userAccountYInfo = await getAccount(
          provider.connection,
          userTokenAccountY.address,
          undefined,
          TOKEN_Y.programId,
        );

        const userAccountLpInfo = await getAccount(
          provider.connection,
          userTokenAccountLp.address,
          undefined,
          TOKEN_LP.programId,
        );
        const zeroAccountLpInfo = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer.payer,
          TOKEN_LP.mint,
          new PublicKey('11111111111111111111111111111111'),
          false,
          undefined,
          undefined,
          TOKEN_LP.programId,
        );

        expect(Number(userAccountXInfo.amount)).toBe(0);
        expect(Number(userAccountYInfo.amount)).toBe(0);
        expect(Number(userAccountLpInfo.amount)).toBe(
          Math.floor(Math.sqrt(amountX * amountY)) - MIN_LIQUIDITY,
        );
        // burned
        expect(Number(zeroAccountLpInfo.amount)).toBe(MIN_LIQUIDITY);
      },
      TEST_TIMEOUT,
    );

    it('Add liquidity twice', async () => {
        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          amountX / 2,
          amountY / 2,
        );

        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          amountX / 2,
          amountY / 2,
        );

        const [userTokenAccountX, userTokenAccountY, userTokenAccountLp] =
          await getOrCreateAssociatedTokenAccountsMulti(
            provider.connection,
            false,
            payer,
            payer.publicKey,
            [TOKEN_X, TOKEN_Y, TOKEN_LP],
          );

        const updatedPoolAccount = await program.account.pool.fetch(poolPubkey);

        expect(updatedPoolAccount.reserveX.toNumber()).toBe(amountX);
        expect(updatedPoolAccount.reserveY.toNumber()).toBe(amountY);

        const userAccountXInfo = await getAccount(
          provider.connection,
          userTokenAccountX.address,
          undefined,
          TOKEN_X.programId,
        );
        const userAccountYInfo = await getAccount(
          provider.connection,
          userTokenAccountY.address,
          undefined,
          TOKEN_Y.programId,
        );
        const userAccountLpInfo = await getAccount(
          provider.connection,
          userTokenAccountLp.address,
          undefined,
          TOKEN_LP.programId,
        );
        const zeroAccountLpInfo = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer.payer,
          TOKEN_LP.mint,
          new PublicKey('11111111111111111111111111111111'),
          false,
          undefined,
          undefined,
          TOKEN_LP.programId,
        );

        expect(Number(userAccountXInfo.amount)).toBe(0);
        expect(Number(userAccountYInfo.amount)).toBe(0);
        expect(Number(userAccountLpInfo.amount)).toBe(
          Math.floor(Math.sqrt(((amountX / 2) * amountY) / 2)) -
            MIN_LIQUIDITY + // first deposit
            Math.floor(Math.sqrt(((amountX / 2) * amountY) / 2)), // second deposit
        );
        // burned
        expect(Number(zeroAccountLpInfo.amount)).toBe(MIN_LIQUIDITY);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Swap', () => {
    it('Confidential Swap X -> Y', async () => {
        const initialLiquidityX = 1_000_000;
        const initialLiquidityY = 2_000_000_000;
        // Add liquidity
        await fundTokenAccounts(
          provider.connection,
          payer,
          TOKEN_X,
          TOKEN_Y,
          initialLiquidityX,
          initialLiquidityY,
        );

        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          initialLiquidityX,
          initialLiquidityY,
        );

        // Fund user with swap from amount X

        const fundAmountX = 1_000_000;
        const fundAmountY = 0;
        await fundTokenAccounts(
          provider.connection,
          payer,
          TOKEN_X,
          TOKEN_Y,
          fundAmountX,
          fundAmountY,
        );

        // Swap

        const poolAccount = await program.account.pool.fetch(poolPubkey);
        const publicInputs = {
          inputAmount: '100000', // 0.1 token of tokenX 1e5
          reserveX: poolAccount.reserveX.toString(),
          reserveY: poolAccount.reserveY.toString(),
          isSwapXtoY: 1, // Swapping tokenX for tokenY
        };

        const privateInputs = {
          privateMinReceived: '100000', // Adjust this based on your expected output
        };

        await swap(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          publicInputs,
          privateInputs,
        );

        try {
          const [userTokenAccountX, userTokenAccountY] =
            await getOrCreateAssociatedTokenAccountsMulti(
              provider.connection,
              false,
              payer,
              payer.publicKey,
              [TOKEN_X, TOKEN_Y],
            );

          const userAccountXAfterSwap = await getAccount(
            provider.connection,
            userTokenAccountX.address,
            undefined,
            TOKEN_X.programId,
          );
          const userAccountYAfterSwap = await getAccount(
            provider.connection,
            userTokenAccountY.address,
            undefined,
            TOKEN_Y.programId,
          );

          const expectedAmountReceived = 181818181;

          expect(Number(userAccountXAfterSwap.amount)).toEqual(
            fundAmountX - 1e5,
          );
          expect(Number(userAccountYAfterSwap.amount)).toEqual(
            expectedAmountReceived,
          );

          const [poolTokenAccountX, poolTokenAccountY] =
            await getOrCreateAssociatedTokenAccountsMulti(
              provider.connection,
              true,
              payer,
              poolPubkey,
              [TOKEN_X, TOKEN_Y],
            );

          const poolAccountXAfterSwap = await getAccount(
            provider.connection,
            poolTokenAccountX.address,
            undefined,
            TOKEN_X.programId,
          );
          const poolAccountYAfterSwap = await getAccount(
            provider.connection,
            poolTokenAccountY.address,
            undefined,
            TOKEN_Y.programId,
          );

          expect(Number(poolAccountXAfterSwap.amount)).toEqual(
            initialLiquidityX + 1e5,
          );
          expect(Number(poolAccountYAfterSwap.amount)).toEqual(
            initialLiquidityY - expectedAmountReceived,
          );
        } catch (error) {
          console.error('Error performing confidential swap:', error);
          throw error;
        }
      },
      TEST_TIMEOUT,
    );

    it('Confidential Swap Y -> X', async () => {
        const initialLiquidityX = 1_000_000;
        const initialLiquidityY = 2_000_000_000;
        // Add liquidity
        await fundTokenAccounts(
          provider.connection,
          payer,
          TOKEN_X,
          TOKEN_Y,
          initialLiquidityX,
          initialLiquidityY,
        );

        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          initialLiquidityX,
          initialLiquidityY,
        );

        // Fund user with swap from amount X

        const fundAmountX = 0;
        const fundAmountY = 1_000_000_000;
        await fundTokenAccounts(
          provider.connection,
          payer,
          TOKEN_X,
          TOKEN_Y,
          fundAmountX,
          fundAmountY,
        );

        // Swap

        const poolAccount = await program.account.pool.fetch(poolPubkey);
        const publicInputs = {
          inputAmount: '100000000', // 0.1 token of tokenY 1e8
          reserveX: poolAccount.reserveX.toString(),
          reserveY: poolAccount.reserveY.toString(),
          isSwapXtoY: 0, // Swapping tokenY for tokenX
        };

        const privateInputs = {
          privateMinReceived: '0', // Adjust this based on your expected output
        };

        await swap(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          publicInputs,
          privateInputs,
        );

        try {
          const [userTokenAccountX, userTokenAccountY] =
            await getOrCreateAssociatedTokenAccountsMulti(
              provider.connection,
              false,
              payer,
              payer.publicKey,
              [TOKEN_X, TOKEN_Y],
            );

          const userAccountXAfterSwap = await getAccount(
            provider.connection,
            userTokenAccountX.address,
            undefined,
            TOKEN_X.programId,
          );
          const userAccountYAfterSwap = await getAccount(
            provider.connection,
            userTokenAccountY.address,
            undefined,
            TOKEN_Y.programId,
          );

          const expectedAmountReceived = 47619;

          expect(Number(userAccountXAfterSwap.amount)).toEqual(
            expectedAmountReceived,
          );
          expect(Number(userAccountYAfterSwap.amount)).toEqual(
            fundAmountY - 1e8,
          );

          const [poolTokenAccountX, poolTokenAccountY] =
            await getOrCreateAssociatedTokenAccountsMulti(
              provider.connection,
              true,
              payer,
              poolPubkey,
              [TOKEN_X, TOKEN_Y],
            );

          const poolAccountXAfterSwap = await getAccount(
            provider.connection,
            poolTokenAccountX.address,
            undefined,
            TOKEN_X.programId,
          );
          const poolAccountYAfterSwap = await getAccount(
            provider.connection,
            poolTokenAccountY.address,
            undefined,
            TOKEN_Y.programId,
          );

          expect(Number(poolAccountXAfterSwap.amount)).toEqual(
            initialLiquidityX - expectedAmountReceived,
          );
          expect(Number(poolAccountYAfterSwap.amount)).toEqual(
            initialLiquidityY + 1e8,
          );
        } catch (error) {
          console.error('Error performing confidential swap:', error);
          throw error;
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Remove liquidity', () => {
    const amountX = 1_000_000;
    const amountY = 2_000_000_000;

    it('Add and remove half liquidity', async () => {
        await fundTokenAccounts(
          provider.connection,
          payer,
          TOKEN_X,
          TOKEN_Y,
          amountX,
          amountY,
        );

        await addLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          amountX,
          amountY,
        );

        const [userTokenAccountX, userTokenAccountY, userTokenAccountLp] =
          await getOrCreateAssociatedTokenAccountsMulti(
            provider.connection,
            false,
            payer,
            payer.publicKey,
            [TOKEN_X, TOKEN_Y, TOKEN_LP],
          );

        const lpTokenBalance = await provider.connection.getTokenAccountBalance(
          userTokenAccountLp.address,
        );
        const halfUserLpTokens = Math.floor(
          parseInt(lpTokenBalance.value.amount, 10) / 2,
        );

        const totalLiquidty = Math.floor(Math.sqrt(amountX * amountY));
        // take into account initially burned liquidity
        const userLpAfterMin = totalLiquidty - MIN_LIQUIDITY;

        expect(halfUserLpTokens).toEqual(Math.floor(userLpAfterMin / 2));

        await removeLiquidity(
          provider.connection,
          program,
          payer,
          poolPubkey,
          TOKEN_X,
          TOKEN_Y,
          TOKEN_LP,
          new anchor.BN(halfUserLpTokens),
        );

        const halfUserLpTokensAmountX = Math.floor(
          (halfUserLpTokens * amountX) / totalLiquidty,
        );
        const halfUserLpTokensAmountY = Math.floor(
          (halfUserLpTokens * amountY) / totalLiquidty,
        );

        const updatedPoolAccount = await program.account.pool.fetch(poolPubkey);

        // pool reserves
        expect(updatedPoolAccount.reserveX.toNumber()).toEqual(
          amountX - halfUserLpTokensAmountX,
        );
        expect(updatedPoolAccount.reserveY.toNumber()).toEqual(
          amountY - halfUserLpTokensAmountY,
        );

        // user LP tokens left
        const updatedUserLpBalance =
          await provider.connection.getTokenAccountBalance(
            userTokenAccountLp.address,
          );

        expect(parseInt(updatedUserLpBalance.value.amount, 10)).toEqual(
          parseInt(lpTokenBalance.value.amount, 10) - halfUserLpTokens,
        );

        // user X/Y tokens
        const updatedUserXBalance =
          await provider.connection.getTokenAccountBalance(
            userTokenAccountX.address,
          );
        const updatedUserYBalance =
          await provider.connection.getTokenAccountBalance(
            userTokenAccountY.address,
          );
        expect(Number(updatedUserXBalance.value.amount)).toEqual(
          halfUserLpTokensAmountX,
        );
        expect(Number(updatedUserYBalance.value.amount)).toEqual(
          halfUserLpTokensAmountY,
        );
      },
      TEST_TIMEOUT,
    );
  });
});
