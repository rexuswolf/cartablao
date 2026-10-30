import { beforeEach, describe, expect, it } from 'vitest';
import { exportDecks, getSavedDecks, importDecks, migrateSavedDecks, saveDeck } from '../src/data/savedDecks';

const STORAGE_KEY = 'charades-saved-decks';

describe('saved decks', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('migrates decks saved by older versions without losing any', () => {
        // Older versions stored the Language object itself and cards as strings or { word } objects
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            { id: 'deck-1', name: 'Familia', language: { _code: 'es', _display: '🇪🇸 Spanish' }, cards: ['Abuela', 'Tío Pepe'] },
            { id: 'deck-2', name: 'Old', cards: [{ word: 'Rocket' }, { word: 'Moon' }] },
            { id: 'deck-3', name: 'French', language: { _code: 'fr', _display: '🇫🇷 French' }, cards: ['Baguette'] },
        ]));

        migrateSavedDecks();

        const decks = getSavedDecks();
        expect(decks.map(deck => deck.name)).toEqual(['Familia', 'Old', 'French']);
        expect(decks.map(deck => deck.language.code)).toEqual(['es', 'universal', 'universal']);
        expect(decks[0].cards).toEqual([
            { id: 'deck-1-0', text: 'Abuela' },
            { id: 'deck-1-1', text: 'Tío Pepe' },
        ]);
        expect(decks[1].cards.map(card => card.text)).toEqual(['Rocket', 'Moon']);

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        expect(stored[0]).toEqual({
            id: 'deck-1',
            name: 'Familia',
            language: 'es',
            cards: [{ id: 'deck-1-0', text: 'Abuela' }, { id: 'deck-1-1', text: 'Tío Pepe' }],
        });
    });

    it('leaves already migrated decks alone', () => {
        saveDeck({ words: ['One'], name: 'Mine' });
        const before = localStorage.getItem(STORAGE_KEY);

        migrateSavedDecks();

        expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    });

    it('imports files from older versions and from this one', () => {
        const oldFile = JSON.stringify({ version: '1.0', decks: [{ name: 'Old', language: { _code: 'en' }, cards: ['A', 'B'] }] });
        saveDeck({ words: ['C'], name: 'New' });
        const newFile = exportDecks();
        localStorage.clear();

        expect(importDecks(oldFile)).toEqual({ success: true, importedCount: 1, skippedCount: 0 });
        expect(importDecks(newFile)).toEqual({ success: true, importedCount: 1, skippedCount: 0 });

        const decks = getSavedDecks();
        expect(decks.map(deck => [deck.name, deck.language.code, deck.cards.map(card => card.text)])).toEqual([
            ['Old', 'en', ['A', 'B']],
            ['New', 'universal', ['C']],
        ]);
        // Every card gets an id of its own
        const ids = decks.flatMap(deck => deck.cards.map(card => card.id));
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('reports why an import failed', () => {
        expect(importDecks('not json').error).toBe('parse-failed');
        expect(importDecks('{}').error).toBe('invalid-format');
        expect(importDecks('{"decks":[{"cards":[]}]}')).toEqual({
            success: false, importedCount: 0, skippedCount: 1, error: 'no-valid-decks',
        });
    });
});
