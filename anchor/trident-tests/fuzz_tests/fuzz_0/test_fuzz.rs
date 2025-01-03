use trident_client::fuzzing::*;
mod fuzz_instructions;
use darklake::entry as entry_darklake;
use darklake::ID as PROGRAM_ID;
use fuzz_instructions::FuzzInstruction;
const PROGRAM_NAME: &str = "darklake";
struct InstructionsSequence;
/// Define instruction sequences for invocation.
/// `pre` runs at the start, `middle` in the middle, and `post` at the end.
/// For example, to call `InitializeFn`, `UpdateFn` and then `WithdrawFn` during
/// each fuzzing iteration:
/// ```
/// use fuzz_instructions::{InitializeFn, UpdateFn, WithdrawFn};
/// impl FuzzDataBuilder<FuzzInstruction> for InstructionsSequence {
///     pre_sequence!(InitializeFn,UpdateFn);
///     middle_sequence!(WithdrawFn);
///}
/// ```
/// For more details, see: https://ackee.xyz/trident/docs/latest/features/instructions-sequences/#instructions-sequences
impl FuzzDataBuilder<FuzzInstruction> for InstructionsSequence {}
/// `fn fuzz_iteration` runs during every fuzzing iteration.
/// Modification is not required.
fn fuzz_iteration<T: FuzzTestExecutor<U> + std::fmt::Display, U>(
    fuzz_data: FuzzData<T, U>,
    config: &Config,
) {
    let fuzzing_program_darklake = FuzzingProgram::new(
        PROGRAM_NAME,
        &PROGRAM_ID,
        processor!(convert_entry!(entry_darklake)),
    );
    let mut client = ProgramTestClientBlocking::new(&[fuzzing_program_darklake], config).unwrap();
    let _ = fuzz_data.run_with_runtime(&mut client, config);
}
fn main() {
    let config = Config::new();
    fuzz_trident ! (fuzz_ix : FuzzInstruction , | fuzz_data : InstructionsSequence | { fuzz_iteration (fuzz_data , & config) ; });
}
