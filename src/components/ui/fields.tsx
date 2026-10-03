'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

const fieldClass =
  'w-full bg-transparent border border-charcoal/20 px-4 py-3 text-[15px] text-charcoal placeholder:text-stone/70 transition-colors duration-300 focus:border-terracotta focus:outline-none disabled:opacity-50';

export interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

function FieldWrap({ label, error, hint, children, id }: FieldProps & { children: React.ReactNode; id?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="micro-label block">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-stone">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, hint, id, className = '', ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} id={id}>
    <input ref={ref} id={id} aria-invalid={!!error} className={`${fieldClass} ${error ? 'border-terracotta' : ''} ${className}`} {...rest} />
  </FieldWrap>
));
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, error, hint, id, className = '', ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} id={id}>
    <textarea
      ref={ref}
      id={id}
      aria-invalid={!!error}
      rows={5}
      className={`${fieldClass} resize-y ${error ? 'border-terracotta' : ''} ${className}`}
      {...rest}
    />
  </FieldWrap>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldProps & { options: { value: string; label: string }[] }
>(({ label, error, hint, id, options, className = '', ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} id={id}>
    <select
      ref={ref}
      id={id}
      aria-invalid={!!error}
      className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%231C1A17%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 ${error ? 'border-terracotta' : ''} ${className}`}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </FieldWrap>
));
Select.displayName = 'Select';
