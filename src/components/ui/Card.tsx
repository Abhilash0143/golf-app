import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export default function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6',
        glow && 'shadow-lg shadow-brand-500/5 hover:shadow-brand-500/10 transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
