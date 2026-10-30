// Card colors for decks; text color comes from getReadableTextColor
const DECK_COLORS = [
    '#ff5b3a', '#3355ff', '#2fb872', '#7a3cf0', '#ff7ab6',
    '#ffd23f', '#ff9f1c', '#00a6a6', '#5cc8ff', '#c2e812',
];

// The same deck always gets the same color
export function getDeckColor(deckId: string): string {
    let hash = 0;
    for (const char of deckId) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return DECK_COLORS[hash % DECK_COLORS.length];
}

// Splits a leading emoji (e.g. "🌟 Famous People") off a deck name to use as the card's symbol
export function splitDeckName(name: string): { symbol: string | null; title: string } {
    // Flags are pairs of regional indicator letters, not pictographs
    const match = name.match(/^(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}]*)\s*/u);
    if (!match) return { symbol: null, title: name };
    return { symbol: match[1], title: name.slice(match[0].length) || name };
}
