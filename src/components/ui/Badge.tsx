import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        {
          'bg-brand-500/20 text-brand-400': variant === 'success',
          'bg-accent-400/20 text-accent-400': variant === 'warning',
          'bg-red-500/20 text-red-400': variant === 'danger',
          'bg-blue-500/20 text-blue-400': variant === 'info',
          'bg-white/10 text-white/60': variant === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
