import type { Player, Team } from '../Game'
import { TRANSLATIONS } from '../shared/i18n/translations'
import { GAME_LANGUAGES, type GameLanguage } from './language'

// Keeps the app's old name so data saved by earlier versions is still found
const TEAMS_STORAGE_KEY = 'charades-teams'

// The name a new team gets: its color ("Red Team"), or its number when the color has no name
export function defaultTeamName(color: string, number: number, language: GameLanguage): string {
    const { colorTeam, numberedTeam } = TRANSLATIONS[language].teams
    return colorTeam[color] ?? numberedTeam(number)
}

// Teams still using a name the app gave them get that name in the given language; names typed by players stay
export function localizeTeamNames(teams: Team[], language: GameLanguage): Team[] {
    return teams.map((team, index) => {
        const isDefaultName = GAME_LANGUAGES.some(other => {
            const { colorTeam, numberedTeam } = TRANSLATIONS[other].teams
            return team.name === colorTeam[team.color] || team.name === numberedTeam(index + 1)
        })
        const name = isDefaultName ? defaultTeamName(team.color, index + 1, language) : team.name
        return name === team.name ? team : { ...team, name }
    })
}

// A new game starts with two empty teams; players are added during setup
export function getDefaultTeams(language: GameLanguage): Team[] {
    return [
        { id: 'team-1', name: defaultTeamName('#ff5b3a', 1, language), color: '#ff5b3a', players: [] },
        { id: 'team-2', name: defaultTeamName('#3355ff', 2, language), color: '#3355ff', players: [] },
    ]
}

export const DEFAULT_TEAMS: Team[] = getDefaultTeams('en')

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
