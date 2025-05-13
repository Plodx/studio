'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
  pendingText?: string;
}

export function SubmitButton({ children, pendingText = "Generating...", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      {...props}
      style={{ 
        backgroundColor: pending ? undefined : 'hsl(var(--accent))', 
        color: pending ? undefined :'hsl(var(--accent-foreground))' 
      }}
      className={`w-full text-lg py-3 ${props.className || ''} ${pending ? '' : 'hover:bg-accent/90'}`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
