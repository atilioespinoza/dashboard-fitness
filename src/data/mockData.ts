export interface FitnessEntry {
    Date: string;
    Weight: number;
    Waist: number;
    BodyFat: number;
    Calories: number;
    Protein: number; // Derived from Macros if needed, or explicit
    Carbs: number;
    Fat: number;
    Steps: number;
    TDEE: number;
    Sleep: number;
    Notes: string;
    Training?: string;
}

// Helper to generate last 30 days of data
const generateMockData = (): FitnessEntry[] => {
    const data: FitnessEntry[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Base values with some daily noise
        const weightBase = 84 - (30 - i) * 0.1; // Slow loss
        const weight = Number((weightBase + (Math.random() * 0.6 - 0.3)).toFixed(1));

        const fatBase = 18 - (30 - i) * 0.05;
        const bodyFat = Number((fatBase + (Math.random() * 0.4 - 0.2)).toFixed(1));

        const tdee = 2800;
        const calories = Math.floor(2200 + Math.random() * 600 - 200); // Avg 2400ish

        const steps = Math.floor(8000 + Math.random() * 6000);
        const sleep = Number((7 + Math.random() * 2).toFixed(1));

        data.push({
            Date: date.toISOString().split('T')[0],
            Weight: weight,
            Waist: Number((84 - (30 - i) * 0.05).toFixed(1)),
            BodyFat: bodyFat,
            Calories: calories,
            Protein: Math.floor(160 + Math.random() * 40),
            Carbs: Math.floor(200 + Math.random() * 100),
            Fat: Math.floor(60 + Math.random() * 20),
            Steps: steps,
            TDEE: tdee,
            Sleep: sleep,
            Notes: Math.random() > 0.7 ? "Great workout today!" : "",
            Training: Math.random() > 0.5 ? "Strength Training" : (Math.random() > 0.5 ? "Cardio" : undefined),
        });
    }
    return data;
};

export const MOCK_DATA = generateMockData();
