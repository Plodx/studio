
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { ActionResult } from '@/app/actions';
import { generateTeamsAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedTeamCard } from '@/components/generated-team-card';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info, Cog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { strongTeamsList as defaultStrongTeamsList, weakTeamsList as defaultWeakTeamsList } from '@/lib/team-data';
import { EditableTeamList } from '@/components/editable-team-list';
import { Button } from '@/components/ui/button';

const initialState: ActionResult = {
  success: false,
  error: null,
  data: undefined,
  fieldErrors: {},
};

export default function HomePage() {
  const [state, formAction] = useActionState(generateTeamsAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [currentStrongTeams, setCurrentStrongTeams] = useState<string[]>(defaultStrongTeamsList);
  const [currentWeakTeams, setCurrentWeakTeams] = useState<string[]>(defaultWeakTeamsList);
  const [showTeamEditors, setShowTeamEditors] = useState(false);

  useEffect(() => {
    if (state.success && state.data) {
      toast({
        title: "Success!",
        description: "Teams generated successfully.",
        variant: "default",
      });
    } else if (!state.success && state.error) {
      if (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) {
         toast({
          title: "Error",
          description: state.error,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const maxTotalGroups = Math.max(0, Math.min(
    Math.floor(currentStrongTeams.length / 2),
    Math.floor(currentWeakTeams.length / 2)
  ));

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background">
      <header className="mb-10 text-center w-full max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">
              Equipo<span style={{ color: 'hsl(var(--accent))' }}>Randomizer</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Generate random pairs of 2 strong and 2 weak teams without repetition.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTeamEditors(!showTeamEditors)}
            aria-label={showTeamEditors ? "Hide team editors" : "Show team editors"}
            className="ml-4"
          >
            <Cog className="h-6 w-6 text-primary" />
          </Button>
        </div>
      </header>

      <div className="w-full max-w-4xl space-y-10">
        {showTeamEditors && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <EditableTeamList
              listId="strongTeams"
              title="Strong Teams Editor"
              description="Add or remove teams from the strong pool."
              teams={currentStrongTeams}
              onTeamsChange={setCurrentStrongTeams}
              inputLabel="New Strong Team Name"
              addButtonLabel="Add Strong Team"
              nounSingular="strong team"
              nounPlural="strong teams"
            />
            <EditableTeamList
              listId="weakTeams"
              title="Weak Teams Editor"
              description="Add or remove teams from the weak pool."
              teams={currentWeakTeams}
              onTeamsChange={setCurrentWeakTeams}
              inputLabel="New Weak Team Name"
              addButtonLabel="Add Weak Team"
              nounSingular="weak team"
              nounPlural="weak teams"
            />
          </div>
        )}

        <Card className="w-full shadow-2xl border-2 border-primary/20 bg-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground">Team Generation Setup</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter group names, separated by commas, and the number of sets to generate.
              {(currentStrongTeams.length >=2 && currentWeakTeams.length >=2) ?
                ` Max ${maxTotalGroups} total ${maxTotalGroups === 1 ? "group" : "groups"} can be generated with current lists.`
                : " (Add at least 2 strong and 2 weak teams to enable generation)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} ref={formRef} className="space-y-6">
              <input type="hidden" name="strongTeamsJSON" value={JSON.stringify(currentStrongTeams)} />
              <input type="hidden" name="weakTeamsJSON" value={JSON.stringify(currentWeakTeams)} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="groupNames" className="text-base font-medium text-card-foreground">
                      Group Names
                    </Label>
                    <Input
                      id="groupNames"
                      name="groupNames"
                      type="text"
                      placeholder="e.g., Group A, Group B"
                      defaultValue="A, B, C, D"
                      required
                      className="text-base bg-input text-foreground placeholder:text-muted-foreground focus:ring-accent"
                      aria-describedby="groupNamesError"
                      disabled={currentStrongTeams.length < 2 || currentWeakTeams.length < 2}
                    />
                    {state.fieldErrors?.groupNames && (
                      <p id="groupNamesError" className="text-sm text-destructive mt-1">
                        {state.fieldErrors.groupNames.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfSets" className="text-base font-medium text-card-foreground">
                      Number of Sets
                    </Label>
                    <Input
                      id="numberOfSets"
                      name="numberOfSets"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                      className="text-base bg-input text-foreground placeholder:text-muted-foreground focus:ring-accent"
                      aria-describedby="numberOfSetsError"
                      disabled={currentStrongTeams.length < 2 || currentWeakTeams.length < 2}
                    />
                    {state.fieldErrors?.numberOfSets && (
                      <p id="numberOfSetsError" className="text-sm text-destructive mt-1">
                        {state.fieldErrors.numberOfSets.join(', ')}
                      </p>
                    )}
                  </div>
              </div>

              <SubmitButton disabled={currentStrongTeams.length < 2 || currentWeakTeams.length < 2}>
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
              {state.data.map((group) => (
                <GeneratedTeamCard
                  key={group.id}
                  group={group}
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
                  Click the <Cog className="inline h-4 w-4" /> icon to edit team lists if needed. Then, enter the group names and click "Generate Teams".
              </AlertDescription>
           </Alert>
        )}
      </div>
    </main>
  );
}
