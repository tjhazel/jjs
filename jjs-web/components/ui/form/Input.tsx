"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface InputProps {
   name: string;
   label: React.ReactNode;
   type?: string;
   placeholder?: string;
   className?: string;
   variant?: 'input' | 'textarea';
   rows?: number;
   disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
   name,
   label,
   type = 'text',
   placeholder,
   className = '',
   variant = 'input',
   rows = 3,
   disabled = false,
}) => {
   // Pulling errors from context. Yup populates error.message automatically.
   const { register, formState: { errors } } = useFormContext();
   const error = errors[name];

   return (
      <div className={`form-control w-full ${className}`}>
         <label className="label py-1" htmlFor={name}>
            <span className="label-text font-medium text-base-content w-full">{label}</span>
         </label>

         {variant === 'textarea' ? (
            <textarea
               id={name}
               rows={rows}
               placeholder={placeholder}
               disabled={disabled}
               {...register(name)}
               className={`textarea textarea-bordered w-full resize-y text-sm leading-relaxed ${error ? 'textarea-error' : ''
                  } ${disabled ? 'bg-base-200 cursor-not-allowed text-base-content/50' : ''}`}
            />
         ) : (
            <input
               id={name}
               type={type}
               placeholder={placeholder}
               disabled={disabled}
               {...register(name)}
               className={`input input-bordered w-full text-sm ${error ? 'input-error' : ''
                  } ${disabled ? 'bg-base-200 cursor-not-allowed text-base-content/50' : ''}`}
            />
         )}

         <label className="label min-h-[1.5rem] py-0.5">
            {error && (
               <span className="label-text-alt text-error font-medium">
                  {typeof error.message === 'string' ? error.message : 'Invalid input'}
               </span>
            )}
         </label>
      </div>
   );
};
