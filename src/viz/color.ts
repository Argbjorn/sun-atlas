export function randomColor(): string {
    return `hsl(${getRandomInt(0, 361)}, ${getRandomInt(80, 101)}%, ${getRandomInt(20, 81)}%)`
}

function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}