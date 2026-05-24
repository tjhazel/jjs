"use client";

import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

interface DropdownOption {
   value: string | number;
   label: string;
}

interface DropdownListProps {
   name: string;
   label: React.ReactNode;
   options: DropdownOption[];
   placeholder?: string;
   rules?: RegisterOptions;
   className?: string;
}

export const DropdownList: React.FC<DropdownListProps> = ({
   name,
   label,
   options,
   placeholder = "Select an option",
   rules,
   className = '',
}) => {
   const context = useFormContext();

   // Guard against isolated runtime instantiation errors
   if (!context) {
      throw new Error("DropdownList must be used inside a FormProvider wrapper component.");
   }

   const { register, formState: { errors } } = context;
   const error = errors[name];

   return (
      <div className={`form-control w-full ${className}`}>
         {/* Structural layout matching Input */}
         <label className="label" htmlFor={name}>
            <span className="label-text font-medium">{label}</span>
         </label>

         <select
            id={name}
            defaultValue=""
            {...register(name, rules)}
            className={`select select-bordered w-full font-medium ${error ? 'select-error' : ''
               }`}
         >
            {/* Placeholder choice option */}
            <option value="" disabled>
               {placeholder}
            </option>

            {/* Rendered options mapping loop */}
            {options.map((option) => (
               <option key={option.value} value={option.value}>
                  {option.label}
               </option>
            ))}
         </select>

         {/* Validation Message Layout Anchor */}
         <label className="label min-h-[1.5rem]">
            {error && (
               <span className="label-text-alt text-error font-medium">
                  {typeof error.message === 'string' ? error.message : 'Please make a selection'}
               </span>
            )}
         </label>
      </div>
   );
};
