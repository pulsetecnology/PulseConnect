import React from 'react'
import { LucideIcon } from 'lucide-react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  onClick?: () => void
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface CardIconProps {
  icon: LucideIcon
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-xl 
        ${shadowClasses[shadow]} 
        ${paddingClasses[padding]} 
        ${hover ? 'hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  )
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <h3 className={`
      ${sizeClasses[size]} 
      font-semibold 
      text-gray-900 dark:text-white 
      ${className}
    `}>
      {children}
    </h3>
  )
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  )
}

const CardIcon: React.FC<CardIconProps> = ({ 
  icon: Icon, 
  className = '', 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const variantClasses = {
    default: 'text-gray-500 dark:text-gray-400',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  }

  return (
    <Icon className={`
      ${sizeClasses[size]} 
      ${variantClasses[variant]} 
      ${className}
    `} />
  )
}

// Componente especializado para Job Cards
interface JobCardProps {
  title: string
  description: string
  budget: { min?: number; max?: number }
  category: string
  location?: string
  postedAt: string
  proposalsCount?: number
  onClick?: () => void
  className?: string
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  description,
  budget,
  category,
  location,
  postedAt,
  proposalsCount = 0,
  onClick,
  className = ''
}) => {
  const formatBudget = () => {
    if (budget.min && budget.max) {
      return `R$ ${budget.min.toLocaleString()} - R$ ${budget.max.toLocaleString()}`
    } else if (budget.min) {
      return `A partir de R$ ${budget.min.toLocaleString()}`
    } else if (budget.max) {
      return `Até R$ ${budget.max.toLocaleString()}`
    }
    return 'Orçamento a combinar'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Há 1 dia'
    if (diffDays < 7) return `Há ${diffDays} dias`
    if (diffDays < 30) return `Há ${Math.ceil(diffDays / 7)} semanas`
    return `Há ${Math.ceil(diffDays / 30)} meses`
  }

  return (
    <Card 
      hover 
      className={`cursor-pointer ${className}`} 
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle size="md" className="mb-2 line-clamp-2">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                {category}
              </span>
              {location && (
                <span className="flex items-center">
                  📍 {location}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-4 line-clamp-3">
          {description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold text-green-600 dark:text-green-400">
            {formatBudget()}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {proposalsCount} proposta{proposalsCount !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(postedAt)}
        </span>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
          Ver detalhes →
        </button>
      </CardFooter>
    </Card>
  )
}

// Exportar todos os componentes
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardIcon,
  JobCard
}

export default Card