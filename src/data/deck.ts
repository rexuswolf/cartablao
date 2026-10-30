import { ACT_IT_OUT_DECK } from "./Decks/ActItOutDeck";
import { ANIMALS_DECK } from "./Decks/AnimalsDeck";
import { ANIME_DECK } from "./Decks/AnimeDeck";
import { BLOCKBUSTER_MOVIES_DECK } from "./Decks/BlockbusterMoviesDeck";
import { CHRISTMAS_DECK } from "./Decks/ChristmasDeck";
import { CINE_DE_TERROR_DECK } from "./Decks/CineDeTerrorDeck";
import { CINE_Y_SERIES_DE_ESPANA_DECK } from "./Decks/CineYSeriesDeEspanaDeck";
import { COMIDA_Y_BEBIDA_DECK } from "./Decks/ComidaYBebidaDeck";
import { DISNEY_Y_PIXAR_DECK } from "./Decks/DisneyYPixarDeck";
import { EIGHTIES_AND_NINETIES_DECK } from "./Decks/EightiesAndNinetiesDeck";
import { EVERYDAY_THINGS_DECK } from "./Decks/EverydayThingsDeck";
import { FAMOUS_LOGOS_BRANDS_DECK } from "./Decks/FamousLogosDeck";
import { FAMOUS_PEOPLE_DECK } from "./Decks/FamousPeopleDeck";
import { FAMOUS_TV_SERIES_DECK } from "./Decks/FamousTvSeriesDeck";
import { FAMOUS_VIDEOGAME_CHARACTERS_DECK } from "./Decks/FamousVideogameCharactersDeck";
import { FAMOUS_VIDEOGAMES_DECK } from "./Decks/FamousVideogamesDeck";
import { FEELINGS_AND_DANCES_DECK } from "./Decks/FeelingsAndDancesDeck";
import { HALLOWEEN_DECK } from "./Decks/HalloweenDeck";
import { INTERNET_Y_REDES_DECK } from "./Decks/InternetYRedesDeck";
import { KIDS_DECK } from "./Decks/KidsDeck";
import { MONUMENTOS_Y_LUGARES_DECK } from "./Decks/MonumentosYLugaresDeck";
import { PERSONAJES_DE_CINE_DECK } from "./Decks/PersonajesDeCineDeck";
import { PERSONAJES_DE_SERIES_DECK } from "./Decks/PersonajesDeSeriesDeck";
import { PROFESIONES_DECK } from "./Decks/ProfesionesDeck";
import { SAGAS_EPICAS_DECK } from "./Decks/SagasEpicasDeck";
import { SINGERS_AND_BANDS_DECK } from "./Decks/SingersAndBandsDeck";
import { SONGS_DECK } from "./Decks/SongsDeck";
import { SPORTS_DECK } from "./Decks/SportsDeck";
import { SPORTS_LEGENDS_DECK } from "./Decks/SportsLegendsDeck";
import { SUPERHEROES_DECK } from "./Decks/SuperheroesDeck";
import { TAYLOR_SWIFT_DECK } from "./Decks/TaylorSwiftDeck";

// Deck Library - one deck per topic, each playable in every game language
export const DECK_LIBRARY = {
    // People & pop culture
    "famous-people": FAMOUS_PEOPLE_DECK,
    "sports-legends": SPORTS_LEGENDS_DECK,
    "famous-logos-brands": FAMOUS_LOGOS_BRANDS_DECK,
    "internet-y-redes": INTERNET_Y_REDES_DECK,
    "80s-and-90s": EIGHTIES_AND_NINETIES_DECK,

    // Family
    kids: KIDS_DECK,
    "everyday-things": EVERYDAY_THINGS_DECK,
    "feelings-and-dances": FEELINGS_AND_DANCES_DECK,

    // Movies & TV
    "blockbuster-movies": BLOCKBUSTER_MOVIES_DECK,
    "famous-tv-series": FAMOUS_TV_SERIES_DECK,
    "personajes-de-cine": PERSONAJES_DE_CINE_DECK,
    "personajes-de-series": PERSONAJES_DE_SERIES_DECK,
    superheroes: SUPERHEROES_DECK,
    "disney-y-pixar": DISNEY_Y_PIXAR_DECK,
    "sagas-epicas": SAGAS_EPICAS_DECK,
    "cine-de-terror": CINE_DE_TERROR_DECK,
    "cine-y-series-de-espana": CINE_Y_SERIES_DE_ESPANA_DECK,
    "anime": ANIME_DECK,

    // Games
    "famous-videogames": FAMOUS_VIDEOGAMES_DECK,
    "famous-videogame-characters": FAMOUS_VIDEOGAME_CHARACTERS_DECK,

    // Music
    songs: SONGS_DECK,
    "singers-and-bands": SINGERS_AND_BANDS_DECK,
    "taylor-swift": TAYLOR_SWIFT_DECK,

    // Everyday life
    "act-it-out": ACT_IT_OUT_DECK,
    animals: ANIMALS_DECK,
    sports: SPORTS_DECK,
    "comida-y-bebida": COMIDA_Y_BEBIDA_DECK,
    "profesiones": PROFESIONES_DECK,
    "monumentos-y-lugares": MONUMENTOS_Y_LUGARES_DECK,

    // Seasonal
    christmas: CHRISTMAS_DECK,
    halloween: HALLOWEEN_DECK,
};

// Helper function to get all available decks
export function getAllDecks() {
    return Object.values(DECK_LIBRARY);
}

// Helper function to get a specific deck by ID
export function getDeckById(deckId: string) {
    return DECK_LIBRARY[deckId as keyof typeof DECK_LIBRARY];
}
