"use client";

import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

interface DatePickerProps {
   name: string;
   label: React.ReactNode;
   /** Set to true to include the time track, false for date-only format */
   includeTime?: boolean;
   rules?: RegisterOptions;
   className?: string;
   min?: string;
   max?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
   name,
   label,
   includeTime = true,
   rules,
   className = '',
   min,
   max,
}) => {
   const context = useFormContext();

   // Guard against isolated runtime instantiation errors
   if (!context) {
      throw new Error("DatePicker must be used inside a FormProvider wrapper component.");
   }

   const { register, formState: { errors } } = context;
   const error = errors[name];

   return (
      <div className={`form-control w-full ${className}`}>
         {/* Structural layout matching Input */}
         <label className="label" htmlFor={name}>
            <span className="label-text font-medium">{label}</span>
         </label>

         <input
            id={name}
            type={includeTime ? "datetime-local" : "date"}
            min={min}
            max={max}
            {...register(name, rules)}
            className={`input input-bordered w-full text-left font-sans select-none [color-scheme:light] dark:[color-scheme:dark] ${error ? 'input-error' : ''
               }`}
         />

         {/* Validation Message Layout Anchor */}
         <label className="label min-h-[1.5rem]">
            {error && (
               <span className="label-text-alt text-error">
                  {typeof error.message === 'string' ? error.message : 'Invalid date format'}
               </span>
            )}
         </label>
      </div>
   );
};
