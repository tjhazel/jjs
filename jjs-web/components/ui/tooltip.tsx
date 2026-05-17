"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Simple tooltip using daisyUI tooltip class
interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, side = 'top', className, children, ...props }, ref) => {
    const sideClass = {
      top: 'tooltip-top',
      bottom: 'tooltip-bottom',
      left: 'tooltip-left',
      right: 'tooltip-right'
    }[side]

    return (
      <div
        ref={ref}
        className={cn('tooltip', sideClass, className)}
        data-tip={content}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

// Provider for tooltip context (backward compatibility)
const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
TooltipProvider.displayName = "TooltipProvider"

export { Tooltip, TooltipProvider }

