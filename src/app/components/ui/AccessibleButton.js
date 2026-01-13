"use client";

/**
 * Accessible Button Component
 * Provides keyboard navigation, ARIA labels, and focus management
 */
export function AccessibleButton({
  children,
  onClick,
  className = '',
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  variant = 'default',
  ...props
}) {
  const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Accessible Link Component
 * Provides keyboard navigation and ARIA labels for links
 */
export function AccessibleLink({
  children,
  href,
  className = '',
  ariaLabel,
  ariaCurrent,
  ...props
}) {
  return (
    <a
      href={href}
      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${className}`}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Accessible Input Component
 * Provides proper labels and ARIA attributes
 */
export function AccessibleInput({
  label,
  id,
  error,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-md
          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
