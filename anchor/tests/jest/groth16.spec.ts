import * as snarkjs from 'snarkjs';
import * as path from 'path';
import { buildBn128, utils, Curve } from 'ffjavascript';
import * as fs from 'fs';
import * as os from 'os';
import { execSync } from 'child_process';
import {
  g1Uncompressed,
  negateAndSerializeG1,
  g2Uncompressed,
  to32ByteBuffer,
} from '../../src/utils';

const { unstringifyBigInts } = utils;

const hammingDistance = (a: string[], b: string[]) => {
  if (a.length !== b.length) {
    throw new Error('Arrays must have the same length');
  }

  let distance = 0;
  for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
          distance++;
      }
  }
  return distance;
}

describe('ZKConstantSumAMM Verifier', () => {
  let curve: Curve;

  beforeAll(async () => {
    curve = await buildBn128();
  });

  afterAll(async () => {
    if (curve) {
      await curve.terminate();
    }
  });

  it('should generate a valid proof', async () => {
    // wasm
    const wasmPath = path.join(
      __dirname,
      '../../../circuits/swap_js',
      'swap.wasm',
    );
    // zkey
    const zkeyPath = path.join(
      __dirname,
      '../../../circuits',
      'swap_final.zkey',
    );

    // Generate proof
    const baseInput = {
      privateInputAmount: 100000, // Example value
      privateMinReceived: 98000, // Example value
      publicBalanceX: 1100000, // Changed from 1000000 to match public signal
      publicBalanceY: 1900000, // Chang
      isSwapXtoY: 1, // Swapping X to Y
    };
    let publicSignals;
    ({
      publicSignals,
    } = await snarkjs.groth16.fullProve(baseInput, wasmPath, zkeyPath));
    const basePublicSignals = publicSignals;

    let worseDistance = [];
    let betterDistance = [];


    for (let i = 0; i < 10; i++) {
      const inputWorse = {
        privateInputAmount: 100000, // Example value
        privateMinReceived: 98000 - (i), // Example value
        publicBalanceX: 1100000 + (i), // Changed from 1000000 to match public signal
        publicBalanceY: 1900000 - (i), // Chang
        isSwapXtoY: 1, // Swapping X to Y
      };
  
      const inputBetter = {
        privateInputAmount: 100000, // Example value
        privateMinReceived: 98000 + i, // Example value
        publicBalanceX: 1100000 - i, // Changed from 1000000 to match public signal
        publicBalanceY: 1900000 + i, // Chang
        isSwapXtoY: 1, // Swapping X to Y
      };

      ({
        publicSignals,
      } = await snarkjs.groth16.fullProve(inputWorse, wasmPath, zkeyPath));
      const inputPublicSignals1 = publicSignals;

      ({
        publicSignals,
      } = await snarkjs.groth16.fullProve(inputBetter, wasmPath, zkeyPath));
      const inputPublicSignals2 = publicSignals;

             
      worseDistance.push(hammingDistance(basePublicSignals.slice(3), inputPublicSignals1.slice(3)));
      betterDistance.push(hammingDistance(basePublicSignals.slice(3), inputPublicSignals2.slice(3)));
    }

    fs.writeFileSync('results.txt', `Worse Distance: ${worseDistance.join(', ')}\nBetter Distance: ${betterDistance.join(', ')}`);
  }, 300000000);

  it.skip('should generate and verify a valid proof using snarkjs library', async () => {
    const input = {
      privateInputAmount: 100000,
      privateMinReceived: 99000,
      publicBalanceX: 1100000,
      publicBalanceY: 1900000,
      isSwapXtoY: 1,
    };

    const wasmPath = path.join(
      __dirname,
      '../../../circuits/gadget_js',
      'gadget.wasm',
    );
    const zkeyPath = path.join(
      __dirname,
      '../../../circuits',
      'gadget_0000.zkey',
    );
    const vKeyPath = path.join(
      __dirname,
      '../../../circuits',
      'verification_key.json',
    );

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath,
    );

    const vKey = JSON.parse(fs.readFileSync(vKeyPath, 'utf8'));

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    expect(res).toBe(true);
  });

  it.skip('should generate and verify a valid proof using snarkjs CLI', async () => {
    const input = {
      privateInputAmount: 100000,
      privateMinReceived: 99000,
      publicBalanceX: 1100000,
      publicBalanceY: 1900000,
      isSwapXtoY: 1,
    };

    const snarkjsCli = path.join(__dirname, '../../../snarkjs/build/cli.cjs');
    const zkeyPath = path.join(
      __dirname,
      '../../../circuits',
      'gadget_0000.zkey',
    );
    const vKeyPath = path.join(
      __dirname,
      '../../../circuits',
      'verification_key.json',
    );
    const wasmPath = path.join(
      __dirname,
      '../../../circuits/gadget_js',
      'gadget.wasm',
    );

    const inputPath = path.join(__dirname, '../../../input.json');
    const witnessPath = path.join(__dirname, '../../../witness.wtns');
    const proofPath = path.join(__dirname, '../../../proof.json');
    const publicPath = path.join(__dirname, '../../../public.json');

    // Write input to file
    fs.writeFileSync(inputPath, JSON.stringify(input));

    // Generate the witness
    execSync(
      `node ${snarkjsCli} wtns calculate ${wasmPath} ${inputPath} ${witnessPath}`,
    );

    // Generate the proof
    execSync(
      `node ${snarkjsCli} groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`,
    );

    // Verify the proof
    const result = execSync(
      `node ${snarkjsCli} groth16 verify ${vKeyPath} ${publicPath} ${proofPath}`,
    );

    expect(result.toString()).toContain('OK!');

    // Clean up temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(witnessPath);
    fs.unlinkSync(proofPath);
    fs.unlinkSync(publicPath);
  });
});
