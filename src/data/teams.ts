import type { Player, Team } from '../Game'

const TEAMS_STORAGE_KEY = 'charades-teams'

// A new game starts with two empty teams; players are added during setup
export const DEFAULT_TEAMS: Team[] = [
    { id: 'team-1', name: 'Red Team', color: '#ff5b3a', players: [] },
    { id: 'team-2', name: 'Blue Team', color: '#3355ff', players: [] },
]

// Teams and players from the last setup in this browser, or null if there are none
export function loadSavedTeams(): Team[] | null {
    try {
        const stored = localStorage.getItem(TEAMS_STORAGE_KEY)
        if (!stored) return null

        const data: unknown = JSON.parse(stored)
        if (!Array.isArray(data) || data.length === 0) return null

        const teams = data.filter((team): team is Team =>
            typeof team?.id === 'string' &&
            typeof team?.name === 'string' &&
            typeof team?.color === 'string' &&
            Array.isArray(team?.players)
        ).map(team => ({
            ...team,
            players: team.players
                .filter((player: Player) => typeof player?.id === 'string' && typeof player?.name === 'string')
                // Keep each player pointing at the team it is stored in
                .map((player: Player) => ({ ...player, teamId: team.id })),
        }))
        return teams.length > 0 ? teams : null
    } catch (error) {
        console.error('Error loading saved teams:', error)
        return null
    }
}

export function saveTeams(teams: Team[]): void {
    try {
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams))
    } catch (error) {
        // Storage can be full or blocked (e.g. private browsing); the game still works without it
        console.error('Error saving teams:', error)
    }
}
