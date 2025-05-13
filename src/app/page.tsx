'use client';

import { useFormState } from 'react-dom';
import { useEffect, useRef } from 'react';
import type { ActionResult } from '@/app/actions';
import { generateTeamsAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedTeamCard } from '@/components/generated-team-card';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const initialState: ActionResult = {
  success: false,
  error: null,
  data: undefined,
  fieldErrors: {},
};

export default function HomePage() {
  const [state, formAction] = useFormState(generateTeamsAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.data) {
      toast({
        title: "Success!",
        description: "Teams generated successfully.",
        variant: "default", // This will use primary color from theme
      });
    } else if (!state.success && state.error) {
      // Field errors are displayed inline, general errors are toasted
      if (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) {
         toast({
          title: "Error",
          description: state.error,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          Equipo<span style={{ color: 'hsl(var(--accent))' }}>Randomizer</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Generate random pairs of 2 strong and 2 weak teams without repetition.
        </p>
      </header>

      <Card className="w-full max-w-lg mb-12 shadow-2xl border-2 border-primary/20 bg-card rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-card-foreground">Team Generation Setup</CardTitle>
          <CardDescription className="text-muted-foreground">
            Specify how many groups of teams you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} ref={formRef} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numberOfGroups" className="text-base font-medium text-card-foreground">
                Number of Groups
              </Label>
              <Input
                id="numberOfGroups"
                name="numberOfGroups"
                type="number"
                placeholder="e.g., 3"
                defaultValue="1"
                min="1"
                required
                className="text-base bg-input text-foreground placeholder:text-muted-foreground focus:ring-accent"
                aria-describedby="numberOfGroupsError"
              />
              {state.fieldErrors?.numberOfGroups && (
                <p id="numberOfGroupsError" className="text-sm text-destructive mt-1">
                  {state.fieldErrors.numberOfGroups.join(', ')}
                </p>
              )}
            </div>
            <SubmitButton>
              Generate Teams
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      
      {state.error && (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) && (
         <Alert variant="destructive" className="mb-8 w-full max-w-2xl">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Generation Error</AlertTitle>
           <AlertDescription>{state.error}</AlertDescription>
         </Alert>
      )}

      {state.success && state.data && state.data.length > 0 && (
        <section className="w-full">
          <h2 className="text-3xl font-semibold mb-8 text-center text-primary">
            Generated Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {state.data.map((group, index) => (
              <GeneratedTeamCard
                key={group.id}
                group={group}
                groupNumber={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {!state.data && !state.error && (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) && (
         <Alert className="w-full max-w-2xl mt-8 border-primary/30">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary">Ready to Generate!</AlertTitle>
            <AlertDescription className="text-muted-foreground">
                Enter the number of groups you'd like to form and click the "Generate Teams" button. Each group will consist of 2 strong and 2 weak teams, selected randomly without repetition.
            </AlertDescription>
         </Alert>
      )}
    </main>
  );
}
