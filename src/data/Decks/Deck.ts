import type { DeckCard } from "../../components/Card/DeckCard";
import type { LocalizedText } from "../language";

// A built-in deck: one topic, playable in every game language
export class Deck {
    id: string;
    emoji: string;
    name: LocalizedText;
    cards: DeckCard[];

    constructor({ id, emoji, name, cards }: { id: string; emoji: string; name: LocalizedText; cards: DeckCard[]; }) {
        this.id = id;
        this.emoji = emoji;
        this.name = name;
        this.cards = cards;
    }
}
