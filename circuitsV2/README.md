# Circuit generation process

circom swap.circom --r1cs --wasm --sym -l ./.. # works from "circuits" directory
snarkjs powersoftau new bn128 14 pot.ptau
snarkjs powersoftau contribute pot.ptau pot_cont.ptau --name="Some randomness" -v
snarkjs powersoftau prepare phase2 pot_cont.ptau pot_final.ptau  -v
snarkjs groth16 setup swap.r1cs pot_final.ptau swap_0000.zkey
snarkjs zkey contribute swap_0000.zkey swap_final.zkey --name="Some randomness 2" -v
snarkjs zkey export verificationkey swap_final.zkey verification_key.json
