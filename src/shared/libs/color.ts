// Picks ink or white text for a background color, whichever has more contrast
export function getReadableTextColor(background: string): string {
    const hex = background.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const [r, g, b] = [0, 2, 4].map(i => {
        const channel = parseInt(full.slice(i, i + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const INK_LUMINANCE = 0.0125; // #1D1A2F
    const contrastWithWhite = 1.05 / (luminance + 0.05);
    const contrastWithInk = (luminance + 0.05) / (INK_LUMINANCE + 0.05);
    return contrastWithInk >= contrastWithWhite ? '#1d1a2f' : '#ffffff';
}
