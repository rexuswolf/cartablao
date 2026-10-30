import { Deck } from "./Deck";

export const KIDS_DECK = new Deck({
    id: "kids",
    emoji: "🧸",
    name: { es: "Para peques", en: "Kids" },
    cards: [
        // Cartoons
        { id: "peppa-pig", text: "Peppa Pig" },
        { id: "bluey", text: "Bluey" },
        { id: "paw-patrol", text: { es: "La Patrulla Canina", en: "PAW Patrol" } },
        { id: "pocoyo", text: { es: "Pocoyó", en: "Pocoyo" } },
        { id: "the-smurfs", text: { es: "Los Pitufos", en: "The Smurfs" } },
        { id: "spongebob", text: { es: "Bob Esponja", en: "SpongeBob" } },
        { id: "pikachu", text: "Pikachu" },
        { id: "mickey-mouse", text: "Mickey Mouse" },
        { id: "dora-the-explorer", text: { es: "Dora la Exploradora", en: "Dora the Explorer" } },
        { id: "bob-the-builder", text: { es: "Bob el Constructor", en: "Bob the Builder" } },
        { id: "sesame-street", text: { es: "Barrio Sésamo", en: "Sesame Street" } },
        { id: "elmo", text: "Elmo" },
        { id: "masha-and-the-bear", text: { es: "Masha y el Oso", en: "Masha and the Bear" } },
        { id: "teenage-mutant-ninja-turtles", text: { es: "Las Tortugas Ninja", en: "Teenage Mutant Ninja Turtles" } },

        // Fairy tales
        { id: "little-red-riding-hood", text: { es: "Caperucita Roja", en: "Little Red Riding Hood" } },
        { id: "the-three-little-pigs", text: { es: "Los tres cerditos", en: "The Three Little Pigs" } },
        { id: "goldilocks", text: { es: "Ricitos de Oro", en: "Goldilocks" } },
        { id: "hansel-and-gretel", text: { es: "Hansel y Gretel", en: "Hansel and Gretel" } },
        { id: "tom-thumb", text: { es: "Pulgarcito", en: "Tom Thumb" } },
        { id: "the-ugly-duckling", text: { es: "El patito feo", en: "The Ugly Duckling" } },
        { id: "puss-in-boots", text: { es: "El gato con botas", en: "Puss in Boots" } },
        { id: "rapunzel", text: "Rapunzel" },
        { id: "pinocchio", text: { es: "Pinocho", en: "Pinocchio" } },
        { id: "jack-and-the-beanstalk", text: { es: "Juan y las habichuelas mágicas", en: "Jack and the Beanstalk" } },

        // Toys and games
        { id: "teddy-bear", text: { es: "Osito de peluche", en: "Teddy Bear" } },
        { id: "spinning-top", text: { es: "Peonza", en: "Spinning Top" } },
        { id: "yo-yo", text: { es: "Yoyó", en: "Yo-yo" } },
        { id: "doll", text: { es: "Muñeca", en: "Doll" } },
        { id: "kite", text: { es: "Cometa", en: "Kite" } },
        { id: "ball", text: { es: "Pelota", en: "Ball" } },
        { id: "scooter", text: { es: "Patinete", en: "Scooter" } },
        { id: "swing", text: { es: "Columpio", en: "Swing" } },
        { id: "slide", text: { es: "Tobogán", en: "Slide" } },
        { id: "toy-train", text: { es: "Tren de juguete", en: "Toy Train" } },
        { id: "bouncy-castle", text: { es: "Castillo hinchable", en: "Bouncy Castle" } },
        { id: "hide-and-seek", text: { es: "El escondite", en: "Hide and Seek" } },
        { id: "tag", text: { es: "Pilla pilla", en: "Tag" } },
        { id: "hopscotch", text: { es: "Rayuela", en: "Hopscotch" } },
        { id: "musical-chairs", text: { es: "Juego de las sillas", en: "Musical Chairs" } },
    ],
});
