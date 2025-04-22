import Modal, { ModalProps } from "@/components/Modal";
import { LocalStorage } from "@/constants/storage";
import useLocalStorage from "@/hooks/useLocalStorage";
import AddressMevLookup from "../AddressMevLookup";

export default function CheckOtherAddressModal(props: ModalProps) {
  const [lookupAddress] = useLocalStorage<string | null>(LocalStorage.LOOKUP_ADDRESS, null);
  return (
    <Modal title="Check other address" {...props}>
      <div className="flex flex-col gap-8 lg:w-[720px]">
        <AddressMevLookup onSubmit={props.onClose} />
        <div className="flex flex-col gap-1">
          <div className="uppercase text-body-2 text-brand-30">address currently added:</div>
          <div className="text-body-2 text-brand-20 break-all">{lookupAddress}</div>
        </div>
      </div>
    </Modal>
  );
}
