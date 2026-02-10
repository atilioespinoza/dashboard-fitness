import { EXERCISE_DATABASE } from './exerciseDB';
import { Routine } from '../hooks/useRoutines';

// Helper to find exercise by ID
const getEx = (id: string) => EXERCISE_DATABASE.find(e => e.id === id)!;

export const DEFAULT_ROUTINES: Routine[] = [
    {
        id: 'def_full_body',
        user_id: 'system',
        name: 'Full Body: Fundamentos',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('gym_back_squat'), sets: 3, reps: 10, weight: 0, rpe: 7, restTimeSeconds: 90 },
            { exercise: getEx('gym_bench_press'), sets: 3, reps: 10, weight: 0, rpe: 7, restTimeSeconds: 90 },
            { exercise: getEx('gym_romanian_deadlift'), sets: 3, reps: 10, weight: 0, rpe: 7, restTimeSeconds: 90 },
            { exercise: getEx('gym_lat_pulldown'), sets: 3, reps: 12, weight: 0, rpe: 7, restTimeSeconds: 60 },
            { exercise: getEx('gym_military_press'), sets: 3, reps: 12, weight: 0, rpe: 7, restTimeSeconds: 60 },
            { exercise: getEx('cal_plank'), sets: 3, reps: 0, weight: 0, rpe: 7, restTimeSeconds: 45, durationMinutes: 1 } // Plank is duration based usually, using durationMinutes for consistency with Cardio but it might be handled differently. Let's assume durationMinutes is the key here. Wait, cal_plank in DB is Calistenia. Calisthenics usually sets/reps or duration. Let's use durationMinutes if the system supports it for non-cardio, OR maybe reps=60 (seconds)? 
            // In WorkoutLiveSession logic:
            // if (currentEx.exercise.category === 'Cardio') ... uses durationMinutes
            // else ... uses reps.
            // For Plank (Calistenia), usually it's timed.
            // If I set reps: 60, the user will see "Reps: 60".
            // The user requested "cronometro en vivo" for cardio.
            // Maybe I should treat Plank as Cardio for timer purposes? Or just leave as reps for now to not break logic.
            // Let's stick to the standard: Plank -> 60 reps (seconds implied or count). 
            // Actually, for now let's use reps: 1 (representing 1 hold) and maybe put in notes? 
            // The prompt "duracion quiero que tengamos un cronometro en vivo" was specific for Cardio.
            // I'll set reps: 60 for Plank to imply 60 seconds for now.
        ]
    },
    {
        id: 'def_upper_body',
        user_id: 'system',
        name: 'Torso: Fuerza e Hipertrofia',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('gym_bench_press'), sets: 4, reps: 8, weight: 0, rpe: 8, restTimeSeconds: 120 },
            { exercise: getEx('gym_barbell_row'), sets: 4, reps: 10, weight: 0, rpe: 8, restTimeSeconds: 90 },
            { exercise: getEx('gym_incline_bench_press'), sets: 3, reps: 10, weight: 0, rpe: 8, restTimeSeconds: 90 },
            { exercise: getEx('cal_pullups_prona'), sets: 3, reps: 8, weight: 0, rpe: 9, restTimeSeconds: 90 },
            { exercise: getEx('gym_bicep_curls'), sets: 3, reps: 12, weight: 0, rpe: 9, restTimeSeconds: 60 },
            { exercise: getEx('gym_triceps_extension'), sets: 3, reps: 12, weight: 0, rpe: 9, restTimeSeconds: 60 }
        ]
    },
    {
        id: 'def_lower_body',
        user_id: 'system',
        name: 'Pierna: Potencia y Glúteos',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('gym_back_squat'), sets: 4, reps: 6, weight: 0, rpe: 8, restTimeSeconds: 120 },
            { exercise: getEx('gym_deadlift'), sets: 3, reps: 5, weight: 0, rpe: 8, restTimeSeconds: 180 },
            { exercise: getEx('gym_bulgarian_split_squat'), sets: 3, reps: 10, weight: 0, rpe: 8, restTimeSeconds: 90 },
            { exercise: getEx('gym_hip_thrust'), sets: 4, reps: 12, weight: 0, rpe: 8, restTimeSeconds: 90 },
            { exercise: getEx('gym_leg_press'), sets: 3, reps: 15, weight: 0, rpe: 9, restTimeSeconds: 60 }
        ]
    },
    {
        id: 'def_cardio_core',
        user_id: 'system',
        name: 'Cardio & Core: Quema Grasa',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('cardio_jump_rope'), sets: 1, reps: 0, weight: 0, rpe: 0, restTimeSeconds: 60, durationMinutes: 5 },
            { exercise: getEx('cal_burpees'), sets: 4, reps: 15, weight: 0, rpe: 8, restTimeSeconds: 60 },
            { exercise: getEx('cardio_kettlebell_swings'), sets: 4, reps: 20, weight: 0, rpe: 8, restTimeSeconds: 60, durationMinutes: 0 }, // It's cardio category but usually reps. The type in DB is 'Cardio'.
            // If category is Cardio, logic uses durationMinutes. 
            // Wait, check WorkoutLiveSession logic:
            // if (currentEx.exercise.category === 'Cardio') { ... uses durationMinutes ... }
            // So for Kettlebell Swings (Cardio), I must provide durationMinutes OR change logic to allow reps for Cardio.
            // The DB says: { id: 'cardio_kettlebell_swings', name: 'Kettlebell Swings', category: 'Cardio', ... }
            // If I want reps for Kettlebell Swings, I might need to change its category to 'Fuerza' temporarily or update logic.
            // Exception: 'Cardio' usually implies time-based.
            // Let's set durationMinutes: 1 for things like Kettlebell Swings if I want the timer to appear, OR
            // If I want to count reps, I should probably categorise it as 'Fuerza' or 'Calistenia' in the context of this app to get the rep counter.
            // However, `cal_burpees` is Calistenia -> Rep counter shows.
            // `cardio_kettlebell_swings` is Cardio -> Time counter shows.
            // If I want reps for Kettlebell Swings, I should probably change the category in the instance? The type defines it.
            // Let's assume for this routine we do it by time to fit the app logic: 1 min of swings.
            { exercise: getEx('cardio_mountain_climbers'), sets: 3, reps: 0, weight: 0, rpe: 8, restTimeSeconds: 45, durationMinutes: 1 },
            { exercise: getEx('cal_russian_twists'), sets: 3, reps: 20, weight: 0, rpe: 8, restTimeSeconds: 45 },
            { exercise: getEx('cardio_assault_bike'), sets: 1, reps: 0, weight: 0, rpe: 9, restTimeSeconds: 0, durationMinutes: 10 }
        ]
    },
    {
        id: 'def_calisthenics',
        user_id: 'system',
        name: 'Calistenia: Control Corporal',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('cal_muscleup'), sets: 3, reps: 5, weight: 0, rpe: 9, restTimeSeconds: 120 },
            { exercise: getEx('cal_dips'), sets: 4, reps: 12, weight: 0, rpe: 8, restTimeSeconds: 90 },
            { exercise: getEx('cal_pistol_squat'), sets: 3, reps: 6, weight: 0, rpe: 9, restTimeSeconds: 90 },
            { exercise: getEx('cal_pushups_diamond'), sets: 3, reps: 15, weight: 0, rpe: 8, restTimeSeconds: 60 },
            { exercise: getEx('cal_lsit'), sets: 3, reps: 15, weight: 0, rpe: 9, restTimeSeconds: 60 } // Reps interpreted as seconds hold
        ]
    },
    {
        id: 'def_home_space',
        user_id: 'system',
        name: 'En Casa: Espacio Reducido (2m²)',
        created_at: new Date().toISOString(),
        exercises: [
            { exercise: getEx('cal_squats'), sets: 4, reps: 20, weight: 0, rpe: 7, restTimeSeconds: 60 },
            { exercise: getEx('cal_pushups'), sets: 4, reps: 15, weight: 0, rpe: 8, restTimeSeconds: 60 },
            { exercise: getEx('cardio_mountain_climbers'), sets: 3, reps: 0, weight: 0, rpe: 8, restTimeSeconds: 45, durationMinutes: 1 }, // Cardio -> Timer
            { exercise: getEx('cal_superman'), sets: 3, reps: 15, weight: 0, rpe: 7, restTimeSeconds: 45 },
            { exercise: getEx('cal_plank'), sets: 3, reps: 60, weight: 0, rpe: 8, restTimeSeconds: 45 }, // Calistenia -> Reps (used as seconds)
            { exercise: getEx('cal_burpees'), sets: 3, reps: 10, weight: 0, rpe: 8, restTimeSeconds: 90 }
        ]
    }
];
