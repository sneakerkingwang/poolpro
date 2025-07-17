// FILE: src/utils/usapl.ts

const raceChart: { [key: number]: [number, number] } = {
    0: [28, 28], 25: [28, 25], 50: [31, 28], 75: [35, 28], 100: [38, 25],
    125: [42, 25], 150: [46, 25], 175: [50, 25], 200: [50, 19], 250: [57, 19],
    300: [65, 19], 350: [65, 14], 400: [65, 10]
};

export const getRaceToPoints = (rating1: number, rating2: number): [number, number] | null => {
    const diff = Math.abs(rating1 - rating2);
    const closestDiffKey = Object.keys(raceChart).reduce((prev, curr) => 
        (Math.abs(parseInt(curr) - diff) < Math.abs(parseInt(prev) - diff) ? curr : prev)
    );
    const race = raceChart[parseInt(closestDiffKey)];
    if (!race) return null;
    return rating1 > rating2 ? [race[0], race[1]] : [race[1], race[0]];
};