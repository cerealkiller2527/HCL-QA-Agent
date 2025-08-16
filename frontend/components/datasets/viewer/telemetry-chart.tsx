"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface TelemetryDataPoint {
  time: number
  [key: string]: number | string
}

interface ChartLine {
  dataKey: string
  color: string
  name: string
}

interface TelemetryChartProps {
  title: string
  data: TelemetryDataPoint[]
  lines: ChartLine[]
  currentData?: TelemetryDataPoint
  yDomain?: [number, number]
}

type ChartConfig = Record<string, { label: string; color: string }>

export function TelemetryChart({ title, data, lines, currentData, yDomain }: TelemetryChartProps) {
  const chartConfig = lines.reduce<ChartConfig>((config, line) => {
    config[line.dataKey] = {
      label: line.name,
      color: line.color,
    }
    return config
  }, {})

  // Debug: Check if data has the required fields
  if (data.length > 0) {
    const firstDataPoint = data[0]
    lines.forEach(line => {
      if (!(line.dataKey in firstDataPoint)) {
        console.warn(`Missing data key: ${line.dataKey} in telemetry data`)
      }
    })
  }

  return (
    <Card className="layer-card">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
              />
              <YAxis
                domain={yDomain || ["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
                width={40}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ 
                    r: 4, 
                    fill: line.color,
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2.5
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Current Values - Simplified */}
        {currentData && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              {lines.map((line, index) => (
                <div key={line.dataKey} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }}></div>
                    <span className="text-muted-foreground font-medium">
                      {line.name.split('.')[0]}
                    </span>
                  </div>
                  <span className="font-mono font-semibold" style={{ color: line.color }}>
                    {currentData[line.dataKey]?.toFixed(1) || "0.0"}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
