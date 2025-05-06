import Modal, { ModalProps } from "@/components/Modal";

export default function WhatIsMevModal(props: ModalProps) {
  return (
    <Modal title="What is MEV?" {...props}>
      <div className="md:w-[430px]">
        <p className="uppercase text-body-2">
          MEV (MAXIMUM EXTRACTABLE VALUE) REFERS TO THE PROFITS THAT MINERS, VALIDATORS, OR ANYONE CONTROLLING
          TRANSACTION ORDERING CAN EXTRACT BY REORDERING, INCLUDING, OR EXCLUDING TRANSACTIONS WITHIN A BLOCK.
          <br />
          <br />
          ONE OF THE MOST COMMON FORMS OF MEV IS THE SANDWICH ATTACK. THIS HAPPENS WHEN A MALICIOUS ACTOR PLACES A TRADE
          RIGHT BEFORE AND AFTER A USER&#39;S TRADE TO MANIPULATE THE PRICE, EXTRACTING PROFIT IN THE PROCESS.
          <br />
          <br />
          In this tool, we calculate the MEV loss specifically from Sandwich Attacks on Raydium and Pump.fun.
        </p>
      </div>
    </Modal>
  );
}
