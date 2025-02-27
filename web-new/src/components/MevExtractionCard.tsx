
interface MevExtractionCardProps {
    children: React.ReactNode
}

export default function MevExtractionCard(props: MevExtractionCardProps) {
    const {children} = props;
    return <div className="flex-1 flex overflow-hidden flex-col p-4 uppercase leading-none bg-brand-60">{children}</div>
}