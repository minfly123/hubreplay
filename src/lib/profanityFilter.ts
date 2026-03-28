// Indonesian & English profanity filter
const BLOCKED_WORDS = [
  // Indonesian
  "anjing", "anj1ng", "anjg", "bangsat", "b4ngsat", "babi", "b4bi",
  "kontol", "kont0l", "k0ntol", "memek", "m3m3k", "pepek", "p3p3k",
  "ngentot", "ngent0t", "ngewe", "jancok", "jancuk", "asu", "asw",
  "bajingan", "keparat", "setan", "brengsek", "tai", "t4i", "tolol",
  "t0l0l", "goblok", "g0bl0k", "idiot", "bodoh", "pantek", "pant3k",
  "kimak", "pukimak", "lonte", "l0nte", "pelacur", "sundal", "lacur",
  "coli", "colmek", "bokep", "b0kep", "porn", "p0rn", "hentai",
  // English
  "fuck", "f*ck", "fck", "shit", "sh1t", "bitch", "b1tch", "ass",
  "asshole", "dick", "d1ck", "pussy", "p*ssy", "cock", "c0ck",
  "whore", "slut", "bastard", "damn", "cunt", "nigga", "nigger",
  "retard", "penis", "vagina", "porn", "sex", "boobs", "nude",
];

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pattern = new RegExp(
  BLOCKED_WORDS.map((w) => `\\b${escapeRegex(w)}\\b`).join("|"),
  "gi"
);

export const containsProfanity = (text: string): boolean => {
  return pattern.test(text);
};

export const censorText = (text: string): string => {
  return text.replace(pattern, (match) => "*".repeat(match.length));
};
