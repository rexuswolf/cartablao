import type { Localizable } from "../../data/language";

// One idea on a card. The id is stable, so the same card in two decks plays only once.
export interface DeckCard {
    id: string;
    text: Localizable;
}
