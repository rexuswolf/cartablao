import { ACCENTS_IMPRESSIONS_DECK } from "./Decks/AccentsImpressionsDeck";
import { ACT_IT_OUT_DECK } from "./Decks/ActItOutDeck";
import { ANIMALS_DECK } from "./Decks/AnimalsDeck";
import { ANIME_DECK } from "./Decks/AnimeDeck";
import { BLOCKBUSTER_MOVIES_DECK } from "./Decks/BlockbusterMoviesDeck";
import { CINE_DE_TERROR_DECK } from "./Decks/CineDeTerrorDeck";
import { CINE_Y_SERIES_DE_ESPANA_DECK } from "./Decks/CineYSeriesDeEspanaDeck";
import { COMIDA_Y_BEBIDA_DECK } from "./Decks/ComidaYBebidaDeck";
import { DISNEY_Y_PIXAR_DECK } from "./Decks/DisneyYPixarDeck";
import { EXITOS_PARA_CANTAR_DECK } from "./Decks/ExitosParaCantarDeck";
import { FAMOUS_LOGOS_BRANDS_DECK } from "./Decks/FamousLogosDeck";
import { FAMOUS_PEOPLE_DECK } from "./Decks/FamousPeopleDeck";
import { FAMOUS_TV_SERIES_DECK } from "./Decks/FamousTvSeriesDeck";
import { FAMOUS_VIDEOGAME_CHARACTERS_DECK } from "./Decks/FamousVideogameCharactersDeck";
import { FAMOUS_VIDEOGAMES_DECK } from "./Decks/FamousVideogamesDeck";
import { FAMOUS_YOUTUBERS_DECK } from "./Decks/FamousYoutubersDeck";
import { INTERNET_Y_REDES_DECK } from "./Decks/InternetYRedesDeck";
import { MARVEL_CHARACTERS_DECK } from "./Decks/MarvelCharactersDeck";
import { MONUMENTOS_Y_LUGARES_DECK } from "./Decks/MonumentosYLugaresDeck";
import { PERSONAJES_DE_CINE_DECK } from "./Decks/PersonajesDeCineDeck";
import { PERSONAJES_DE_SERIES_DECK } from "./Decks/PersonajesDeSeriesDeck";
import { POPULAR_SONGS_DECK } from "./Decks/PopularSongsDeck";
import { PROFESIONES_DECK } from "./Decks/ProfesionesDeck";
import { SAGAS_EPICAS_DECK } from "./Decks/SagasEpicasDeck";
import { SPORTS_DECK } from "./Decks/SportsDeck";
import { TAYLOR_SWIFT_DECK } from "./Decks/TaylorSwiftDeck";

// Deck Library - one deck per topic, each playable in every game language
export const DECK_LIBRARY = {
    // People & pop culture
    "famous-people": FAMOUS_PEOPLE_DECK,
    "famous-youtubers": FAMOUS_YOUTUBERS_DECK,
    "famous-logos-brands": FAMOUS_LOGOS_BRANDS_DECK,
    "internet-y-redes": INTERNET_Y_REDES_DECK,

    // Movies & TV
    "blockbuster-movies": BLOCKBUSTER_MOVIES_DECK,
    "famous-tv-series": FAMOUS_TV_SERIES_DECK,
    "personajes-de-cine": PERSONAJES_DE_CINE_DECK,
    "personajes-de-series": PERSONAJES_DE_SERIES_DECK,
    "marvel-characters": MARVEL_CHARACTERS_DECK,
    "disney-y-pixar": DISNEY_Y_PIXAR_DECK,
    "sagas-epicas": SAGAS_EPICAS_DECK,
    "cine-de-terror": CINE_DE_TERROR_DECK,
    "cine-y-series-de-espana": CINE_Y_SERIES_DE_ESPANA_DECK,
    "anime": ANIME_DECK,

    // Games
    "famous-videogames": FAMOUS_VIDEOGAMES_DECK,
    "famous-videogame-characters": FAMOUS_VIDEOGAME_CHARACTERS_DECK,

    // Music
    "popular-songs": POPULAR_SONGS_DECK,
    "exitos-para-cantar": EXITOS_PARA_CANTAR_DECK,
    "taylor-swift": TAYLOR_SWIFT_DECK,

    // Everyday life
    "act-it-out": ACT_IT_OUT_DECK,
    "accents-impressions": ACCENTS_IMPRESSIONS_DECK,
    animals: ANIMALS_DECK,
    sports: SPORTS_DECK,
    "comida-y-bebida": COMIDA_Y_BEBIDA_DECK,
    "profesiones": PROFESIONES_DECK,
    "monumentos-y-lugares": MONUMENTOS_Y_LUGARES_DECK,
};

// Helper function to get all available decks
export function getAllDecks() {
    return Object.values(DECK_LIBRARY);
}

// Helper function to get a specific deck by ID
export function getDeckById(deckId: string) {
    return DECK_LIBRARY[deckId as keyof typeof DECK_LIBRARY];
}
