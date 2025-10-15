"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  tasks: {
    label: "المهام",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function TeamPerformanceChart({ data }: { data: { name: string; tasks: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 15)}
        />
        <XAxis dataKey="tasks" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="tasks" fill="var(--color-tasks)" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}
