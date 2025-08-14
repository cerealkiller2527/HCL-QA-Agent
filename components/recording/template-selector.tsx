"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Camera, Activity, Zap } from "lucide-react"
import { recordingTemplates } from "@/lib/data/recording-templates"
import type { RecordingTemplate } from "@/lib/types/recording"

interface TemplateSelectorProps {
  selectedTemplate: RecordingTemplate | null
  onSelectTemplate: (template: RecordingTemplate) => void
  disabled?: boolean
}

const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  mobile: { label: "Mobile Robot", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  humanoid: { label: "Humanoid", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
  custom: { label: "Custom", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
}

const sensorIcons = {
  camera: Camera,
  lidar: Activity,
  imu: Activity,
  force: Zap,
  joint_position: Activity,
  custom: Bot,
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate, disabled = false }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading font-semibold mb-2">Recording Templates</h3>
        <p className="text-sm text-muted-foreground">Choose a pre-configured template or start from scratch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recordingTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id ? "ring-2 ring-lerobot-orange" : ""
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-heading">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </div>
                <Badge className={robotTypeConfig[template.robotType].color}>
                  {robotTypeConfig[template.robotType].label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Sensors */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sensors ({template.sensors.length})</p>
                <div className="flex flex-wrap gap-1">
                  {template.sensors.slice(0, 4).map((sensor) => {
                    const SensorIcon = sensorIcons[sensor.type] || Bot
                    return (
                      <div key={sensor.id} className="flex items-center gap-1 px-2 py-1 bg-accent/50 rounded text-xs">
                        <SensorIcon className="h-3 w-3" />
                        <span>{sensor.name}</span>
                      </div>
                    )
                  })}
                  {template.sensors.length > 4 && (
                    <div className="px-2 py-1 bg-accent/50 rounded text-xs">+{template.sensors.length - 4}</div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Frame Rate: {template.settings.frameRate} FPS</div>
                <div>Quality: {template.settings.qualityThreshold}%</div>
              </div>

              {selectedTemplate?.id === template.id && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-lerobot-orange">
                    <div className="w-2 h-2 bg-lerobot-orange rounded-full" />
                    Selected Template
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Button variant="outline" disabled={disabled} onClick={() => onSelectTemplate(null as any)}>
            <Bot className="h-4 w-4 mr-2" />
            Start from Scratch
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
