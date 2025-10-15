"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const statusTranslation: { [key: string]: string } = {
    pending: "معلق",
    in_progress: "قيد التنفيذ",
    under_review: "قيد المراجعة",
    completed: "مكتمل",
};

const CHART_CONFIG = {
  pending: {
    label: "معلق",
    color: "hsl(var(--chart-1))",
  },
  in_progress: {
    label: "قيد التنفيذ",
    color: "hsl(var(--chart-2))",
  },
  under_review: {
    label: "قيد المراجعة",
    color: "hsl(var(--chart-3))",
  },
  completed: {
    label: "مكتمل",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function ClientsStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const total = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  
  const chartData = data.map(item => ({
      ...item,
      name: statusTranslation[item.name] || item.name,
      fill: `var(--color-${item.name})`
  }));

  return (
    <ChartContainer
      config={CHART_CONFIG}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
             {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  )
}
