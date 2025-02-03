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

export type IbrlInputs = {
  x_rand: string;
  y_rand: string;
  k_rand: string;
  trade_amount: string;
  min_output: string;
};

export type IbrlResult = {
  proofA: Uint8Array;
  proofB: Uint8Array;
  proofC: Uint8Array;
  publicSignals: Uint8Array[];
  salt: Uint8Array;
};

export async function ibrlGenerateProof(
  inputs: IbrlInputs,
): Promise<IbrlResult> {
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

  const input = {
    x_rand: inputs.x_rand,
    y_rand: inputs.y_rand,
    k_rand: inputs.k_rand,
    trade_amount: inputs.trade_amount,
    min_output: inputs.min_output,
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath,
  );

  const curve = await buildBn128();
  const proofProc = unstringifyBigInts(proof);
  const publicSignalsUnstrigified = unstringifyBigInts(publicSignals);

  let proofA = g1Uncompressed(curve, proofProc.pi_a);
  proofA = await negateAndSerializeG1(curve, proofA);

  const proofB = g2Uncompressed(curve, proofProc.pi_b);
  const proofC = g1Uncompressed(curve, proofProc.pi_c);

  await curve.terminate();

  const formattedPublicSignals = publicSignalsUnstrigified.map((signal) => {
    return to32ByteBuffer(BigInt(signal));
  });

  return {
    proofA: new Uint8Array(proofA),
    proofB: new Uint8Array(proofB),
    proofC: new Uint8Array(proofC),
    publicSignals: formattedPublicSignals,
    salt: new Uint8Array(
      formattedPublicSignals[formattedPublicSignals.length - 1],
    ),
  };
}
