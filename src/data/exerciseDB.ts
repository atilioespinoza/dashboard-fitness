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
    { id: 'cal_pushups_diamond', name: 'Flexiones Diamante', category: 'Calistenia', metValue: 4.5, muscleGroup: ['Tríceps', 'Pecho'] },
    { id: 'cal_pushups_archer', name: 'Flexiones de Arquero', category: 'Calistenia', metValue: 5.5, muscleGroup: ['Pecho', 'Tríceps', 'Hombros'] },
    { id: 'cal_pullups_prona', name: 'Dominadas Pronas (Overhand)', category: 'Calistenia', metValue: 8.0, muscleGroup: ['Espalda', 'Bíceps'] },
    { id: 'cal_pullups_supina', name: 'Dominadas Supinas (Chin-ups)', category: 'Calistenia', metValue: 8.0, muscleGroup: ['Bíceps', 'Espalda'] },
    { id: 'cal_pullups_neutral', name: 'Dominadas Neutras', category: 'Calistenia', metValue: 7.5, muscleGroup: ['Espalda', 'Braquial'] },
    { id: 'cal_squats', name: 'Sentadillas (Air Squats)', category: 'Calistenia', metValue: 5.0, muscleGroup: ['Piernas'] },
    { id: 'cal_pistol_squat', name: 'Sentadilla Pistol (Una Pierna)', category: 'Calistenia', metValue: 7.0, muscleGroup: ['Piernas', 'Glúteos'] },
    { id: 'cal_dips', name: 'Fondos (Dips)', category: 'Calistenia', metValue: 6.0, muscleGroup: ['Tríceps', 'Pecho'] },
    { id: 'cal_burpees', name: 'Burpees', category: 'Calistenia', metValue: 9.0, muscleGroup: ['Full Body'] },
    { id: 'cal_plank', name: 'Plancha Abdominal', category: 'Calistenia', metValue: 3.5, muscleGroup: ['Core'] },
    { id: 'cal_hanging_leg_raises', name: 'Elevación Piernas Colgado', category: 'Calistenia', metValue: 4.0, muscleGroup: ['Abs', 'Core'] },
    { id: 'cal_muscleup', name: 'Muscle-up', category: 'Calistenia', metValue: 11.0, muscleGroup: ['Full Body', 'Espalda'] },
    { id: 'cal_handstand_pushups', name: 'Flexiones haciendo el Pino', category: 'Calistenia', metValue: 10.0, muscleGroup: ['Hombros', 'Tríceps'] },
    { id: 'cal_front_lever', name: 'Front Lever Hold', category: 'Calistenia', metValue: 12.0, muscleGroup: ['Core', 'Espalda'] },

    // --- CARDIO ---
    { id: 'cardio_jump_rope', name: 'Saltar la Cuerda (Ritmo Moderado)', category: 'Cardio', metValue: 10.0 },
    { id: 'cardio_jump_rope_intense', name: 'Saltar la Cuerda (Intenso)', category: 'Cardio', metValue: 12.3 },
    { id: 'cardio_run_jog', name: 'Trote Suave (8km/h)', category: 'Cardio', metValue: 8.3 },
    { id: 'cardio_run_fast', name: 'Correr Rápido (12km/h)', category: 'Cardio', metValue: 11.5 },
    { id: 'cardio_cycling_mod', name: 'Bicicleta (Moderado)', category: 'Cardio', metValue: 7.5 },
    { id: 'cardio_cycling_intense', name: 'Spinning / Ciclismo Intenso', category: 'Cardio', metValue: 10.5 },
    { id: 'cardio_walking', name: 'Caminar (Ritmo Rápido)', category: 'Cardio', metValue: 3.8 },
    { id: 'cardio_swimming', name: 'Natación (Crol)', category: 'Cardio', metValue: 8.5 },
    { id: 'cardio_rowing', name: 'Remo en Máquina', category: 'Cardio', metValue: 7.0 },
    { id: 'cardio_elliptical', name: 'Elíptica', category: 'Cardio', metValue: 5.5 },
    { id: 'cardio_stairmaster', name: 'Escaladora (StairMaster)', category: 'Cardio', metValue: 9.0 },
    { id: 'cardio_hiit', name: 'HIIT (Alta Intensidad)', category: 'Cardio', metValue: 12.0 },
    { id: 'cardio_mountain_climbers', name: 'Mountain Climbers', category: 'Cardio', metValue: 8.0 },

    // --- FUERZA (Pesas / Gimnasio) ---
    { id: 'gym_bench_press', name: 'Press de Banca (Bench Press)', category: 'Fuerza', metValue: 6.0, muscleGroup: ['Pecho', 'Tríceps'] },
    { id: 'gym_deadlift', name: 'Peso Muerto (Deadlift)', category: 'Fuerza', metValue: 8.0, muscleGroup: ['Espalda Baja', 'Piernas'] },
    { id: 'gym_back_squat', name: 'Sentadilla con Barra (Back Squat)', category: 'Fuerza', metValue: 8.0, muscleGroup: ['Cuádriceps', 'Glúteos'] },
    { id: 'gym_military_press', name: 'Press Militar (Hombros)', category: 'Fuerza', metValue: 5.0, muscleGroup: ['Hombros', 'Tríceps'] },
    { id: 'gym_barbell_row', name: 'Remo con Barra', category: 'Fuerza', metValue: 6.0, muscleGroup: ['Espalda', 'Bíceps'] },
    { id: 'gym_bicep_curls', name: 'Curl de Bíceps (Mancuernas/Barra)', category: 'Fuerza', metValue: 3.0, muscleGroup: ['Bíceps'] },
    { id: 'gym_triceps_extension', name: 'Extensiones de Tríceps', category: 'Fuerza', metValue: 3.0, muscleGroup: ['Tríceps'] },
    { id: 'gym_hip_thrust', name: 'Hip Thrust (Empuje de Cadera)', category: 'Fuerza', metValue: 6.0, muscleGroup: ['Glúteos'] },
    { id: 'gym_leg_press', name: 'Prensa de Piernas', category: 'Fuerza', metValue: 4.5, muscleGroup: ['Piernas'] },
    { id: 'gym_lat_pulldown', name: 'Jalones en Polea (Lat Pulldown)', category: 'Fuerza', metValue: 4.0, muscleGroup: ['Espalda'] },
    { id: 'gym_shoulder_flies', name: 'Elevaciones Laterales (Hombros)', category: 'Fuerza', metValue: 3.0, muscleGroup: ['Hombros'] },

    // --- DEPORTES / OTROS ---
    { id: 'sport_soccer', name: 'Fútbol (Competitivo)', category: 'Deportes', metValue: 10.0 },
    { id: 'sport_basketball', name: 'Basketball (Juego)', category: 'Deportes', metValue: 8.0 },
    { id: 'sport_tennis', name: 'Tenis (Individual)', category: 'Deportes', metValue: 7.3 },
    { id: 'sport_padel', name: 'Pádel', category: 'Deportes', metValue: 6.0 },
    { id: 'sport_boxing', name: 'Boxeo / Saco', category: 'Deportes', metValue: 9.0 },
    { id: 'yoga_hatha', name: 'Yoga (Hatha)', category: 'Flexibilidad', metValue: 2.5 },
    { id: 'yoga_power', name: 'Yoga (Power/Vinyasa)', category: 'Flexibilidad', metValue: 4.0 },
    { id: 'flex_stretching', name: 'Estiramiento Dinámico/Estático', category: 'Flexibilidad', metValue: 2.3 },
];
