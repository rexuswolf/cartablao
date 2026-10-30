import { Deck } from "./Deck";

export const FAMOUS_TV_SERIES_DECK = new Deck({
    id: "famous-tv-series",
    emoji: "📺",
    name: { es: "Series famosas", en: "Famous TV Series" },
    cards: [
        // Classics
        { id: "friends", text: "Friends" },
        { id: "the-office", text: "The Office" },
        { id: "seinfeld", text: "Seinfeld" },
        { id: "the-simpsons", text: { es: "Los Simpson", en: "The Simpsons" } },
        { id: "the-sopranos", text: { es: "Los Soprano", en: "The Sopranos" } },
        { id: "breaking-bad", text: "Breaking Bad" },

        // Fantasy & Sci-Fi
        { id: "game-of-thrones", text: { es: "Juego de Tronos", en: "Game of Thrones" } },
        { id: "stranger-things", text: "Stranger Things" },
        { id: "doctor-who", text: "Doctor Who" },
        { id: "the-mandalorian", text: "The Mandalorian" },
        { id: "black-mirror", text: "Black Mirror" },
        { id: "the-witcher", text: "The Witcher" },
        { id: "lost", text: { es: "Perdidos", en: "Lost" } },
        { id: "westworld", text: "Westworld" },
        { id: "severance", text: { es: "Separación", en: "Severance" } },

        // Drama
        { id: "the-crown", text: "The Crown" },
        { id: "this-is-us", text: "This Is Us" },
        { id: "mad-men", text: "Mad Men" },
        { id: "the-handmaid-s-tale", text: { es: "El cuento de la criada", en: "The Handmaid's Tale" } },
        { id: "better-call-saul", text: "Better Call Saul" },
        { id: "house-of-cards", text: "House of Cards" },
        { id: "euphoria", text: "Euphoria" },

        // Crime & Thriller
        { id: "sherlock", text: "Sherlock" },
        { id: "true-detective", text: "True Detective" },
        { id: "narcos", text: "Narcos" },
        { id: "mindhunter", text: "Mindhunter" },
        { id: "money-heist", text: { es: "La casa de papel", en: "Money Heist" } },
        { id: "dexter", text: "Dexter" },
        { id: "lupin", text: "Lupin" },

        // Comedy
        { id: "brooklyn-nine-nine", text: "Brooklyn Nine-Nine" },
        { id: "parks-and-recreation", text: "Parks and Recreation" },
        { id: "how-i-met-your-mother", text: { es: "Cómo conocí a vuestra madre", en: "How I Met Your Mother" } },
        { id: "modern-family", text: "Modern Family" },
        { id: "the-big-bang-theory", text: "The Big Bang Theory" },
        { id: "ted-lasso", text: "Ted Lasso" },
        { id: "arrested-development", text: "Arrested Development" },

        // International Hits
        { id: "squid-game", text: { es: "El juego del calamar", en: "Squid Game" } },
        { id: "dark", text: "Dark" },
        { id: "elite", text: { es: "Élite", en: "Elite" } },
        { id: "sacred-games", text: "Sacred Games" },
        { id: "borgen", text: "Borgen" },
        { id: "attack-on-titan", text: { es: "Ataque a los titanes", en: "Attack on Titan" } },
        { id: "one-piece", text: "One Piece" },

        // From the Spanish deck
        { id: "arcane", text: "Arcane" },
    ],
});
