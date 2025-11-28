import { useState, useCallback } from 'react';

/**
 * Hook for managing form state with multiple fields
 * Provides a cleaner API for managing multiple form fields together
 * 
 * @param initialValues - Initial values for all form fields
 * @returns Object with values, setValue, handleChange, reset, and setValues functions
 * 
 * @example
 * ```tsx
 * const { values, setValue, handleChange, reset } = useForm({
 *   email: '',
 *   password: '',
 *   displayName: '',
 * });
 * 
 * return (
 *   <form>
 *     <input 
 *       name="email"
 *       value={values.email} 
 *       onChange={handleChange}
 *     />
 *     <input 
 *       name="password"
 *       value={values.password} 
 *       onChange={handleChange}
 *     />
 *   </form>
 * );
 * ```
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as keyof T, value);
  }, [setValue]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);
  
  return { 
    values, 
    setValue, 
    handleChange, 
    reset,
    setValues, // Allow direct control if needed
  };
}

