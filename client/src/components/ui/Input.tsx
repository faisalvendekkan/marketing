import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps { label?: string; error?: string; }

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, className, id, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input id={id} ref={ref} className={cn('input', error && 'border-red-500 focus:ring-red-500/30', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, className, id, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <textarea id={id} ref={ref} className={cn('input min-h-[96px] resize-y', error && 'border-red-500', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, error, className, id, children, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <select id={id} ref={ref} className={cn('input', className)} {...rest}>{children}</select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
