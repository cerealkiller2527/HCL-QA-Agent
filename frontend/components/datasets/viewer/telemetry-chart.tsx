"use client"

import { useMemo, memo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis } from "recharts"

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

const TelemetryChart = memo(function TelemetryChart({ title, data, lines, currentData, yDomain }: TelemetryChartProps) {
  // Memoized formatter functions for better performance
  const timeFormatter = useCallback((value: number | string) => `${Number(value).toFixed(1)}s`, [])
  const valueFormatter = useCallback((value: number | string) => Number(value).toFixed(1), [])
  const tooltipValueFormatter = useCallback((value: number | string) => [`${Number(value).toFixed(2)}°`, ""], [])
  const tooltipLabelFormatter = useCallback((label: number | string) => `Time: ${Number(label).toFixed(2)}s`, [])

  // Memoized name cleaner for performance
  const cleanName = useCallback((name: string) => {
    return name.replace(/^(action\.|state\.|observation\.state\.|_action|_obs)/, '')
  }, [])

  const chartConfig = useMemo(() => 
    lines.reduce<ChartConfig>((config, line) => {
      config[line.dataKey] = {
        label: line.name,
        color: line.color,
      }
      return config
    }, {}), 
    [lines]
  )

  // Filter out lines with missing data keys and validate data with performance optimization
  const validLines = useMemo(() => {
    if (data.length === 0) return []
    
    const firstDataPoint = data[0]
    const availableKeys = new Set(Object.keys(firstDataPoint))
    
    return lines.filter(line => {
      const hasData = availableKeys.has(line.dataKey)
      if (!hasData) {
        console.debug(`Filtering out line ${line.dataKey}: not found in telemetry data`)
      }
      return hasData
    })
  }, [data, lines])

  // Early return if no valid data
  if (data.length === 0 || validLines.length === 0) {
    return (
      <Card className="layer-card">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="layer-card">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart 
            data={data} 
            width={800}
            height={192}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            syncId="telemetry"
          >
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickMargin={6}
              tickFormatter={timeFormatter}
            />
            <YAxis
              domain={yDomain || ["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickMargin={6}
              width={45}
              tickFormatter={valueFormatter}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                valueFormatter={tooltipValueFormatter}
                labelFormatter={tooltipLabelFormatter}
              />}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
                padding: "8px"
              }}
            />
            {validLines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>

        {/* Current Values - Optimized */}
        {currentData && validLines.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {validLines.map((line) => {
                const value = currentData[line.dataKey];
                const formattedValue = typeof value === 'number' && !isNaN(value) 
                  ? value.toFixed(2) 
                  : "0.00";
                
                return (
                  <div key={line.dataKey} className="flex flex-col items-center gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 max-w-full">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: line.color }}
                      />
                      <span className="text-muted-foreground font-medium truncate text-xs">
                        {cleanName(line.name)}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-xs" style={{ color: line.color }}>
                      {formattedValue}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export { TelemetryChart }
