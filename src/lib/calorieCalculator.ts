import { Exercise } from '../data/exerciseDB';

interface WorkoutSet {
    exercise: Exercise;
    durationMinutes: number; // For METs calculation
    sets?: number;
    reps?: number;
    weight?: number; // Only for logging, METs doesn't always use it directly
    rpe?: number; // Rate of Perceived Exertion (1-10) for intensity adjustment
}

interface UserStats {
    weightKp: number; // Current weight in kg
    heightCm: number;
    age: number;
    gender: 'Masculino' | 'Femenino' | 'Otro';
}

/**
 * Calculates Estimated Calories Burned for a single set/exercise
 * Using the MET formula: (METs * 3.5 * weightKg) / 200 * durationMinutes
 *
 * @param exercise The exercise being performed
 * @param durationMinutes Duration of the exercise excluding rest
 * @param userWeightKg User's current weight
 * @param intensityAdjust Optional multiplier based on RPE (1 = normal)
 */
export const calculateExerciseCalories = (
    exercise: Exercise,
    durationMinutes: number,
    userWeightKg: number,
    intensityAdjust: number = 1.0
): number => {
    // Basic MET formula
    let caloriesBurned = (exercise.metValue * 3.5 * userWeightKg) / 200 * durationMinutes;

    // Apply intensity adjustment if provided
    caloriesBurned *= intensityAdjust;

    return Math.round(caloriesBurned);
};

/**
 * Calculates Total Calories for a full workout session
 */
export const calculateWorkoutCalories = (
    sets: WorkoutSet[],
    userStats: UserStats
): number => {
    let totalCalories = 0;

    sets.forEach(set => {
        // Adjust intensity based on RPE if available
        // RPE 1-10: 5 is normal, 8 is high (+20%), 10 is max (+40%)
        let intensityModifier = 1.0;
        if (set.rpe) {
            if (set.rpe >= 8) intensityModifier = 1.2;
            else if (set.rpe >= 6) intensityModifier = 1.1;
            else if (set.rpe <= 4) intensityModifier = 0.9;
        }

        totalCalories += calculateExerciseCalories(
            set.exercise,
            set.durationMinutes,
            userStats.weightKp,
            intensityModifier
        );
    });

    return Math.round(totalCalories);
};

/**
 * Helper: Estimate duration from sets/reps if duration is not provided
 * E.g., 1 rep = 3 seconds (approx) + rest time
 * NOTE: For calorie burning, we usually count "active" time, not rest time.
 */
export const estimateActiveDuration = (reps: number, sets: number, secondsPerRep: number = 3): number => {
    const totalSeconds = reps * sets * secondsPerRep;
    return totalSeconds / 60; // minutes
};
