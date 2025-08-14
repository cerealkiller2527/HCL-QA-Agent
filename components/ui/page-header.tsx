"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ANIMATION } from "@/lib/constants"

interface PageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.slideUp}>
      <div className="space-y-1">
        <h1 className="text-display">{title}</h1>
        <p className="text-muted-foreground text-body">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
