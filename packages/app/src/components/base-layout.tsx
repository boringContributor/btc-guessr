import { FC, ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: FC<BaseLayoutProps> = ({ children }) => {
  return <div className="flex flex-col gap-5 items-center">{children}</div>;
};

export default BaseLayout;
