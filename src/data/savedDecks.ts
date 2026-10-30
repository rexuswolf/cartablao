import type { DeckCard } from "../components/Card/DeckCard";
import { Language } from "./language";

const SAVED_DECKS_STORAGE_KEY = 'charades-saved-decks';

// A deck made with AI, typed in or imported. It stays in the language it was written in.
export interface SavedDeck {
    id: string;
    name: string;
    language: Language;
    cards: DeckCard[];
}

// What localStorage and export files hold. Older versions stored the Language object itself
// ({ _code, _display }) and cards as plain strings or { word } objects.
interface StoredDeck {
    id: string;
    name: string;
    language: string;
    cards: { id: string; text: string }[];
}

export type ImportError = 'invalid-format' | 'no-valid-decks' | 'parse-failed';

export interface ImportResult {
    success: boolean;
    importedCount: number;
    skippedCount: number;
    error?: ImportError;
}

// Date.now() alone collides when several decks are created in the same millisecond (e.g. on import)
function createDeckId(): string {
    return `deck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function readLanguage(value: unknown): Language {
    let code: unknown = value;
    if (isRecord(value)) code = value.code ?? value._code;
    return (typeof code === 'string' && Language.fromCode(code)) || Language.universal();
}

function readCardText(card: unknown): string {
    if (typeof card === 'string') return card.trim();
    if (!isRecord(card)) return '';
    if (typeof card.text === 'string') return card.text.trim();
    if (typeof card.word === 'string') return card.word.trim();
    return '';
}

// Turns any stored or imported deck format into a SavedDeck, or null if it isn't a deck.
// Imported decks get fresh ids so they never clash with existing ones.
function readDeck(value: unknown, { imported = false } = {}): SavedDeck | null {
    if (!isRecord(value) || !Array.isArray(value.cards)) return null;
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    // Imports need a name; a stored deck is kept even if it somehow lost its name
    if (imported && !name) return null;

    const id = !imported && typeof value.id === 'string' && value.id ? value.id : createDeckId();
    const cards: DeckCard[] = [];
    value.cards.forEach((card: unknown, index: number) => {
        const text = readCardText(card);
        if (!text) return;
        const storedId = !imported && isRecord(card) && typeof card.id === 'string' && card.id ? card.id : null;
        cards.push({ id: storedId ?? `${id}-${index}`, text });
    });
    return { id, name: name || 'Deck', language: readLanguage(value.language), cards };
}

function toStoredDeck(deck: SavedDeck): StoredDeck {
    return {
        id: deck.id,
        name: deck.name,
        language: deck.language.code,
        // Saved decks are written in one language, so their cards are plain text
        cards: deck.cards.map(card => ({ id: card.id, text: typeof card.text === 'string' ? card.text : card.text.en })),
    };
}

function writeSavedDecks(decks: SavedDeck[]): void {
    localStorage.setItem(SAVED_DECKS_STORAGE_KEY, JSON.stringify(decks.map(toStoredDeck)));
}

function readStoredDecks(): unknown[] {
    const stored = localStorage.getItem(SAVED_DECKS_STORAGE_KEY);
    if (!stored) return [];
    const decks: unknown = JSON.parse(stored);
    return Array.isArray(decks) ? decks : [];
}

export function saveDeck({ words, name, language = Language.universal() }: { words: string[]; name: string; language?: Language; }): SavedDeck {
    const savedDecks = getSavedDecks();

    const deckId = createDeckId();
    const newDeck: SavedDeck = {
        id: deckId,
        name: name,
        language,
        cards: words.map((text, index) => ({ id: `${deckId}-${index}`, text })),
    };

    savedDecks.push(newDeck);
    writeSavedDecks(savedDecks);

    return newDeck;
}

export function getSavedDecks(): SavedDeck[] {
    try {
        return readStoredDecks()
            .map(deck => readDeck(deck))
            .filter((deck): deck is SavedDeck => deck !== null);
    } catch (error) {
        console.error('Error loading saved decks:', error);
        return [];
    }
}

export function getDeckCards(deckId: string): DeckCard[] | null {
    const savedDecks = getSavedDecks();
    const deck = savedDecks.find(d => d.id === deckId);

    if (!deck) return null;

    return deck.cards;
}

export function deleteDeck(deckId: string): boolean {
    const savedDecks = getSavedDecks();
    const filteredDecks = savedDecks.filter(d => d.id !== deckId);

    if (filteredDecks.length === savedDecks.length) {
        return false; // Deck not found
    }

    writeSavedDecks(filteredDecks);
    return true;
}

export function renameDeck(deckId: string, newName: string): boolean {
    const savedDecks = getSavedDecks();
    const deck = savedDecks.find(d => d.id === deckId);

    if (!deck) return false;

    deck.name = newName;
    writeSavedDecks(savedDecks);
    return true;
}

export function getDeckStats(): { total: number; totalCards: number } {
    const savedDecks = getSavedDecks();
    const total = savedDecks.length;
    const totalCards = savedDecks.reduce((sum, deck) => sum + deck.cards.length, 0);

    return { total, totalCards };
}

// Export functionality
export function exportDecks(): string {
    const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        decks: getSavedDecks().map(toStoredDeck)
    };
    return JSON.stringify(exportData, null, 2);
}

// Import functionality; accepts files exported by any version of the app
export function importDecks(importData: string): ImportResult {
    try {
        const data = JSON.parse(importData);

        // Validate the import data structure
        if (!data.decks || !Array.isArray(data.decks)) {
            return { success: false, importedCount: 0, skippedCount: 0, error: 'invalid-format' };
        }

        const existingDecks = getSavedDecks();
        const importedDecks: SavedDeck[] = [];
        let skippedCount = 0;

        for (const importedValue of data.decks) {
            const importedDeck = readDeck(importedValue, { imported: true });
            if (!importedDeck || importedDeck.cards.length === 0) {
                skippedCount++;
                continue;
            }

            // Add suffix to duplicate names
            const nameTaken = (name: string) =>
                existingDecks.some(existing => existing.name === name) ||
                importedDecks.some(imported => imported.name === name);
            let newName = importedDeck.name;
            let counter = 1;
            while (nameTaken(newName)) {
                newName = `${importedDeck.name} (${counter})`;
                counter++;
            }

            importedDecks.push({ ...importedDeck, name: newName });
        }

        if (importedDecks.length === 0) {
            return { success: false, importedCount: 0, skippedCount, error: 'no-valid-decks' };
        }

        writeSavedDecks([...existingDecks, ...importedDecks]);

        return { success: true, importedCount: importedDecks.length, skippedCount };

    } catch (error) {
        console.error('Error importing decks:', error);
        return { success: false, importedCount: 0, skippedCount: 0, error: 'parse-failed' };
    }
}

// Clear all decks (for testing/reset purposes)
export function clearAllDecks(): void {
    localStorage.removeItem(SAVED_DECKS_STORAGE_KEY);
}

// Rewrites decks saved by older versions in the current format: cards get ids, the language
// becomes a plain code, and languages the app no longer offers become "universal". No deck is dropped.
export function migrateSavedDecks(): void {
    try {
        const stored = localStorage.getItem(SAVED_DECKS_STORAGE_KEY);
        if (!stored) return;

        const migrated = JSON.stringify(getSavedDecks().map(toStoredDeck));
        if (migrated !== stored) {
            localStorage.setItem(SAVED_DECKS_STORAGE_KEY, migrated);
        }
    } catch (error) {
        console.error('Error migrating saved decks:', error);
    }
}
