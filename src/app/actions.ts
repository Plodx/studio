
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
  strongTeams: Team[];
  weakTeams: Team[];
}

export type GeneratedSet = GeneratedGroup[];

const BaseTeamSubmissionSchema = z.object({
  numberOfGroupsString: z.string().optional(), // Keep as string for now, coerce later
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
  fieldErrors?: Partial<Record<'numberOfGroups' | 'strongTeamsJSON' | 'weakTeamsJSON', string[]>>;
}


export async function generateTeamsAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {

  const rawInput = {
    numberOfGroupsString: formData.get('numberOfGroups'),
    strongTeamsJSON: formData.get('strongTeamsJSON'),
    weakTeamsJSON: formData.get('weakTeamsJSON'),
  };

  const parsedBase = BaseTeamSubmissionSchema.safeParse(rawInput);

  if (!parsedBase.success) {
    return {
      success: false,
      error: "Invalid input format for team lists or number of groups.",
      fieldErrors: parsedBase.error.flatten().fieldErrors as ActionResult['fieldErrors'],
    };
  }

  let strongTeams: string[];
  let weakTeams: string[];

  try {
    strongTeams = JSON.parse(parsedBase.data.strongTeamsJSON);
    weakTeams = JSON.parse(parsedBase.data.weakTeamsJSON);
  } catch (e) {
    // This case should ideally be caught by Zod's refine, but as a fallback:
    return {
        success: false,
        error: "Failed to parse team lists. Ensure they are correctly formatted.",
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

  const maxPossibleGroups = Math.min(Math.floor(strongTeams.length / 2), Math.floor(weakTeams.length / 2));

  const GenerateTeamsSchema = z.object({
    numberOfGroups: z.coerce
      .number({ invalid_type_error: "Number of groups must be a number." })
      .int({ message: "Number of groups must be a whole number." })
      .min(1, "Must generate at least one group.")
      .max(maxPossibleGroups, `Cannot generate more than ${maxPossibleGroups} ${maxPossibleGroups === 1 ? "group" : "groups"} with the provided ${strongTeams.length} strong and ${weakTeams.length} weak teams. (Need 2 of each type per group).`),
  });

  const validatedFields = GenerateTeamsSchema.safeParse({
      numberOfGroups: parsedBase.data.numberOfGroupsString
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input for number of groups.",
      fieldErrors: {
        ...((parsedBase.success ? {} : parsedBase.error.flatten().fieldErrors) as ActionResult['fieldErrors']),
        ...(validatedFields.error.flatten().fieldErrors as Partial<Record<'numberOfGroups', string[]>>)
      }
    };
  }

  const { numberOfGroups } = validatedFields.data;

  const requiredStrong = numberOfGroups * 2;
  const requiredWeak = numberOfGroups * 2;

  // These checks are now against the dynamically provided and parsed lists
  // (though maxPossibleGroups check in Zod should cover this)
  if (requiredStrong > strongTeams.length) {
    return { success: false, error: `Not enough unique strong teams for ${numberOfGroups} groups. Need ${requiredStrong}, have ${strongTeams.length}.` };
  }
  if (requiredWeak > weakTeams.length) {
    return { success: false, error: `Not enough unique weak teams for ${numberOfGroups} groups. Need ${requiredWeak}, have ${weakTeams.length}.` };
  }

  try {
    let availableStrongTeams = shuffleArray([...strongTeams]); // Use copies for shuffling
    let availableWeakTeams = shuffleArray([...weakTeams]);

    const generatedSet: GeneratedSet = [];
    for (let i = 0; i < numberOfGroups; i++) {
      const groupStrongTeams: Team[] = [];
      const groupWeakTeams: Team[] = [];

      if (availableStrongTeams.length < 2 || availableWeakTeams.length < 2) {
        // This should ideally be caught by earlier logic (e.g. maxPossibleGroups validation)
        return { success: false, error: "Ran out of unique teams during generation. Check if enough teams were provided for the requested number of groups." };
      }

      for (let j = 0; j < 2; j++) {
        const teamName = availableStrongTeams.pop();
        if (teamName) {
          groupStrongTeams.push({ name: teamName, type: 'strong' });
        } else {
           return { success: false, error: "Internal error: Failed to pick a strong team when expected." };
        }
      }

      for (let j = 0; j < 2; j++) {
        const teamName = availableWeakTeams.pop();
        if (teamName) {
          groupWeakTeams.push({ name: teamName, type: 'weak' });
        } else {
          return { success: false, error: "Internal error: Failed to pick a weak team when expected." };
        }
      }

      generatedSet.push({
        id: `group-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
        strongTeams: groupStrongTeams,
        weakTeams: groupWeakTeams,
      });
    }
    return { success: true, data: generatedSet, error: null };
  } catch (e) {
    console.error("Team generation error:", e);
    // Check if e is an error instance before accessing message
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error: `An unexpected error occurred during team generation: ${errorMessage}` };
  }
}
