import { FC, ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="mx-auto max-w-7xl pb-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col gap-5 items-center">{children}</div>
    </div>
  );
};

export default BaseLayout;
