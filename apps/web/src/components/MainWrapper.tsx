interface MainWrapperProps {
  children: React.ReactNode;
}
const MainWrapper = ({ children }: MainWrapperProps) => <div className="pb-[80px]">{children}</div>;

export default MainWrapper;
