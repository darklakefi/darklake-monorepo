import Modal, { ModalProps } from "@/components/Modal";
import { LocalStorage } from "@/constants/storage";
import useLocalStorage from "use-local-storage";
import AddressMevLookup from "../AddressMevLookup";

export default function CheckOtherAddressModal(props: ModalProps) {
  const [lookupAddress] = useLocalStorage(LocalStorage.LOOKUP_ADDRESS, null);
  return (
    <Modal title="Check other address" {...props}>
      <div className="flex flex-col gap-8 lg:min-w-3xl">
        <AddressMevLookup onSubmit={props.onClose} />
        <div className="flex flex-col gap-1">
          <div className="uppercase text-lg leading-6 tracking-normal text-brand-30">address currently added:</div>
          <div className="text-lg leading-6 tracking-normal text-brand-20 break-all">{lookupAddress}</div>
        </div>
      </div>
    </Modal>
  );
}
