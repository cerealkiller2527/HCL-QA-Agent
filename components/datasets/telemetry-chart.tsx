"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface TelemetryChartProps {
  title: string
  data: any[]
  lines: {
    dataKey: string
    color: string
    name: string
  }[]
  currentData?: any
  yDomain?: [number, number]
}

export function TelemetryChart({ title, data, lines, currentData, yDomain }: TelemetryChartProps) {
  const chartConfig = lines.reduce((config, line) => {
    config[line.dataKey] = {
      label: line.name,
      color: line.color,
    }
    return config
  }, {} as any)

  return (
    <Card className="layer-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-sans text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={yDomain || "dataMin"}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Data Values */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-4 text-xs">
            {lines.map((line) => (
              <div key={line.dataKey} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: line.color }}></div>
                <span style={{ color: line.color }} className="font-mono">
                  {line.name}
                </span>
              </div>
            ))}
          </div>

          {currentData && (
            <div className="grid grid-cols-1 gap-2 text-xs">
              {lines.map((line) => (
                <div key={line.dataKey} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: line.color }}></div>
                    <span className="text-muted-foreground">{line.name}</span>
                  </div>
                  <span className="font-mono" style={{ color: line.color }}>
                    {currentData[line.dataKey]?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
