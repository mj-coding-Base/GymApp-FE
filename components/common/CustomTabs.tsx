import React, { JSX } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomTabsProps {
  tabsData: {
    title: string;
    value: string;
    path: string;
    content: () => JSX.Element;
    className: string;
  }[];
  path: string;
  type?: string;
  filters?: JSX.Element;
  tabContentClassName?: string;
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabsData,
  type,
  tabContentClassName,
}) => {
  return (
    <Tabs
      defaultValue={tabsData[0].value}
      value={type ?? tabsData[0].value}
      className="w-full"
    >
      <div className="flex items-center justify-between">
        <TabsList
          className={cn(
            `w-full flex flex-row justify-start rounded-none shadow-none bg-transparent gap-[15px] p-0 h-[42px] border-b-[2px] border-[#E7E7E7]`
          )}
        >
          {tabsData.map((tab, index) => (
            <a key={index} href={tab.path} className="h-full">
              <TabsTrigger
                value={tab.value}
                className={cn(
                  "text-[#424242] text-[13.5px]/[23.4px] font-medium rounded-none h-full data-[state=active]:font-bold data-[state=active]:text-[#00BC15] data-[state=active]:bg-transparent data-[state=active]:border-b-[2px] data-[state=active]:border-b-[#00BC15]",
                  tab.className
                )}
              >
                {tab.title}
              </TabsTrigger>
            </a>
          ))}
        </TabsList>
      </div>
      <Card className="flex flex-col bg-transparent border-none shadow-none pt-[8px]">
        {tabsData.map((tab, index) => (
          <TabsContent
            key={index}
            value={tab.value}
            className={cn("overflow-hidden", tabContentClassName)}
          >
            {tab.content()}
          </TabsContent>
        ))}
      </Card>
    </Tabs>
  );
};

export default CustomTabs;
