const chartColors = [
    "hsl(215, 70%, 45%)", // синий
    "hsl(355, 65%, 50%)", // красный-коралл
    "hsl(160, 60%, 35%)", // изумрудный
    "hsl(35,  85%, 48%)", // янтарный
    "hsl(270, 55%, 50%)", // фиолетовый
    "hsl(190, 70%, 38%)", // бирюзовый глубокий
    "hsl(320, 60%, 48%)", // маджента
    "hsl(95,  50%, 38%)", // оливково-зелёный
];

let queue: string[] = [];

export function randomColor(): string {
    if (queue.length === 0) {
        queue = shuffle(chartColors);
    }
    return queue.pop()!
}

function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
