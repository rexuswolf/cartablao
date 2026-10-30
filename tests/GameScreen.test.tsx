import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

const gotIt = () => fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
const skip = () => fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
// Leaves the turn review shown after every turn
const continueFromReview = () =>
    fireEvent.click(screen.getByRole('button', { name: /^(Next: |See round|See final)/ }));

describe('GameScreen', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('shows cards again after moving to the next round', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        gotIt();
        gotIt();
        continueFromReview();
        expect(screen.getByText('Round 1 of 2 done')).toBeTruthy();

        fireEvent.click(screen.getByText('Start round 2'));

        expect(screen.queryByText('No more cards')).toBeNull();
        expect(shownWord()).not.toBeNull();
        expect(onGameEnd).not.toHaveBeenCalled();
    });

    it('ends the game after the last card of the last round', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        gotIt();
        gotIt();
        continueFromReview();
        fireEvent.click(screen.getByText('Start round 2'));
        gotIt();
        gotIt();
        expect(onGameEnd).not.toHaveBeenCalled();
        continueFromReview();

        expect(onGameEnd).toHaveBeenCalledTimes(1);
    });

    it('moves to the next player with a running timer after all cards are skipped', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);
        expect(screen.getByText("Alice's turn")).toBeTruthy();

        skip();
        skip();
        expect(screen.getByText('Alice got 0')).toBeTruthy();
        continueFromReview();

        expect(screen.getByText("Bob's turn")).toBeTruthy();
        expect(shownWord()).not.toBeNull();

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(screen.getByRole('timer', { name: '27 seconds left' })).toBeTruthy();
    });

    it('passes the turn exactly once and shows the real next card when time runs out', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);
        const firstWord = shownWord();

        act(() => {
            vi.advanceTimersByTime(30_000);
        });
        continueFromReview();

        // Next player (not skipped past), fresh timer, and the card left on screen went to the back
        expect(screen.getByText("Bob's turn")).toBeTruthy();
        expect(screen.getByRole('timer', { name: '30 seconds left' })).toBeTruthy();
        expect(shownWord()).not.toBe(firstWord);
    });

    it('lets a wrong call be fixed in the turn review', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);

        gotIt();
        fireEvent.click(screen.getByRole('button', { name: 'End turn early' }));
        expect(screen.getByText('Alice got 1')).toBeTruthy();

        // The guessed card was wrong: mark it skipped, so it goes back into the round
        fireEvent.click(screen.getByRole('button', { name: /: got it\. Tap to mark as skipped/ }));
        expect(screen.getByText('Alice got 0')).toBeTruthy();
        expect(screen.getByText('2 cards left in round 1 of 2')).toBeTruthy();

        // And the other way round
        fireEvent.click(screen.getAllByRole('button', { name: /: skipped\. Tap to mark as got it/ })[0]);
        expect(screen.getByText('Alice got 1')).toBeTruthy();
        expect(screen.getByText('1 card left in round 1 of 2')).toBeTruthy();
    });

    it('re-opens a finished round when its last correct card is marked skipped', () => {
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={vi.fn()} />);

        gotIt();
        gotIt();
        expect(screen.getByRole('button', { name: 'See round 1 results' })).toBeTruthy();

        fireEvent.click(screen.getAllByRole('button', { name: /: got it\. Tap to mark as skipped/ })[0]);
        continueFromReview();

        expect(screen.getByText("Bob's turn")).toBeTruthy();
    });

    it('ends the game early only after confirming, keeping the cards guessed so far', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        gotIt();
        fireEvent.click(screen.getByRole('button', { name: 'End turn early' }));
        fireEvent.click(screen.getByRole('button', { name: 'End game' }));
        fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }));
        expect(onGameEnd).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'End game' }));
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'End game' }));

        expect(onGameEnd).toHaveBeenCalledTimes(1);
        const rounds = onGameEnd.mock.calls[0][0];
        expect(rounds[0].getTurns()[0].correctCards).toHaveLength(1);
    });

    it('asks before ending the game when the back gesture is used mid-turn', () => {
        const onGameEnd = vi.fn();
        render(<GameScreen deck={deck} teams={teams} config={config} onGameEnd={onGameEnd} />);

        // Earlier tests' unmounts leave history pops pending that swallow the first events
        for (let i = 0; i < 20 && !screen.queryByRole('dialog'); i++) {
            act(() => {
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }

        expect(screen.getByRole('dialog', { name: 'End the game?' })).toBeTruthy();
        // The clock is paused while the question is open
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(screen.getByRole('timer', { name: '30 seconds left' })).toBeTruthy();
        expect(onGameEnd).not.toHaveBeenCalled();
    });

    it('lists reviewed cards in play order, even after fixing one', () => {
        const fourCards: GameCard[] = ['Alpha', 'Bravo', 'Charlie', 'Delta'].map((word, id) => ({ id, word, deckId: 'test' }));
        render(<GameScreen deck={fourCards} teams={teams} config={{ ...config, maxCards: 4 }} onGameEnd={vi.fn()} />);

        // Play four cards: skip, got it, skip, then end the turn on the fourth
        const played: string[] = [];
        const shown = () => fourCards.find(card => screen.queryByText(card.word))?.word ?? '';
        played.push(shown()); skip();
        played.push(shown()); gotIt();
        played.push(shown()); skip();
        played.push(shown());
        fireEvent.click(screen.getByRole('button', { name: 'End turn early' }));

        const reviewOrder = () =>
            screen.getAllByRole('button', { name: /\. Tap to mark as/ }).map(button => button.textContent?.replace(/(Got it|Skipped)$/, ''));
        expect(reviewOrder()).toEqual(played);

        fireEvent.click(screen.getAllByRole('button', { name: /: skipped\. Tap to mark as got it/ })[0]);
        expect(reviewOrder()).toEqual(played);
    });
});
