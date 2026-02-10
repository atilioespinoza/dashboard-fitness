export type ExerciseCategory = 'Cardio' | 'Fuerza' | 'Calistenia' | 'Flexibilidad' | 'Deportes';

export interface Exercise {
    id: string;
    name: string;
    category: ExerciseCategory;
    metValue: number; // Metabolic Equivalent of Task
    muscleGroup?: string[];
    description?: string;
}

// MET Values source (approximate): Compendium of Physical Activities
export const EXERCISE_DATABASE: Exercise[] = [
    // --- CALISTENIA (Peso Corporal) ---
    { id: 'cal_pushups', name: 'Flexiones (Push-ups)', category: 'Calistenia', metValue: 3.8, muscleGroup: ['Pecho', 'Tríceps'] },
    { id: 'cal_pullups', name: 'Dominadas (Pull-ups)', category: 'Calistenia', metValue: 8.0, muscleGroup: ['Espalda', 'Bíceps'] },
    { id: 'cal_squats', name: 'Sentadillas (Air Squats)', category: 'Calistenia', metValue: 5.0, muscleGroup: ['Piernas'] },
    { id: 'cal_dips', name: 'Fondos (Dips)', category: 'Calistenia', metValue: 6.0, muscleGroup: ['Tríceps', 'Pecho'] },
    { id: 'cal_burpees', name: 'Burpees', category: 'Calistenia', metValue: 8.0, muscleGroup: ['Full Body'] },
    { id: 'cal_plank', name: 'Plancha Abdominal', category: 'Calistenia', metValue: 3.5, muscleGroup: ['Core'] },
    { id: 'cal_muscleup', name: 'Muscle-up', category: 'Calistenia', metValue: 10.0, muscleGroup: ['Full Body', 'Espalda'] },

    // --- CARDIO ---
    { id: 'cardio_run_jog', name: 'Trote Suave (8km/h)', category: 'Cardio', metValue: 8.3 },
    { id: 'cardio_run_fast', name: 'Correr Rápido (12km/h)', category: 'Cardio', metValue: 11.5 },
    { id: 'cardio_cycling_mod', name: 'Bicicleta (Moderado)', category: 'Cardio', metValue: 7.5 },
    { id: 'cardio_jump_rope', name: 'Saltar la Cuerda', category: 'Cardio', metValue: 10.0 },
    { id: 'cardio_walking', name: 'Caminar (Ritmo Rápido)', category: 'Cardio', metValue: 3.8 },

    // --- GYM (Pesas) ---
    { id: 'gym_weightlifting_gen', name: 'Levantamiento de Pesas (General)', category: 'Fuerza', metValue: 3.5 },
    { id: 'gym_weightlifting_vigorous', name: 'Levantamiento de Pesas (Vigoroso)', category: 'Fuerza', metValue: 6.0 },
    { id: 'gym_compound', name: 'Ejercicios Compuestos (Deadlift/Squat)', category: 'Fuerza', metValue: 6.0 },
    { id: 'gym_isolation', name: 'Ejercicios de Aislamiento (Biceps Curl)', category: 'Fuerza', metValue: 3.0 },

    // --- DEPORTES / OTROS ---
    { id: 'sport_soccer', name: 'Fútbol (Competitivo)', category: 'Deportes', metValue: 10.0 },
    { id: 'sport_basketball', name: 'Basketball (Juego)', category: 'Deportes', metValue: 8.0 },
    { id: 'yoga_hatha', name: 'Yoga (Hatha)', category: 'Flexibilidad', metValue: 2.5 },
    { id: 'yoga_power', name: 'Yoga (Power)', category: 'Flexibilidad', metValue: 4.0 },
];
