import * as snarkjs from 'snarkjs';
import * as path from 'path';
import { buildBn128, utils } from 'ffjavascript';
const { unstringifyBigInts } = utils;
import {
  g1Uncompressed,
  negateAndSerializeG1,
  g2Uncompressed,
  to32ByteBuffer,
} from '../../src/utils';

export async function generateProofExp(
  privateInputs: { privateMinReceived: string },
  publicInputs: {
    inputAmount: string;
    isSwapXtoY: number;
    currentReserveX: string;
    currentReserveY: string;
  },
): Promise<{
  proofA: Uint8Array;
  proofB: Uint8Array;
  proofC: Uint8Array;
  publicSignals: Uint8Array[];
}> {
  const wasmPath = path.join(
    __dirname,
    '../../../circuitsV2/swap_js',
    'swap.wasm',
  );
  const zkeyPath = path.join(__dirname, '../../../circuitsV2', 'swap_final.zkey');

  const input = {
    privateMinReceived: privateInputs.privateMinReceived,
    inputAmount: publicInputs.inputAmount,
    isSwapXtoY: publicInputs.isSwapXtoY.toString(),
    currentReserveX: publicInputs.currentReserveX,
    currentReserveY: publicInputs.currentReserveY,
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath,
  );
  console.log("🚀 ~ publicSignals:", publicSignals)


  const curve = await buildBn128();
  const proofProc = unstringifyBigInts(proof);
  const publicSignalsUnstrigified = unstringifyBigInts(publicSignals);
  console.log("🚀 ~ publicSignalsUnstrigified:", publicSignalsUnstrigified)

  let proofA = g1Uncompressed(curve, proofProc.pi_a);
  proofA = await negateAndSerializeG1(curve, proofA);

  const proofB = g2Uncompressed(curve, proofProc.pi_b);
  const proofC = g1Uncompressed(curve, proofProc.pi_c);

  await curve.terminate();

  const formattedPublicSignals = publicSignalsUnstrigified.map((signal) => {
    return to32ByteBuffer(BigInt(signal));
  });
  console.log("🚀 ~ formattedPublicSignals ~ formattedPublicSignals:", formattedPublicSignals)

  return {
    proofA: new Uint8Array(proofA),
    proofB: new Uint8Array(proofB),
    proofC: new Uint8Array(proofC),
    publicSignals: formattedPublicSignals,
  };
}
