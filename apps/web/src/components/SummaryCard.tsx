import { ReactNode } from "react";

export default function SummaryCard({ title, content }: { title: string; content: ReactNode }) {
  return (
    <div className="flex flex-col bg-brand-60 gap-4 p-4 h-full">
      <div className="text-lg leading-6 tracking-normal text-brand-30 uppercase">{title}</div>
      {content}
    </div>
  );
}
