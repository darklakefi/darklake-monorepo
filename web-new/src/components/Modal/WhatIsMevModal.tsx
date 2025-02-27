import Modal, { ModalProps } from "@/components/Modal";

export default function WhatIsMevModal(props: ModalProps) {
  return (
    <Modal title="What is MEV?" {...props}>
      <p className="uppercase">
        MEV (Maximum Extractable Value) refers to the profits that miners, validators, or anyone controlling transaction
        ordering can extract by reordering, including, or excluding transactions within a block.
        <br />
        <br />
        One of the most common forms of MEV is the <span className="text-brand-20">Sandwich Attack</span>. This happens
        when a malicious actor places a trade right before and after a user&#39;s trade to manipulate the price,
        extracting profit in the process.
        <br />
        <br />
        In this tool, we calculate the MEV loss specifically from Sandwich Attacks on Raydium and Pump.fun.
      </p>
    </Modal>
  );
}
