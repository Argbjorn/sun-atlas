// Mirrors --color-accent-secondary / --color-accent-primary in index.css.
const roleColors = {
    primary: "#ffb454",
    secondary: "#eaf6ff",
} as const;

export function colorForRole(role: keyof typeof roleColors): string {
    return roleColors[role];
}
