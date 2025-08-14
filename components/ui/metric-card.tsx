"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { ANIMATION } from "@/lib/constants"

const MotionCard = motion(Card)

interface MetricCardProps {
  title?: string
  value?: string | number
  description?: string
  icon?: LucideIcon
  status?: string
  statusColor?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  status,
  statusColor = "bg-primary",
  action,
  children,
  className,
}: MetricCardProps) {
  return (
    <MotionCard
      className={`layer-interactive ${className || ""}`}
      variants={ANIMATION.variants.staggerItem}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: ANIMATION.duration.fast }}
    >
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-subtitle">{title}</CardTitle>
            {action}
          </div>
          {description && <p className="text-caption">{description}</p>}
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "p-4"}>
        {children || (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon ? (
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className={`w-2 h-2 rounded-full ${statusColor}`} />
              )}
              <div>
                {value && <p className="text-2xl font-mono-medium">{value}</p>}
                {description && <p className="text-caption">{description}</p>}
              </div>
            </div>
            {status && <div className="text-code text-primary bg-primary/10 px-2 py-1 rounded">{status}</div>}
          </div>
        )}
      </CardContent>
    </MotionCard>
  )
}
