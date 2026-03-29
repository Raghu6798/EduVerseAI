import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200";
  
  const variantStyles = {
    primary: "border-transparent text-white bg-purple-600 hover:bg-purple-700",
    secondary: "border-transparent text-white bg-blue-600 hover:bg-blue-700",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const styles = `${baseStyles} ${variantStyles[variant]} ${props.disabled ? disabledStyles : ''} ${className}`;

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
};

export default Button;