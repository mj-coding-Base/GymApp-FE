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
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  earnings: {
    label: "Earning",
    color: "#68AE42",
  },
} satisfies ChartConfig;

const years = [ 2025];

interface ChartDataPoint {
  month: string;
  amount: number;
}

interface ChartDataProps {
  chartData?: ChartDataPoint[]; // Make it optional
}

const TotalEarningChart: React.FC<ChartDataProps> = ({ chartData = [] }) => {
  const [selectedYear, setSelectedYear] = useState(years[0]);

  // ⚡ PERFORMANCE OPTIMIZATION: Memoize data transformation
  // Only recompute when chartData changes, not on every render
  const formattedChartData = useMemo(
    () => chartData.map(({ month, amount }) => ({
      month,
      earnings: amount,
    })),
    [chartData]
  );

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
                tickMargin={8}
                tickCount={6}
                width={80}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                interval="preserveStartEnd"
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  indicator="dot" 
                  hideLabel
                  formatter={(value) => {
                    const numValue = typeof value === 'number' ? value : Number(value);
                    return numValue.toLocaleString('en-US');
                  }}
                />}
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