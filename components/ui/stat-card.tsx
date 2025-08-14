"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { ANIMATION_VARIANTS, ANIMATION_DURATION } from "@/lib/constants/animations"

const MotionCard = motion(Card)

interface StatCardProps {
  icon?: LucideIcon
  title: string
  value: string | number
  description: string
  status?: string
  statusColor?: string
  href?: string
  action?: React.ReactNode
  index?: number
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  status,
  statusColor = "bg-primary",
  action,
  index = 0,
}: StatCardProps) {
  return (
    <MotionCard
      className="layer-interactive"
      variants={ANIMATION_VARIANTS.staggerItem}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: ANIMATION_DURATION.fast }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon ? (
              <motion.div
                className="p-2 rounded-lg bg-primary/10"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: ANIMATION_DURATION.fast }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>
            ) : (
              <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
            )}
            <div>
              <p className="text-2xl font-mono-medium">{value}</p>
              <p className="text-caption">{description}</p>
            </div>
          </div>
          {(status || action) && (
            <div>
              {status && <div className="text-code text-primary bg-primary/10 px-2 py-1 rounded">{status}</div>}
              {action}
            </div>
          )}
        </div>
      </CardContent>
    </MotionCard>
  )
}
