import { MevAttack } from "@/types/Mev";
import AttackDetailCard from "./AttackDetailCard";

type AttackDetailsTabProps = {
  mevAttacks: MevAttack[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const AttackDetailsTab = ({
  mevAttacks,
  hasMore,
  onLoadMore,
}: AttackDetailsTabProps) => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {mevAttacks?.map((attack, index) => <AttackDetailCard mevAttack={attack} key={index} />)}
      </div>

      { hasMore && (
        <button
          className="w-fit text-center bg-brand-60 px-[12px] py-[5px] hover-with-active mx-auto"
          onClick={onLoadMore}
        >
          <div className="text-body-2 text-brand-20">Load More</div>
        </button>
      )
      }
    </div>
  );
};

export default AttackDetailsTab;
