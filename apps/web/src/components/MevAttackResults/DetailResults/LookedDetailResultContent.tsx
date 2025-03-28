import Tabs from "@/components/Tabs";
import SummaryTab from "./SummaryTab";
import Button from "@/components/Button";

const TAB_NAMES = [
  {
    text: "[SUMMARY]",
  },
  {
    text: "[ATTACKS]",
  },
];

interface LookedDetailResultContentProps {
  onConnect: () => void;
  connectWithTwitterDisabled: boolean;
}

export default function LookedDetailResultContent(props: LookedDetailResultContentProps) {
  const handleConnect = () => {
    if (props.connectWithTwitterDisabled) {
      return;
    }
    props?.onConnect();
  };

  return (
    <div className="relative">
      <div className="">
        <Tabs tabs={TAB_NAMES.map((tab) => tab.text)} wrapperClassName="py-[16px] gap-[24px]" activeTab={0} />
        <div>
          <SummaryTab.Blurred />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-[#010F06F2] bg-opacity-95">
        <div className="flex flex-col gap-[40px]">
          <div className="flex flex-col gap-[20px] text-body-2 text-center">
            <div> ******************************** </div>
            <div className="uppercase"> * ACCESS DENIED * </div>
            <div> ******************************** </div>
          </div>
          <Button intent="primary-light" onClick={handleConnect} disabled={props.connectWithTwitterDisabled}>
            Connect <i className="hn hn-x text-brand-30 mx-2" /> to access complete case file
          </Button>
        </div>
      </div>
    </div>
  );
}
