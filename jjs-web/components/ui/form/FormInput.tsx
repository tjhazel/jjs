"use client";

import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

interface FormInputProps {
   name: string;
   label: React.ReactNode; // Supports both pure strings and complex JSX layouts
   type?: string;
   placeholder?: string;
   rules?: RegisterOptions;
   className?: string;
   variant?: 'input' | 'textarea'; // Control rendering strategy
   rows?: number; // Used strictly when variant matches 'textarea'
   disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
   name,
   label,
   type = 'text',
   placeholder,
   rules,
   className = '',
   variant = 'input',
   rows = 3,
   disabled = false,
}) => {
   const { register, formState: { errors } } = useFormContext();
   const error = errors[name];

   return (
      <div className={`form-control w-full ${className}`}>
         {/* Structural Label Container */}
         <label className="label py-1" htmlFor={name}>
            <span className="label-text font-medium text-base-content w-full">{label}</span>
         </label>

         {/* Component Type Swapper Engine */}
         {variant === 'textarea' ? (
            <textarea
               id={name}
               rows={rows}
               placeholder={placeholder}
               disabled={disabled}
               {...register(name, rules)}
               className={`textarea textarea-bordered w-full resize-y text-sm leading-relaxed ${error ? 'textarea-error' : ''
                  } ${disabled ? 'bg-base-200 cursor-not-allowed text-base-content/50' : ''}`}
            />
         ) : (
            <input
               id={name}
               type={type}
               placeholder={placeholder}
               disabled={disabled}
               {...register(name, rules)}
               className={`input input-bordered w-full text-sm ${error ? 'input-error' : ''
                  } ${disabled ? 'bg-base-200 cursor-not-allowed text-base-content/50' : ''}`}
            />
         )}

         {/* RHF Form State Validation Alert Deck */}
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
