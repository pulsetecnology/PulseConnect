import React, { forwardRef } from 'react'
import { LucideIcon, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  onRightIconClick?: () => void
  variant?: 'default' | 'filled' | 'outlined'
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    success,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    variant = 'default',
    inputSize = 'md',
    className = '',
    type = 'text',
    disabled,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  }
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
    }
    if (success) {
      return 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
    }
    return variantClasses[variant]
  }

  const paddingWithIcons = () => {
    let padding = sizeClasses[inputSize]
    if (LeftIcon) {
      padding = padding.replace('px-3', 'pl-10').replace('px-4', 'pl-12')
    }
    if (RightIcon || isPassword) {
      padding = padding.replace('px-3', 'pr-10').replace('px-4', 'pr-12')
    }
    return padding
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className={`${iconSizeClasses[inputSize]} text-gray-400 dark:text-gray-500`} />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            ${baseClasses}
            ${getStateClasses()}
            ${paddingWithIcons()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            ${className}
          `}
          disabled={disabled}
          {...props}
        />
        
        {(RightIcon || isPassword) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className={iconSizeClasses[inputSize]} />
                ) : (
                  <Eye className={iconSizeClasses[inputSize]} />
                )}
              </button>
            ) : RightIcon ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className={`text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none ${!onRightIconClick ? 'pointer-events-none' : ''}`}
              >
                <RightIcon className={iconSizeClasses[inputSize]} />
              </button>
            ) : null}
          </div>
        )}
        
        {/* Status Icons */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className={`${iconSizeClasses[inputSize]} text-red-500`} />
          </div>
        )}
        
        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className={`${iconSizeClasses[inputSize]} text-green-500`} />
          </div>
        )}
      </div>
      
      {/* Helper Text, Error, or Success Message */}
      {(error || success || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Componente TextArea
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  inputSize?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((
  {
    label,
    error,
    success,
    helperText,
    variant = 'default',
    inputSize = 'md',
    resize = 'vertical',
    className = '',
    disabled,
    ...props
  },
  ref
) => {
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  }
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
    }
    if (success) {
      return 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
    }
    return variantClasses[variant]
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          ${baseClasses}
          ${getStateClasses()}
          ${sizeClasses[inputSize]}
          ${resizeClasses[resize]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          ${className}
        `}
        disabled={disabled}
        {...props}
      />
      
      {/* Helper Text, Error, or Success Message */}
      {(error || success || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'

// Componente Select
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  options?: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'filled' | 'outlined'
  inputSize?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>((
  {
    label,
    error,
    success,
    helperText,
    options,
    placeholder,
    variant = 'default',
    inputSize = 'md',
    className = '',
    disabled,
    ...props
  },
  ref
) => {
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-no-repeat bg-right'
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-blue-500 focus:ring-blue-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 pr-8 text-sm',
    md: 'px-4 py-3 pr-10 text-sm',
    lg: 'px-4 py-4 pr-12 text-base'
  }

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
    }
    if (success) {
      return 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
    }
    return variantClasses[variant]
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`
            ${baseClasses}
            ${getStateClasses()}
            ${sizeClasses[inputSize]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            text-gray-900 dark:text-white
            ${className}
          `}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options ? options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          )) : props.children}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Helper Text, Error, or Success Message */}
      {(error || success || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export { Input, TextArea, Select }
export default Input