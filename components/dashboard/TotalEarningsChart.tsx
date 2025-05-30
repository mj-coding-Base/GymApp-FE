"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  earnings: {
    label: "Earning",
    color: "#68AE42",
  },
} satisfies ChartConfig;

const years = [2022, 2023, 2024, 2025];

interface ChartDataPoint {
  month: string;
  amount: number;
}

interface ChartDataProps {
  chartData?: ChartDataPoint[]; // Make it optional
}

const TotalEarningChart: React.FC<ChartDataProps> = ({ chartData = [] }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const formattedChartData = Object.values(chartData).map(({ month, amount }) => ({
  month,
   earnings: amount, 
}));


  // Ensure data is always an array and has the correct structure

console.log("Chart Data:", formattedChartData);
  return (
    <div className="mb-[32px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-14 font-semibold">Total Earnings</h2>
        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-24 bg-[#FFFFFF] text-[12px] font-normal">
            <SelectValue placeholder={selectedYear} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="pt-[33px] overflow-x-auto scrollbar-hide max-w-lg">
        <CardContent className="p-0 min-w-[400px]">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[328px] w-full"
          >
            <AreaChart data={formattedChartData} width={1000}>
              <defs>
                <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#fac1be"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#fac1be"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <YAxis
                dataKey="earnings"
                tickLine={false}
                axisLine={false}
                tickMargin={-2}
                tickCount={-1}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={0}
                tickFormatter={(value) => value.slice(0, 4)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="earnings"
                type="monotone"
                fill="url(#fillEarnings)"
                stroke="#fac1be"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TotalEarningChart;