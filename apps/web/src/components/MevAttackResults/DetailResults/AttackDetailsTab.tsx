import AttackDetailCard from "./AttackDetailCard";

// type AttackDetail = {
//   token: string;
//   date: string;
//   txAmount: string;
//   lostAmount: string;
//   percentage: number;
// }

// type AttackDetailsTabProps = {
//   details: AttackDetail[];
//   hasMore: boolean;
//   onLoadMore: () => void;
// }

const AttackDetailsTab = () => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        <AttackDetailCard />
        <AttackDetailCard />
        <AttackDetailCard />
        <AttackDetailCard />
        <AttackDetailCard />
        <AttackDetailCard />
      </div>
    </div>
  );
};

export default AttackDetailsTab;
