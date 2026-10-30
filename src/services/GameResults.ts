import type { Player, Team } from "../Game";
import type { Round } from "../Round";

export interface TeamResult {
    team: Team
    totalCorrect: number
    totalSkipped: number
}

export interface PlayerResult {
    player: Player
    team: Team
    correct: number
    skipped: number
}

export interface GameResults {
    teamResults: TeamResult[] // Sorted by correct cards, best first
    playerResults: PlayerResult[] // One entry per player, sorted by correct cards
    leaderScore: number
    totalCorrect: number
}

export function getGameResults(rounds: Round[], teams: Team[]): GameResults {
    const allTurns = rounds.flatMap(round => round.getTurns());

    const teamResults = teams
        .map(team => {
            const teamTurns = allTurns.filter(turn => turn.teamId === team.id);
            return {
                team,
                totalCorrect: teamTurns.reduce((sum, turn) => sum + turn.correctCards.length, 0),
                totalSkipped: teamTurns.reduce((sum, turn) => sum + turn.skippedCards.length, 0),
            };
        })
        .sort((a, b) => b.totalCorrect - a.totalCorrect);

    // Aggregate per player (a player can have several turns) using the game's own teams
    const playerResults = teams
        .flatMap(team => team.players.map(player => {
            const playerTurns = allTurns.filter(turn => turn.playerId === player.id);
            return {
                player,
                team,
                correct: playerTurns.reduce((sum, turn) => sum + turn.correctCards.length, 0),
                skipped: playerTurns.reduce((sum, turn) => sum + turn.skippedCards.length, 0),
            };
        }))
        .sort((a, b) => b.correct - a.correct);

    return {
        teamResults,
        playerResults,
        leaderScore: teamResults[0]?.totalCorrect ?? 0,
        totalCorrect: teamResults.reduce((sum, result) => sum + result.totalCorrect, 0),
    };
}
