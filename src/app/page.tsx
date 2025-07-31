
'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import type { ActionResult, GeneratedGroup } from '@/app/actions';
import { generateTeamsAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedTeamCard } from '@/components/generated-team-card';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info, Cog, SlidersHorizontal, History, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { newStrongTeamsList, newWeakTeamsList, legacyStrongTeamsList, legacyWeakTeamsList } from '@/lib/team-data';
import { EditableTeamList } from '@/components/editable-team-list';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeToggle } from '@/components/theme-toggle';

const initialState: ActionResult = {
  success: false,
  error: null,
  data: undefined,
  fieldErrors: {},
};

type TeamListVersion = 'new' | 'legacy';

export default function HomePage() {
  const [state, formAction] = useActionState(generateTeamsAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [generationMode, setGenerationMode] = useState<'balanced' | 'random'>('balanced');
  const [teamListVersion, setTeamListVersion] = useState<TeamListVersion>('new');
  
  const [currentStrongTeams, setCurrentStrongTeams] = useState<string[]>(newStrongTeamsList);
  const [currentWeakTeams, setCurrentWeakTeams] = useState<string[]>(newWeakTeamsList);
  const [allTeams, setAllTeams] = useState<string[]>([...new Set([...newStrongTeamsList, ...newWeakTeamsList])]);
  
  const [showTeamEditors, setShowTeamEditors] = useState(false);

  useEffect(() => {
    if (teamListVersion === 'new') {
      setCurrentStrongTeams(newStrongTeamsList);
      setCurrentWeakTeams(newWeakTeamsList);
      setAllTeams([...new Set([...newStrongTeamsList, ...newWeakTeamsList])]);
    } else {
      setCurrentStrongTeams(legacyStrongTeamsList);
      setCurrentWeakTeams(legacyWeakTeamsList);
      setAllTeams([...new Set([...legacyStrongTeamsList, ...legacyWeakTeamsList])]);
    }
  }, [teamListVersion]);


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

  const groupedData = useMemo(() => {
    const grouped: Record<string, GeneratedGroup[]> = {};
    if (!state.success || !state.data) return grouped;

    for (const group of state.data) {
        const match = group.name.match(/\(Set (\d+)\)$/);
        const setName = match ? `Set ${match[1]}` : "Set 1";

        if (!grouped[setName]) {
            grouped[setName] = [];
        }
        grouped[setName].push(group);
    }
    return grouped;
  }, [state.data, state.success]);

  const maxTotalGroups = Math.max(0, 
    generationMode === 'balanced' 
      ? Math.min(Math.floor(currentStrongTeams.length / 2), Math.floor(currentWeakTeams.length / 2))
      : Math.floor(allTeams.length / 4)
  );
  
  const canGenerate = generationMode === 'balanced'
    ? currentStrongTeams.length >= 2 && currentWeakTeams.length >= 2
    : allTeams.length >= 4;


  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background">
      <header className="mb-10 text-center w-full max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">
              Equipo<span style={{ color: 'hsl(var(--accent))' }}>Randomizer</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Generate balanced or fully random teams for your tournament.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTeamEditors(!showTeamEditors)}
              aria-label={showTeamEditors ? "Hide team editors" : "Show team editors"}
            >
              <Cog className="h-6 w-6 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl space-y-10">
        {showTeamEditors && (
           <Card className="w-full shadow-lg border-border/30 rounded-lg">
             <CardHeader>
               <CardTitle className="text-xl text-card-foreground">Team Editors</CardTitle>
               <CardDescription className="text-muted-foreground">Manage the team pools for generation. Current version: <span className="font-bold capitalize">{teamListVersion}</span></CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                {generationMode === 'balanced' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableTeamList
                      listId="strongTeams"
                      title="Strong Teams Editor"
                      teams={currentStrongTeams}
                      onTeamsChange={setCurrentStrongTeams}
                      inputLabel="New Strong Team"
                      addButtonLabel="Add Strong Team"
                      nounSingular="strong team"
                      nounPlural="strong teams"
                    />
                    <EditableTeamList
                      listId="weakTeams"
                      title="Weak Teams Editor"
                      teams={currentWeakTeams}
                      onTeamsChange={setCurrentWeakTeams}
                      inputLabel="New Weak Team"
                      addButtonLabel="Add Weak Team"
                      nounSingular="weak team"
                      nounPlural="weak teams"
                    />
                  </div>
                ) : (
                  <div>
                    <EditableTeamList
                      listId="allTeams"
                      title="All Teams Editor"
                      teams={allTeams}
                      onTeamsChange={setAllTeams}
                      inputLabel="New Team Name"
                      addButtonLabel="Add Team"
                      nounSingular="team"
                      nounPlural="teams"
                    />
                  </div>
                )}
             </CardContent>
           </Card>
        )}

        <Card className="w-full shadow-2xl border-2 border-primary/20 bg-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6" />
              Generation Setup
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose a mode, define your groups, and set the number of sets.
              {canGenerate ?
                ` Max ${maxTotalGroups} total ${maxTotalGroups === 1 ? "group" : "groups"} can be generated.`
                : " (Check team lists in the editor to enable generation)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} ref={formRef} className="space-y-6">
              {generationMode === 'balanced' ? (
                <>
                  <input type="hidden" name="strongTeamsJSON" value={JSON.stringify(currentStrongTeams)} />
                  <input type="hidden" name="weakTeamsJSON" value={JSON.stringify(currentWeakTeams)} />
                </>
              ) : (
                <input type="hidden" name="allTeamsJSON" value={JSON.stringify(allTeams)} />
              )}
               <input type="hidden" name="generationMode" value={generationMode} />

              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label className="text-base font-medium text-card-foreground">Team List Version</Label>
                   <RadioGroup
                      value={teamListVersion}
                      onValueChange={(value) => setTeamListVersion(value as TeamListVersion)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1"
                    >
                      <Label htmlFor="version-new" className="flex flex-col items-start gap-3 rounded-md border-2 p-4 hover:border-primary/80 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="new" id="version-new" />
                          <Sparkles className="h-5 w-5" />
                          <span className="font-bold">New</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">The latest and greatest team lists.</p>
                      </Label>
                       <Label htmlFor="version-legacy" className="flex flex-col items-start gap-3 rounded-md border-2 p-4 hover:border-primary/80 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="legacy" id="version-legacy" />
                          <History className="h-5 w-5" />
                          <span className="font-bold">Legacy</span>
                        </div>
                         <p className="text-sm text-muted-foreground ml-7">Classic team lists for a vintage experience.</p>
                      </Label>
                    </RadioGroup>
                </div>
                
                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-medium text-card-foreground">Generation Mode</Label>
                   <RadioGroup
                      value={generationMode}
                      onValueChange={(value) => setGenerationMode(value as 'balanced' | 'random')}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1"
                    >
                      <Label htmlFor="mode-balanced" className="flex flex-col items-start gap-3 rounded-md border-2 p-4 hover:border-primary/80 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="balanced" id="mode-balanced" />
                          <span className="font-bold">Balanced</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">Groups of 2 Strong & 2 Weak teams.</p>
                      </Label>
                       <Label htmlFor="mode-random" className="flex flex-col items-start gap-3 rounded-md border-2 p-4 hover:border-primary/80 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                         <div className="flex items-center gap-2">
                          <RadioGroupItem value="random" id="mode-random" />
                          <span className="font-bold">Fully Random</span>
                         </div>
                         <p className="text-sm text-muted-foreground ml-7">Groups of 4 teams from a single pool.</p>
                      </Label>
                    </RadioGroup>
                </div>
              </div>

              <Separator />

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
                      defaultValue='Alan "The Legend" Sanchez, Sebastian "Cepita" Nodari, Agustin "El Pato" Rodiguez'
                      required
                      className="text-base bg-input text-foreground placeholder:text-muted-foreground focus:ring-accent"
                      aria-describedby="groupNamesError"
                      disabled={!canGenerate}
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
                      disabled={!canGenerate}
                    />
                    {state.fieldErrors?.numberOfSets && (
                      <p id="numberOfSetsError" className="text-sm text-destructive mt-1">
                        {state.fieldErrors.numberOfSets.join(', ')}
                      </p>
                    )}
                  </div>
              </div>

              <SubmitButton disabled={!canGenerate}>
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
            <Accordion type="multiple" className="w-full space-y-4">
              {Object.entries(groupedData).map(([setName, groupsInSet]) => (
                <AccordionItem key={setName} value={setName} className="bg-card border border-border rounded-lg shadow-lg">
                  <AccordionTrigger className="w-full text-2xl font-bold text-center text-primary p-6 hover:no-underline">
                      {setName}
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupsInSet.map((group) => (
                        <Card key={group.id}>
                          <CardHeader>
                            <CardTitle className="text-xl text-center">
                              {group.name.replace(/ \(Set \d+\)$/, '')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <GeneratedTeamCard group={group} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {!state.data && !state.error && (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0) && (
           <Alert className="w-full max-w-2xl mt-8 border-primary/30">
              <Info className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">Ready to Generate!</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                  Click the <Cog className="inline h-4 w-4" /> icon to edit team lists if needed. Then, choose your mode, enter group names, and click "Generate Teams".
              </AlertDescription>
           </Alert>
        )}
      </div>
    </main>
  );
}
