import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameCard } from '../src/components/Card/GameCard';
import { GameScreen } from '../src/components/GameScreen/GameScreen';
import type { GameConfig, Team } from '../src/Game';

const deck: GameCard[] = [
    { id: 0, word: 'Alpha', deckId: 'test' },
    { id: 1, word: 'Bravo', deckId: 'test' },
];

const teams: Team[] = [
    {
        id: 'team-a',
        name: 'Team A',
        color: '#ff0000',
        players: [{ id: 'p1', name: 'Alice', teamId: 'team-a' }],
    },
    {
        id: 'team-b',
        name: 'Team B',
        color: '#0000ff',
        players: [{ id: 'p2', name: 'Bob', teamId: 'team-b' }],
    },
];

const config: GameConfig = {
    secondsPerRound: 30,
    maxCards: 2,
    enablePreparationPhase: false,
    preparationTimeLimit: 0,
    autoStartNextPlayer: true,
    numberOfRounds: 2,
};

const shownWord = () =>
    deck.find(card => screen.queryByText(card.word))?.word ?? null;

describe('GameScreen', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('shows cards again after moving to the next round', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        fireEvent.click(screen.getByText('CORRECT →'));
        fireEvent.click(screen.getByText('CORRECT →'));
        expect(screen.getByText(/Round 1 Complete/)).toBeTruthy();

        fireEvent.click(screen.getByText('Next Round'));

        expect(screen.queryByText('No more cards!')).toBeNull();
        expect(shownWord()).not.toBeNull();
        expect(onGameEnd).not.toHaveBeenCalled();
    });

    it('ends the game after the last card of the last round', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        fireEvent.click(screen.getByText('CORRECT →'));
        fireEvent.click(screen.getByText('CORRECT →'));
        fireEvent.click(screen.getByText('Next Round'));
        fireEvent.click(screen.getByText('CORRECT →'));
        fireEvent.click(screen.getByText('CORRECT →'));

        expect(onGameEnd).toHaveBeenCalledTimes(1);
    });

    it('moves to the next player with a running timer after all cards are skipped', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);
        expect(screen.getByText('Alice')).toBeTruthy();

        fireEvent.click(screen.getByText('← SKIP'));
        fireEvent.click(screen.getByText('← SKIP'));

        expect(screen.getByText('Bob')).toBeTruthy();
        expect(shownWord()).not.toBeNull();

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(screen.getByText('0:27')).toBeTruthy();
    });

    it('passes the turn exactly once and shows the real next card when time runs out', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);
        const firstWord = shownWord();

        act(() => {
            vi.advanceTimersByTime(30_000);
        });

        // Next player (not skipped past), fresh timer, and the card left on screen went to the back
        expect(screen.getByText('Bob')).toBeTruthy();
        expect(screen.getByText('0:30')).toBeTruthy();
        expect(shownWord()).not.toBe(firstWord);
    });
});
