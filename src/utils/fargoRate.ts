// This is a simplified lookup table based on common race charts.
// A more complex implementation could use a formula.
const raceChart: { [key: number]: [number, number] } = {
    25: [3, 2],
    50: [4, 2],
    75: [5, 2],
    100: [5, 3],
    125: [6, 3],
    150: [7, 3],
    175: [6, 4],
    200: [7, 4],
    225: [8, 4],
    250: [7, 5],
    300: [8, 5],
    350: [9, 5]
};

export const getRaceToGames = (rating1: number, rating2: number): [number, number] | null => {
    const diff = Math.abs(rating1 - rating2);

    if (diff < 25) {
        return [5, 5]; // Default for close ratings
    }

    // Find the closest difference in the chart
    const closestDiff = Object.keys(raceChart).reduce((prev, curr) => {
        return (Math.abs(parseInt(curr) - diff) < Math.abs(parseInt(prev) - diff) ? curr : prev);
    });

    const race = raceChart[parseInt(closestDiff)];
    
    if (!race) return null;

    // Corrected Logic: The higher rated player gets the higher race number.
    if (rating1 > rating2) {
        return [race[0], race[1]];
    } else {
        return [race[1], race[0]];
    }
};