import { MevAttack } from "@/types/Mev";
import AttackDetailCard from "@/components/AttackDetailCard";
import { useAttackBreakdownModal } from "@/providers/AttackBreakdownModalProvider";

type AttackDetailsTabProps = {
  mevAttacks: MevAttack[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
};

const AttackDetailsTab = ({ mevAttacks, hasMore, onLoadMore, isLoadingMore }: AttackDetailsTabProps) => {
  const { openModal } = useAttackBreakdownModal();

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {mevAttacks?.map((attack, index) => (
          <AttackDetailCard key={index} mevAttack={attack} onOpenModal={() => openModal(attack)} />
        ))}
      </div>

      {hasMore && !isLoadingMore && (
        <button
          className="w-fit text-center bg-brand-60 px-[12px] py-[5px] hover-with-active mx-auto"
          onClick={onLoadMore}
        >
          <div className="text-body-2 text-brand-20">Load More</div>
        </button>
      )}

      {isLoadingMore && (
        <div className="text-brand-20 w-fit text-center mx-auto">
          <div className="animate-spin p-0 w-[20px] h-[20px] text-[20px]">
            <i className="hn hn-spinner-solid" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackDetailsTab;
