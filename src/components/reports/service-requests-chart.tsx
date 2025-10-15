"use client"

import * as React from "react"
import { RadialBar, RadialBarChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig = {
  requests: {
    label: "الطلبات",
  },
  marketResearch: {
    label: "أبحاث السوق",
    color: "hsl(var(--chart-1))",
  },
  creative: {
    label: "الإبداع",
    color: "hsl(var(--chart-2))",
  },
  content: {
    label: "المحتوى",
    color: "hsl(var(--chart-3))",
  },
  aiVideo: {
    label: "فيديو AI",
    color: "hsl(var(--chart-4))",
  },
  ads: {
    label: "الإعلانات",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ServiceRequestsChart({ data }: { data: { name: string; value: number; fill: string }[] }) {

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <RadialBarChart
        data={data}
        startAngle={-90}
        endAngle={270}
        innerRadius={30}
        outerRadius={110}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <RadialBar dataKey="value" background />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" className="flex flex-wrap gap-2" />}
          className="-translate-y-10 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </RadialBarChart>
    </ChartContainer>
  )
}
