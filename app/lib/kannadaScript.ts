/**
 * Devanagari → Kannada script, for Sanskrit verses (daily shloka).
 *
 * Unicode lays the Indic blocks out in parallel, so each Devanagari
 * letter maps to the Kannada letter at +0x380 (e.g. क U+0915 → ಕ U+0C95;
 * Devanagari ए/े are the long vowels, matching Kannada ಏ/ೇ as Sanskrit
 * is written in Kannada). Adjustments, following Kannada stotra books:
 *   - ॐ → ಓಂ (Kannada has no single Om sign)
 *   - dandas । ॥ are shared and kept as-is
 *   - a nasal + virama before a consonant of the same group becomes the
 *     anusvara: शान्तिः → ಶಾಂತಿಃ, गोविन्दः → ಗೋವಿಂದಃ, सम्भवामि → ಸಂಭವಾಮಿ
 */

const VIRAMA = "्";

// Nasal of each consonant group (varga) → the group's consonants
const VARGA_NASAL: Record<string, string> = {
  "ङ": "कखगघ",
  "ञ": "चछजझ",
  "ण": "टठडढ",
  "न": "तथदध",
  "म": "पफबभ",
};

function nasalToAnusvara(deva: string): string {
  let out = deva;
  for (const [nasal, group] of Object.entries(VARGA_NASAL)) {
    out = out.replace(new RegExp(`${nasal}${VIRAMA}(?=[${group}])`, "g"), "ं");
  }
  return out;
}

export function devanagariToKannada(deva: string): string {
  return Array.from(nasalToAnusvara(deva))
    .map((ch) => {
      if (ch === "ॐ") return "ಓಂ";
      const cp = ch.codePointAt(0)!;
      if (ch === "।" || ch === "॥") return ch;
      if (cp >= 0x0900 && cp <= 0x097f) {
        const kn = String.fromCodePoint(cp + 0x380);
        // guard: only map to letters Kannada actually has
        return /\p{L}|\p{M}|\p{N}|\p{Po}/u.test(kn) ? kn : ch;
      }
      return ch;
    })
    .join("");
}
