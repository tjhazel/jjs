"use client";

import React from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';

interface CheckboxOption {
   value: string | number;
   label: string;
}

interface CheckboxListProps {
   name: string;
   label: React.ReactNode;
   options: CheckboxOption[];
   rules?: RegisterOptions;
   className?: string;
   /** Sets grid arrangement layout (e.g., 'grid-cols-2', 'grid-cols-3', or 'flex flex-wrap') */
   layoutClassName?: string;
}

export const CheckboxList: React.FC<CheckboxListProps> = ({
   name,
   label,
   options,
   rules,
   className = '',
   layoutClassName = 'flex flex-wrap gap-3',
}) => {
   const context = useFormContext();

   // Guard against isolated runtime instantiation errors
   if (!context) {
      throw new Error("CheckboxList must be used inside a FormProvider wrapper component.");
   }

   const { control, formState: { errors } } = context;
   const error = errors[name];

   return (
      <div className={`form-control w-full ${className}`}>
         {/* Group Header Label */}
         <label className="label">
            <span className="label-text font-semibold text-base-content">{label}</span>
         </label>

         {/* Controlled Checkbox List Engine */}
         <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => {
               // Fallback safely to an array if value is missing or null
               const currentValues: (string | number)[] = Array.isArray(field.value) ? field.value : [];

               return (
                  <div className={layoutClassName}>
                     {options.map((option) => {
                        const isChecked = currentValues.includes(option.value);

                        return (
                           <label
                              key={option.value}
                              className="label cursor-pointer justify-start gap-3 border border-base-200 hover:border-base-300 rounded-lg p-3 bg-base-100/50 shadow-sm transition-all hover:bg-base-200/40 select-none min-w-[120px]"
                           >
                              <input
                                 type="checkbox"
                                 className={`checkbox checkbox-sm checkbox-primary ${error ? 'checkbox-error' : ''}`}
                                 checked={isChecked}
                                 onChange={() => {
                                    const nextValues = isChecked
                                       ? currentValues.filter((v) => v !== option.value)
                                       : [...currentValues, option.value];

                                    field.onChange(nextValues);
                                 }}
                              />
                              <span className="text-sm font-medium text-base-content">{option.label}</span>
                           </label>
                        );
                     })}
                  </div>
               );
            }}
         />

         {/* Error Message Layout Anchor */}
         <label className="label min-h-[1.5rem]">
            {error && (
               <span className="label-text-alt text-error font-medium">
                  {typeof error.message === 'string' ? error.message : 'Selection is invalid'}
               </span>
            )}
         </label>
      </div>
   );
};
