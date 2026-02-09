export interface SuggestedTargets {
    weight: number;
    waist: number;
    bodyFat: number;
    steps: number;
}

export function calculateSuggestedTargets(heightCm: number, gender: 'Masculino' | 'Femenino' | 'Otro'): SuggestedTargets {
    const heightM = heightCm / 100;

    // 1. Target Weight: Based on a healthy BMI of 23.5 (aesthetic/athletic standard)
    // Formula: Weight = BMI * height^2
    const suggestedWeight = Number((23.5 * Math.pow(heightM, 2)).toFixed(1));

    // 2. Target Waist: Based on WHO standards and aesthetic ratios
    // Men: < 94cm for health, ~83cm for athletic look (depending on height)
    // Women: < 80cm for health, ~68cm-72cm for athletic look
    let suggestedWaist = 83;
    if (gender === 'Femenino') {
        suggestedWaist = 70;
    } else if (gender === 'Otro') {
        suggestedWaist = 78;
    }

    // 3. Target Body Fat: Athletic standards
    // Men: 12-14% (Visible abs)
    // Women: 20-22% (Tone/Definition)
    let suggestedBodyFat = 13;
    if (gender === 'Femenino') {
        suggestedBodyFat = 21;
    } else if (gender === 'Otro') {
        suggestedBodyFat = 17;
    }

    // 4. Target Steps: High activity level for metabolism
    const suggestedSteps = 10000;

    return {
        weight: suggestedWeight,
        waist: suggestedWaist,
        bodyFat: suggestedBodyFat,
        steps: suggestedSteps
    };
}
