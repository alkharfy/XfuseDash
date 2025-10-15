"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  clients: {
    label: "عملاء جدد",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ClientAcquisitionChart({ data }: { data: { month: string; clients: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <AreaChart
            accessibilityLayer
            data={data}
            margin={{
                left: 12,
                right: 12,
            }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={3}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    indicator="dot"
                    formatter={(value) => `${value} عميل`}
                />}
            />
            <Area
                dataKey="clients"
                type="natural"
                fill="var(--color-clients)"
                fillOpacity={0.4}
                stroke="var(--color-clients)"
                stackId="a"
            />
        </AreaChart>
    </ChartContainer>
  )
}
