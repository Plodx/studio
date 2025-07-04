
'use server';

import { z } from 'zod';

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export interface Team {
  name: string;
  type: 'strong' | 'weak';
}

export interface GeneratedGroup {
  id: string;
  name: string;
  strongTeams: Team[];
  weakTeams: Team[];
}

export type GeneratedSet = GeneratedGroup[];

const TeamSubmissionSchema = z.object({
  groupNames: z.string().min(1, { message: 'Group names cannot be empty.' }),
  numberOfSets: z.string().transform(Number).pipe(z.number().int().min(1, { message: 'Number of sets must be at least 1.' })),
  strongTeamsJSON: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.every(item => typeof item === 'string');
      } catch {
        return false;
      }
    },
    { message: 'Strong teams list must be a valid JSON array of strings.' }
  ),
  weakTeamsJSON: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.every(item => typeof item === 'string');
      } catch {
        return false;
      }
    },
    { message: 'Weak teams list must be a valid JSON array of strings.' }
  ),
});

export interface ActionResult {
  success: boolean;
  data?: GeneratedSet;
  error?: string | null;
  fieldErrors?: Partial<Record<'groupNames' | 'strongTeamsJSON' | 'weakTeamsJSON' | 'numberOfSets', string[]>>;
}


export async function generateTeamsAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {

  const rawInput = {
    groupNames: formData.get('groupNames'),
    numberOfSets: formData.get('numberOfSets'),
    strongTeamsJSON: formData.get('strongTeamsJSON'),
    weakTeamsJSON: formData.get('weakTeamsJSON'),
  };

  const parsed = TeamSubmissionSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input format.",
      fieldErrors: parsed.error.flatten().fieldErrors as ActionResult['fieldErrors'],
    };
  }

  let { groupNames: groupNamesStr, numberOfSets, strongTeamsJSON, weakTeamsJSON } = parsed.data;

  let strongTeams: string[];
  let weakTeams: string[];

  try {
    strongTeams = JSON.parse(strongTeamsJSON);
    weakTeams = JSON.parse(weakTeamsJSON);
  } catch (e) {
    return {
        success: false,
        error: "Failed to parse team lists. Ensure they are correctly formatted.",
    };
  }
  
  const groupNames = groupNamesStr
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (groupNames.length === 0) {
    return {
      success: false,
      error: "Invalid group names provided.",
      fieldErrors: {
        groupNames: ['Please provide at least one valid group name.']
      }
    };
  }

  if (strongTeams.length < 2 || weakTeams.length < 2) {
    return {
      success: false,
      error: `Not enough teams to form any groups.`,
      fieldErrors: {
        strongTeamsJSON: strongTeams.length < 2 ? [`Need at least 2 strong teams (have ${strongTeams.length}).`] : undefined,
        weakTeamsJSON: weakTeams.length < 2 ? [`Need at least 2 weak teams (have ${weakTeams.length}).`] : undefined,
      }
    };
  }

  const numberOfGroupsPerSet = groupNames.length;
  const totalGroupsToGenerate = numberOfGroupsPerSet * numberOfSets;
  const maxPossibleTotalGroups = Math.min(Math.floor(strongTeams.length / 2), Math.floor(weakTeams.length / 2));

  if (totalGroupsToGenerate > maxPossibleTotalGroups) {
    return {
      success: false,
      error: `You are trying to generate ${totalGroupsToGenerate} groups, but you only have enough teams for ${maxPossibleTotalGroups}.`,
      fieldErrors: {
        groupNames: [`Reduce the number of groups or sets.`],
        numberOfSets: [`Reduce the number of groups or sets.`]
      }
    };
  }


  try {
    let availableStrongTeams = shuffleArray([...strongTeams]);
    let availableWeakTeams = shuffleArray([...weakTeams]);

    const generatedSet: GeneratedSet = [];
    for (let i = 0; i < totalGroupsToGenerate; i++) {
      const groupStrongTeams: Team[] = [];
      const groupWeakTeams: Team[] = [];

      for (let j = 0; j < 2; j++) {
        const teamName = availableStrongTeams.pop();
        if (!teamName) {
            throw new Error("Internal error: Strong team pool depleted unexpectedly. Check validation logic.");
        }
        groupStrongTeams.push({ name: teamName, type: 'strong' });
      }

      for (let j = 0; j < 2; j++) {
        const teamName = availableWeakTeams.pop();
        if (!teamName) {
            throw new Error("Internal error: Weak team pool depleted unexpectedly. Check validation logic.");
        }
        groupWeakTeams.push({ name: teamName, type: 'weak' });
      }

      const setNumber = Math.floor(i / numberOfGroupsPerSet) + 1;
      const baseGroupName = groupNames[i % numberOfGroupsPerSet];
      const finalGroupName = numberOfSets > 1 ? `${baseGroupName} (Set ${setNumber})` : baseGroupName;


      generatedSet.push({
        id: `group-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: finalGroupName,
        strongTeams: groupStrongTeams,
        weakTeams: groupWeakTeams,
      });
    }
    return { success: true, data: generatedSet, error: null };
  } catch (e) {
    console.error("Team generation error:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: `An unexpected error occurred during team generation: ${errorMessage}` };
  }
}
