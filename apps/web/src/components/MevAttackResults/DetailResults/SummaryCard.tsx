import { ReactNode } from "react";

export default function SummaryCard({ title, content }: { title: string, content: ReactNode }) {
  return (
    <div className="flex flex-col bg-brand-60 gap-[16px] p-[16px] h-full">
      <div className="text-body-2 text-brand-30">{title}</div>
      {content}
    </div>
  );
}
