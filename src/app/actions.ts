'use server';

import { z } from 'zod';
import { strongTeamsList, weakTeamsList } from '@/lib/team-data';

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

// Max groups limited by strong teams (40 / 2 = 20) or weak teams (55 / 2 = 27)
const maxPossibleGroups = Math.min(Math.floor(strongTeamsList.length / 2), Math.floor(weakTeamsList.length / 2));

const GenerateTeamsSchema = z.object({
  numberOfGroups: z.coerce
    .number({ invalid_type_error: "Number of groups must be a number." })
    .int({ message: "Number of groups must be a whole number." })
    .min(1, "Must generate at least one group.")
    .max(maxPossibleGroups, `Cannot generate more than ${maxPossibleGroups} groups with available teams.`),
});

export interface ActionResult {
  success: boolean;
  data?: GeneratedSet;
  error?: string | null; 
  fieldErrors?: Partial<Record<'numberOfGroups', string[]>>; 
}


export async function generateTeamsAction(
  prevState: ActionResult | undefined, 
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = GenerateTeamsSchema.safeParse({
    numberOfGroups: formData.get('numberOfGroups'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input. Please check the errors below.",
      fieldErrors: validatedFields.error.flatten().fieldErrors as Partial<Record<'numberOfGroups', string[]>>,
    };
  }

  const { numberOfGroups } = validatedFields.data;

  const requiredStrong = numberOfGroups * 2;
  const requiredWeak = numberOfGroups * 2;

  if (requiredStrong > strongTeamsList.length) {
    return { success: false, error: `Not enough unique strong teams. Need ${requiredStrong}, have ${strongTeamsList.length}.` };
  }
  if (requiredWeak > weakTeamsList.length) {
    return { success: false, error: `Not enough unique weak teams. Need ${requiredWeak}, have ${weakTeamsList.length}.` };
  }

  try {
    let availableStrongTeams = shuffleArray(strongTeamsList);
    let availableWeakTeams = shuffleArray(weakTeamsList);

    const generatedSet: GeneratedSet = [];
    for (let i = 0; i < numberOfGroups; i++) {
      const groupStrongTeams: Team[] = [];
      const groupWeakTeams: Team[] = [];

      if (availableStrongTeams.length < 2 || availableWeakTeams.length < 2) {
        return { success: false, error: "Ran out of unique teams during generation. This should not happen with prior checks." };
      }

      for (let j = 0; j < 2; j++) {
        const teamName = availableStrongTeams.pop(); 
        if (teamName) {
          groupStrongTeams.push({ name: teamName, type: 'strong' });
        } else {
           return { success: false, error: "Internal error: Failed to pick a strong team." };
        }
      }

      for (let j = 0; j < 2; j++) {
        const teamName = availableWeakTeams.pop(); 
        if (teamName) {
          groupWeakTeams.push({ name: teamName, type: 'weak' });
        } else {
          return { success: false, error: "Internal error: Failed to pick a weak team." };
        }
      }

      generatedSet.push({
        id: `group-${i + 1}-${Math.random().toString(36).substring(2, 9)}`, 
        strongTeams: groupStrongTeams,
        weakTeams: groupWeakTeams,
      });
    }
    return { success: true, data: generatedSet, error: null };
  } catch (e) {
    console.error("Team generation error:", e);
    return { success: false, error: "An unexpected error occurred during team generation." };
  }
}
