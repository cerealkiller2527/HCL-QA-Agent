"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { Activity, TrendingUp } from "lucide-react"
import { TelemetryData, TelemetryPoint } from "@/lib/api/schemas/viewer.schema"
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary"
import { TELEMETRY_CONSTANTS } from "@/lib/constants/telemetry"

interface TelemetryDisplayProps {
  data: TelemetryPoint[]
  currentTime: number
  duration: number
  onTimeSeek: (time: number) => void
  rawTelemetryData?: TelemetryData | null
}

export function TelemetryDisplay({ data, currentTime, duration, onTimeSeek, rawTelemetryData }: TelemetryDisplayProps) {
  
  // Find the data point closest to current time
  const currentDataPoint = useMemo(() => {
    if (!data || data.length === 0) return null
    
    if (data.length === 1) return data[0]
    
    // Find the point just before or at current time
    let beforeIndex = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i].time <= currentTime) {
        beforeIndex = i
      } else {
        break
      }
    }
    
    // If we're at or past the last point, return it
    if (beforeIndex >= data.length - 1) {
      return data[data.length - 1]
    }
    
    // Return the closest point (before or after)
    const beforePoint = data[beforeIndex]
    const afterPoint = data[beforeIndex + 1]
    
    const beforeDiff = Math.abs(beforePoint.time - currentTime)
    const afterDiff = Math.abs(afterPoint.time - currentTime)
    
    return beforeDiff <= afterDiff ? beforePoint : afterPoint
  }, [data, currentTime])

  // Extract keys from data
  const { stateKeys, actionKeys } = useMemo(() => {
    if (!data || data.length === 0) {
      return { stateKeys: [], actionKeys: [] }
    }
    
    const allKeys = Object.keys(data[0])
    const states = allKeys
      .filter(key => key !== 'time' && (key.includes('state') || key.includes('obs')))
      .slice(0, TELEMETRY_CONSTANTS.MAX_CHART_LINES)
    
    const actions = allKeys
      .filter(key => key !== 'time' && key.includes('action'))
      .slice(0, TELEMETRY_CONSTANTS.MAX_CHART_LINES)
    
    return { stateKeys: states, actionKeys: actions }
  }, [data])

  const colors = TELEMETRY_CONSTANTS.CHART_COLORS

  const handleChartClick = (chartData: { activePayload?: Array<{ payload: { time: number } }> }) => {
    if (chartData && chartData.activePayload && chartData.activePayload.length > 0) {
      const time = chartData.activePayload[0].payload.time
      onTimeSeek(time)
    }
  }

  // Helper function to get display name for a key
  const getDisplayName = (key: string): string => {
    return key
      .replace('observation.state.', '')
      .replace('_obs', '')
      .replace('_action', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Helper function to get unit for a key
  const getUnit = (key: string): string => {
    if (!rawTelemetryData?.feature_units) return ''
    
    for (const [dataKey, unit] of Object.entries(rawTelemetryData.feature_units)) {
      if (key.includes(dataKey)) {
        return unit || ''
      }
    }
    
    return ''
  }

  // Format value with proper decimal places
  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return "--"
    return value.toFixed(TELEMETRY_CONSTANTS.DECIMAL_PLACES)
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 bg-layer-2 rounded-lg flex items-center justify-center border border-border">
        <div className="text-center space-y-2">
          <Activity className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground font-sans">No telemetry data available</p>
          <p className="text-sm text-muted-foreground font-sans">
            Telemetry will appear here when episode data is loaded
          </p>
        </div>
      </div>
    )
  }

  // Render chart for specific data type
  const renderChart = (dataType: 'states' | 'actions') => {
    const keys = dataType === 'states' ? stateKeys : actionKeys
    
    if (keys.length === 0) return null
    
    const title = dataType === 'states' ? 'States' : 'Actions'
    const icon = dataType === 'states' ? <Activity className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
    
    return (
      <Card className="layer-card mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-sans text-sm flex items-center gap-2">
              {icon}
              Robot {title}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {keys.length} signal{keys.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary>
            <div className="w-full" style={{ height: `${TELEMETRY_CONSTANTS.CHART_HEIGHT}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data} 
                  onClick={handleChartClick}
                  margin={TELEMETRY_CONSTANTS.CHART_MARGIN}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, duration]}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    formatter={(value: number | string, name: string) => {
                      const unit = getUnit(name)
                      const numValue = typeof value === 'string' ? parseFloat(value) : value
                      return [formatValue(numValue) + (unit ? ` ${unit}` : ''), getDisplayName(name)]
                    }}
                  />
                  
                  {/* Current time indicator */}
                  <ReferenceLine 
                    x={currentTime} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={TELEMETRY_CONSTANTS.STROKE_WIDTH.reference}
                    strokeOpacity={TELEMETRY_CONSTANTS.OPACITY.reference}
                  />
                  
                  {keys.map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[idx % colors.length]}
                      strokeWidth={TELEMETRY_CONSTANTS.STROKE_WIDTH.line}
                      dot={false}
                      name={key}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartErrorBoundary>
          
          {/* Current Values Grid */}
          <div className={`mt-4 grid grid-cols-1 ${TELEMETRY_CONSTANTS.VALUE_GRID_BREAKPOINTS.sm} ${TELEMETRY_CONSTANTS.VALUE_GRID_BREAKPOINTS.lg} gap-3`}>
            {keys.map((key, idx) => {
              const displayName = getDisplayName(key)
              const unit = getUnit(key)
              const value = currentDataPoint?.[key]
              
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-md bg-layer-2/50 border border-border/50">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-xs text-muted-foreground truncate" title={displayName}>
                      {displayName}
                    </span>
                  </div>
                  <span 
                    className="font-mono text-xs font-medium ml-2 flex-shrink-0" 
                    style={{ color: colors[idx % colors.length] }}
                  >
                    {formatValue(value)}{unit && (
                      <span className="text-muted-foreground ml-1">{unit}</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {renderChart('states')}
      {renderChart('actions')}

      {/* Time Display */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground font-mono">
          Time: {formatValue(currentTime)}s / {formatValue(duration)}s
        </div>
        <div className="text-muted-foreground text-xs">
          Frame: {Math.floor((currentTime / duration) * (data?.length || 100))}/{data?.length || 100}
        </div>
      </div>
    </div>
  )
}

