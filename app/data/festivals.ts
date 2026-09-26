/**
 * Festival-day shlokas — on a festival day the home page "Today's
 * Shloka" card shows a festival greeting and a verse for the festival
 * instead of the regular daily rotation (app/data/shlokas.ts), and
 * /festivals lists the upcoming ones.
 *
 * This file holds the festivals themselves (names, greetings, verses,
 * book keywords), each under a stable key. Their DATES live in the
 * database (festival_dates, migration 030) and are managed in
 * Admin → Festivals — Hindu festivals follow the lunar calendar, so each
 * year's dates are added there from a panchanga. See
 * app/lib/services/festivalService.ts.
 *
 * A festival spanning several days (`to`) cycles through its `shlokas`,
 * one per day. ळ is used where Kannada stotra books print ಳ
 * (ಸರ್ವಮಂಗಳ, ನಿಂಬಕದಳ).
 */

import { SHLOKAS, istDayNumber, shlokaForToday, type Shloka } from "./shlokas";

export interface FestivalKind {
  name: { en: string; kn: string };
  greeting: { en: string; kn: string };
  shlokas: Shloka[];
  /**
   * Words that mark a book as good reading for this festival — matched
   * against book titles/subtitles/descriptions on the festival calendar
   * page. English words must match a whole word ("lakshmi" doesn't hit
   * "Lakshmikanth", so list "ramayana" separately from "rama"); Kannada
   * ones match anywhere.
   */
  keywords: string[];
}

/** A festival on particular dates (a festival_dates row + its kind). */
export interface Festival extends FestivalKind {
  /** key into FESTIVAL_KINDS */
  key: FestivalKey;
  /** first day, YYYY-MM-DD (IST) */
  from: string;
  /** last day, inclusive; omit for a single-day festival */
  to?: string;
}

/** a verse already in the daily rotation, looked up by its source */
function daily(sourceEn: string): Shloka {
  const s = SHLOKAS.find((x) => x.source.en === sourceEn);
  if (!s) throw new Error(`festivals.ts: no daily shloka with source "${sourceEn}"`);
  return s;
}

/* ---------- verses ---------- */

const DEVI_REFRAIN = "नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥";

function devi(form: string, formEn: string, formKn: string): Shloka {
  return {
    lines: [`या देवी सर्वभूतेषु ${form}रूपेण संस्थिता ।`, DEVI_REFRAIN],
    source: { en: "Devi Mahatmyam, Chapter 5", kn: "ದೇವೀ ಮಾಹಾತ್ಮ್ಯಂ, ಅಧ್ಯಾಯ 5" },
    meaning: {
      en: `To the Goddess who dwells in all beings as ${formEn} — salutations to Her, salutations to Her, salutations to Her, again and again.`,
      kn: `ಸಮಸ್ತ ಜೀವಿಗಳಲ್ಲಿ ${formKn} ನೆಲೆಸಿರುವ ದೇವಿಗೆ ನಮಸ್ಕಾರ, ನಮಸ್ಕಾರ, ನಮಸ್ಕಾರ, ಮತ್ತೆ ಮತ್ತೆ ನಮಸ್ಕಾರ.`,
    },
  };
}

const DEVI_SHAKTI = devi("शक्ति", "power (Shakti)", "ಶಕ್ತಿಯ ರೂಪದಲ್ಲಿ");
const DEVI_MATRU = devi("मातृ", "the Mother", "ತಾಯಿಯ ರೂಪದಲ್ಲಿ");
const DEVI_BUDDHI = devi("बुद्धि", "intelligence", "ಬುದ್ಧಿಯ ರೂಪದಲ್ಲಿ");
const DEVI_SHANTI = devi("शान्ति", "peace", "ಶಾಂತಿಯ ರೂಪದಲ್ಲಿ");
const DEVI_LAKSHMI = devi("लक्ष्मी", "Lakshmi (prosperity)", "ಲಕ್ಷ್ಮಿಯ ರೂಪದಲ್ಲಿ");

const SARVA_MANGALA: Shloka = {
  lines: ["सर्वमङ्गळमाङ्गल्ये शिवे सर्वार्थसाधिके ।", "शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥"],
  source: { en: "Devi Mahatmyam, Chapter 11", kn: "ದೇವೀ ಮಾಹಾತ್ಮ್ಯಂ, ಅಧ್ಯಾಯ 11" },
  meaning: {
    en: "O auspiciousness of all that is auspicious, O gracious one who fulfils every aim, O refuge of all, three-eyed Gauri, Narayani — salutations to You.",
    kn: "ಎಲ್ಲ ಮಂಗಳಗಳಿಗೂ ಮಂಗಳಕರಳೇ, ಶಿವೆ, ಎಲ್ಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಸುವವಳೇ, ಶರಣಾಗತರನ್ನು ಕಾಯುವವಳೇ, ತ್ರಿನೇತ್ರೆ ಗೌರಿ, ನಾರಾಯಣಿ — ನಿನಗೆ ನಮಸ್ಕಾರ.",
  },
};

const SARASWATI: Shloka = {
  lines: ["सरस्वति नमस्तुभ्यं वरदे कामरूपिणि ।", "विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा ॥"],
  source: { en: "Sri Saraswati Shloka", kn: "ಶ್ರೀ ಸರಸ್ವತೀ ಶ್ಲೋಕ" },
  meaning: {
    en: "Salutations to You, O Saraswati, giver of boons, who takes any form at will. I begin my learning — may I always be blessed with success.",
    kn: "ವರಗಳನ್ನು ನೀಡುವ, ಇಚ್ಛಾರೂಪಿಣಿಯಾದ ಸರಸ್ವತಿಯೇ, ನಿನಗೆ ನಮಸ್ಕಾರ. ನಾನು ವಿದ್ಯಾಭ್ಯಾಸವನ್ನು ಆರಂಭಿಸುತ್ತೇನೆ — ನನಗೆ ಸದಾ ಸಿದ್ಧಿ ದೊರೆಯಲಿ.",
  },
};

const SHAMI: Shloka = {
  lines: ["शमी शमयते पापं शमी शत्रुविनाशिनी ।", "अर्जुनस्य धनुर्धारी रामस्य प्रियदर्शिनी ॥"],
  source: { en: "Shami Puja Shloka", kn: "ಶಮೀ ಪೂಜೆ ಶ್ಲೋಕ" },
  meaning: {
    en: "The Shami tree calms away sin and destroys enemies; it held Arjuna's bow, and was a delight to Sri Rama's eyes.",
    kn: "ಶಮೀ ವೃಕ್ಷ ಪಾಪವನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ, ಶತ್ರುಗಳನ್ನು ನಾಶಮಾಡುತ್ತದೆ; ಅದು ಅರ್ಜುನನ ಧನುಸ್ಸನ್ನು ಕಾಪಾಡಿತು, ಶ್ರೀರಾಮನಿಗೆ ಪ್ರಿಯವಾದುದು.",
  },
};

const DEEPA_JYOTI: Shloka = {
  lines: ["दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः ।", "दीपो हरतु मे पापं दीपज्योतिर्नमोऽस्तु ते ॥"],
  source: { en: "Deepa Jyoti Stotram", kn: "ದೀಪಜ್ಯೋತಿ ಸ್ತೋತ್ರ" },
  meaning: {
    en: "The light of the lamp is the Supreme Brahman; the light of the lamp is Janardana. May the lamp take away my sins — salutations to you, O light of the lamp.",
    kn: "ದೀಪದ ಜ್ಯೋತಿಯೇ ಪರಬ್ರಹ್ಮ, ದೀಪದ ಜ್ಯೋತಿಯೇ ಜನಾರ್ದನ. ದೀಪವು ನನ್ನ ಪಾಪಗಳನ್ನು ಹೋಗಲಾಡಿಸಲಿ — ದೀಪಜ್ಯೋತಿಯೇ, ನಿನಗೆ ನಮಸ್ಕಾರ.",
  },
};

const SHUBHAM_KAROTI: Shloka = {
  lines: ["शुभं करोति कल्याणमारोग्यं धनसम्पदः ।", "शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते ॥"],
  source: { en: "Deepa Jyoti Stotram", kn: "ದೀಪಜ್ಯೋತಿ ಸ್ತೋತ್ರ" },
  meaning: {
    en: "The lamp brings auspiciousness, well-being, health and wealth, and destroys ill will — salutations to you, O light of the lamp.",
    kn: "ದೀಪವು ಶುಭ, ಕಲ್ಯಾಣ, ಆರೋಗ್ಯ ಮತ್ತು ಧನಸಂಪತ್ತನ್ನು ಕರುಣಿಸುತ್ತದೆ, ದ್ವೇಷಬುದ್ಧಿಯನ್ನು ನಾಶಮಾಡುತ್ತದೆ — ದೀಪಜ್ಯೋತಿಯೇ, ನಿನಗೆ ನಮಸ್ಕಾರ.",
  },
};

const MAHALAKSHMI: Shloka = {
  lines: ["नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते ।", "शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥"],
  source: { en: "Sri Mahalakshmi Ashtakam 1", kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಅಷ್ಟಕಂ 1" },
  meaning: {
    en: "Salutations to You, O great Maya, seated on the throne of prosperity and worshipped by the gods; holding the conch, discus and mace — O Mahalakshmi, salutations to You.",
    kn: "ಶ್ರೀಪೀಠದಲ್ಲಿ ನೆಲೆಸಿರುವ, ದೇವತೆಗಳಿಂದ ಪೂಜಿತಳಾದ ಮಹಾಮಾಯೆಯೇ, ಶಂಖ-ಚಕ್ರ-ಗದೆಗಳನ್ನು ಧರಿಸಿರುವ ಮಹಾಲಕ್ಷ್ಮಿಯೇ, ನಿನಗೆ ನಮಸ್ಕಾರ.",
  },
};

const SHANTAKARAM: Shloka = {
  lines: [
    "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं",
    "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ।",
    "लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं",
    "वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
  ],
  source: { en: "Sri Vishnu Dhyana Shloka", kn: "ಶ್ರೀ ವಿಷ್ಣು ಧ್ಯಾನ ಶ್ಲೋಕ" },
  meaning: {
    en: "I bow to Vishnu — serene, resting on the serpent, lotus-naveled, lord of the gods, support of the universe, vast as the sky, dark as a rain cloud, of auspicious form; beloved of Lakshmi, lotus-eyed, reached by yogis in meditation, who removes the fear of worldly existence, the one Lord of all worlds.",
    kn: "ಶಾಂತಸ್ವರೂಪನೂ, ಶೇಷಶಾಯಿಯೂ, ಪದ್ಮನಾಭನೂ, ದೇವತೆಗಳ ಒಡೆಯನೂ, ವಿಶ್ವಕ್ಕೆ ಆಧಾರನೂ, ಆಕಾಶದಂತೆ ವ್ಯಾಪಕನೂ, ಮೇಘವರ್ಣನೂ, ಶುಭಾಂಗನೂ, ಲಕ್ಷ್ಮೀಕಾಂತನೂ, ಕಮಲನಯನನೂ, ಯೋಗಿಗಳ ಧ್ಯಾನಕ್ಕೆ ಗೋಚರನೂ, ಸಂಸಾರಭಯವನ್ನು ಹೋಗಲಾಡಿಸುವವನೂ, ಸರ್ವಲೋಕಗಳ ಏಕೈಕ ನಾಥನೂ ಆದ ವಿಷ್ಣುವಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
  },
};

const SURYA: Shloka = {
  lines: ["जपाकुसुमसङ्काशं काश्यपेयं महाद्युतिम् ।", "तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम् ॥"],
  source: { en: "Navagraha Stotram 1", kn: "ನವಗ್ರಹ ಸ್ತೋತ್ರ 1" },
  meaning: {
    en: "I bow to the Sun — red as the hibiscus flower, son of Kashyapa, of great brilliance, enemy of darkness and destroyer of all sins.",
    kn: "ದಾಸವಾಳದ ಹೂವಿನಂತೆ ಕೆಂಪಾದ, ಕಶ್ಯಪರ ಪುತ್ರನಾದ, ಮಹಾತೇಜಸ್ವಿಯಾದ, ಕತ್ತಲಿನ ಶತ್ರುವೂ ಎಲ್ಲ ಪಾಪಗಳ ನಾಶಕನೂ ಆದ ಸೂರ್ಯದೇವನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
  },
};

const MAHAMRITYUNJAYA: Shloka = {
  lines: ["ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।", "उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥"],
  source: { en: "Rigveda 7.59.12 — Mahamrityunjaya Mantra", kn: "ಋಗ್ವೇದ 7.59.12 — ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ" },
  meaning: {
    en: "We worship the three-eyed Lord, fragrant, who nourishes all beings. As a ripe cucumber is freed from its vine, may He free us from death — but not from immortality.",
    kn: "ಸುಗಂಧಭರಿತನೂ, ಎಲ್ಲರನ್ನೂ ಪೋಷಿಸುವವನೂ ಆದ ತ್ರಿನೇತ್ರನನ್ನು ಪೂಜಿಸುತ್ತೇವೆ. ಹಣ್ಣಾದ ಸೌತೆಕಾಯಿ ಬಳ್ಳಿಯಿಂದ ಬಿಡುಗಡೆಯಾಗುವಂತೆ, ಅವನು ನಮ್ಮನ್ನು ಮೃತ್ಯುವಿನಿಂದ ಬಿಡಿಸಲಿ, ಅಮೃತತ್ವದಿಂದಲ್ಲ.",
  },
};

const UGADI_NEEM: Shloka = {
  lines: ["शतायुर्वज्रदेहाय सर्वसम्पत्कराय च ।", "सर्वारिष्टविनाशाय निम्बकदळभक्षणम् ॥"],
  source: { en: "Ugadi Bevu-Bella Shloka", kn: "ಯುಗಾದಿ ಬೇವು-ಬೆಲ್ಲ ಶ್ಲೋಕ" },
  meaning: {
    en: "Eating neem leaves brings a life of a hundred years, a body strong as diamond, every kind of prosperity, and the end of all misfortune.",
    kn: "ನೂರು ವರ್ಷಗಳ ಆಯುಸ್ಸು, ವಜ್ರದಂತಹ ದೃಢ ದೇಹ, ಸರ್ವಸಂಪತ್ತು ಮತ್ತು ಎಲ್ಲ ಅರಿಷ್ಟಗಳ ನಿವಾರಣೆಗಾಗಿ ಬೇವಿನ ಎಲೆಗಳನ್ನು ಸೇವಿಸುತ್ತೇವೆ.",
  },
};

const RAMA: Shloka = {
  lines: ["रामाय रामभद्राय रामचन्द्राय वेधसे ।", "रघुनाथाय नाथाय सीतायाः पतये नमः ॥"],
  source: { en: "Sri Rama Raksha Stotram", kn: "ಶ್ರೀ ರಾಮರಕ್ಷಾ ಸ್ತೋತ್ರ" },
  meaning: {
    en: "Salutations to Rama, Ramabhadra, Ramachandra, the creator; to the Lord of the Raghus, the protector, the husband of Sita.",
    kn: "ರಾಮನಿಗೆ, ರಾಮಭದ್ರನಿಗೆ, ರಾಮಚಂದ್ರನಿಗೆ, ಸೃಷ್ಟಿಕರ್ತನಿಗೆ, ರಘುನಾಥನಿಗೆ, ಜಗನ್ನಾಥನಿಗೆ, ಸೀತಾಪತಿಗೆ ನಮಸ್ಕಾರ.",
  },
};

const KRISHNA: Shloka = {
  lines: ["वसुदेवसुतं देवं कंसचाणूरमर्दनम् ।", "देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥"],
  source: { en: "Sri Krishna Ashtakam", kn: "ಶ್ರೀ ಕೃಷ್ಣಾಷ್ಟಕಂ" },
  meaning: {
    en: "I bow to Krishna, the divine son of Vasudeva, slayer of Kamsa and Chanura, the supreme joy of Devaki — the teacher of the world.",
    kn: "ವಸುದೇವನ ಪುತ್ರನೂ, ಕಂಸ-ಚಾಣೂರರನ್ನು ಸಂಹರಿಸಿದವನೂ, ದೇವಕಿಯ ಪರಮಾನಂದನೂ, ಜಗದ್ಗುರುವೂ ಆದ ಶ್ರೀಕೃಷ್ಣನಿಗೆ ವಂದಿಸುತ್ತೇನೆ.",
  },
};

const GANESHA = daily("Sri Ganesha Shloka");
const GURU = daily("Guru Stotram");

/* ---------- festivals ---------- */

const NAVARATRI: FestivalKind = {
  name: { en: "Navaratri", kn: "ನವರಾತ್ರಿ" },
  greeting: { en: "Happy Navaratri", kn: "ನವರಾತ್ರಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [DEVI_SHAKTI, SARVA_MANGALA, DEVI_MATRU, DEVI_BUDDHI, DEVI_SHANTI, DEVI_LAKSHMI],
  keywords: ["devi", "durga", "lalitha", "lalita", "chandi", "shakti", "ದೇವಿ", "ದುರ್ಗಾ", "ಲಲಿತಾ"],
};
const AYUDHA_PUJA: FestivalKind = {
  name: { en: "Mahanavami · Ayudha Puja", kn: "ಮಹಾನವಮಿ · ಆಯುಧ ಪೂಜೆ" },
  greeting: { en: "Happy Ayudha Puja", kn: "ಆಯುಧ ಪೂಜೆಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [SARASWATI],
  keywords: ["saraswati", "sarasvati", "durga", "devi", "ಸರಸ್ವತಿ", "ದುರ್ಗಾ"],
};
const VIJAYADASHAMI: FestivalKind = {
  name: { en: "Vijayadashami", kn: "ವಿಜಯದಶಮಿ" },
  greeting: { en: "Happy Vijayadashami", kn: "ವಿಜಯದಶಮಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [SHAMI],
  keywords: ["durga", "devi", "chamundi", "rama", "ramayana", "ದುರ್ಗಾ", "ಚಾಮುಂಡಿ", "ರಾಮ"],
};
const DEEPAVALI: FestivalKind = {
  name: { en: "Deepavali", kn: "ದೀಪಾವಳಿ" },
  greeting: { en: "Happy Deepavali", kn: "ದೀಪಾವಳಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [DEEPA_JYOTI, MAHALAKSHMI],
  keywords: ["lakshmi", "krishna", "ಲಕ್ಷ್ಮಿ", "ಲಕ್ಷ್ಮೀ", "ಕೃಷ್ಣ"],
};
const BALI_PADYAMI: FestivalKind = {
  name: { en: "Balipadyami", kn: "ಬಲಿಪಾಡ್ಯಮಿ" },
  greeting: { en: "Happy Balipadyami", kn: "ಬಲಿಪಾಡ್ಯಮಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [SHUBHAM_KAROTI],
  keywords: ["vishnu", "vamana", "ವಿಷ್ಣು", "ವಾಮನ"],
};
const VAIKUNTHA_EKADASHI: FestivalKind = {
  name: { en: "Vaikuntha Ekadashi", kn: "ವೈಕುಂಠ ಏಕಾದಶಿ" },
  greeting: { en: "Vaikuntha Ekadashi blessings", kn: "ವೈಕುಂಠ ಏಕಾದಶಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [SHANTAKARAM],
  keywords: ["vishnu", "bhagavad", "gita", "ವಿಷ್ಣು", "ಗೀತೆ", "ಗೀತಾ"],
};
const SANKRANTI: FestivalKind = {
  name: { en: "Makara Sankranti", kn: "ಮಕರ ಸಂಕ್ರಾಂತಿ" },
  greeting: { en: "Happy Makara Sankranti", kn: "ಮಕರ ಸಂಕ್ರಾಂತಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [SURYA],
  keywords: ["surya", "aditya", "ಸೂರ್ಯ", "ಆದಿತ್ಯ"],
};
const SHIVARATRI: FestivalKind = {
  name: { en: "Maha Shivaratri", kn: "ಮಹಾ ಶಿವರಾತ್ರಿ" },
  greeting: { en: "Maha Shivaratri blessings", kn: "ಮಹಾ ಶಿವರಾತ್ರಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [MAHAMRITYUNJAYA],
  keywords: ["shiva", "siva", "rudra", "ಶಿವ", "ರುದ್ರ"],
};
const UGADI: FestivalKind = {
  name: { en: "Ugadi", kn: "ಯುಗಾದಿ" },
  greeting: { en: "Happy Ugadi", kn: "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು" },
  shlokas: [UGADI_NEEM],
  keywords: ["panchanga", "ಪಂಚಾಂಗ"],
};
const RAMA_NAVAMI: FestivalKind = {
  name: { en: "Sri Rama Navami", kn: "ಶ್ರೀ ರಾಮನವಮಿ" },
  greeting: { en: "Happy Sri Rama Navami", kn: "ಶ್ರೀ ರಾಮನವಮಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [RAMA],
  keywords: ["rama", "ramayana", "hanuman", "ರಾಮ", "ಹನುಮ"],
};
const AKSHAYA_TRITIYA: FestivalKind = {
  name: { en: "Akshaya Tritiya", kn: "ಅಕ್ಷಯ ತೃತೀಯ" },
  greeting: { en: "Happy Akshaya Tritiya", kn: "ಅಕ್ಷಯ ತೃತೀಯದ ಶುಭಾಶಯಗಳು" },
  shlokas: [MAHALAKSHMI],
  keywords: ["lakshmi", "ಲಕ್ಷ್ಮಿ", "ಲಕ್ಷ್ಮೀ"],
};
const GURU_PURNIMA: FestivalKind = {
  name: { en: "Guru Purnima", kn: "ಗುರು ಪೂರ್ಣಿಮೆ" },
  greeting: { en: "Happy Guru Purnima", kn: "ಗುರು ಪೂರ್ಣಿಮೆಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [GURU],
  keywords: ["guru", "bhagavad", "gita", "ಗುರು", "ಗೀತೆ"],
};
const VARAMAHALAKSHMI: FestivalKind = {
  name: { en: "Varamahalakshmi Vrata", kn: "ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ" },
  greeting: { en: "Happy Varamahalakshmi", kn: "ವರಮಹಾಲಕ್ಷ್ಮೀ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು" },
  shlokas: [DEVI_LAKSHMI, MAHALAKSHMI],
  keywords: ["lakshmi", "ಲಕ್ಷ್ಮಿ", "ಲಕ್ಷ್ಮೀ"],
};
const JANMASHTAMI: FestivalKind = {
  name: { en: "Sri Krishna Janmashtami", kn: "ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ" },
  greeting: { en: "Happy Krishna Janmashtami", kn: "ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [KRISHNA],
  keywords: ["krishna", "bhagavad", "gita", "ಕೃಷ್ಣ", "ಗೀತೆ"],
};
const GANESHA_CHATURTHI: FestivalKind = {
  name: { en: "Ganesha Chaturthi", kn: "ಗಣೇಶ ಚತುರ್ಥಿ" },
  greeting: { en: "Happy Ganesha Chaturthi", kn: "ಗಣೇಶ ಚತುರ್ಥಿಯ ಶುಭಾಶಯಗಳು" },
  shlokas: [GANESHA],
  keywords: ["ganesha", "ganesh", "ganapati", "vinayaka", "ಗಣೇಶ", "ಗಣಪತಿ"],
};

/**
 * Every festival the site knows, by key. The key is what festival_dates
 * rows store — never rename one (add a new key instead).
 */
export const FESTIVAL_KINDS = {
  navaratri: NAVARATRI,
  ayudha_puja: AYUDHA_PUJA,
  vijayadashami: VIJAYADASHAMI,
  deepavali: DEEPAVALI,
  bali_padyami: BALI_PADYAMI,
  vaikuntha_ekadashi: VAIKUNTHA_EKADASHI,
  sankranti: SANKRANTI,
  shivaratri: SHIVARATRI,
  ugadi: UGADI,
  rama_navami: RAMA_NAVAMI,
  akshaya_tritiya: AKSHAYA_TRITIYA,
  guru_purnima: GURU_PURNIMA,
  varamahalakshmi: VARAMAHALAKSHMI,
  janmashtami: JANMASHTAMI,
  ganesha_chaturthi: GANESHA_CHATURTHI,
} satisfies Record<string, FestivalKind>;

export type FestivalKey = keyof typeof FESTIVAL_KINDS;

export function isFestivalKey(value: unknown): value is FestivalKey {
  return typeof value === "string" && Object.hasOwn(FESTIVAL_KINDS, value);
}

const DAY_MS = 86_400_000;
const dayNumberOf = (ymd: string) => Math.floor(Date.parse(`${ymd}T00:00:00Z`) / DAY_MS);

/** The festival on the given IST day number (days since 1970-01-01), if any. */
export function festivalOnDay(
  festivals: Festival[],
  dayNumber: number
): { festival: Festival; shloka: Shloka } | null {
  for (const festival of festivals) {
    const start = dayNumberOf(festival.from);
    const end = dayNumberOf(festival.to ?? festival.from);
    if (dayNumber >= start && dayNumber <= end) {
      const shloka = festival.shlokas[(dayNumber - start) % festival.shlokas.length];
      return { festival, shloka };
    }
  }
  return null;
}

/** Published books that suit a festival (see Festival.keywords). */
export function booksForFestival<
  B extends { title?: string | null; subtitle?: string | null; description?: string | null }
>(festival: Festival, books: B[], limit = 3): B[] {
  const tests = festival.keywords.map((kw) =>
    /^[a-z]+$/.test(kw)
      ? (text: string) => new RegExp(`(^|[^a-z])${kw}($|[^a-z])`).test(text)
      : (text: string) => text.includes(kw)
  );
  return books
    .filter((b) => {
      const text = `${b.title ?? ""} ${b.subtitle ?? ""} ${b.description ?? ""}`.toLowerCase();
      return tests.some((test) => test(text));
    })
    .slice(0, limit);
}

/** Days since 1970-01-01 of a festival's first and last (IST) day. */
export function festivalDays(festival: Festival): { start: number; end: number } {
  return { start: dayNumberOf(festival.from), end: dayNumberOf(festival.to ?? festival.from) };
}

/** The home card's verse: the festival's on a festival day, else the daily rotation. */
export function shlokaOfTheDay(
  festivals: Festival[],
  now: Date = new Date()
): { shloka: Shloka; festival: Festival | null } {
  const onFestival = festivalOnDay(festivals, istDayNumber(now));
  if (onFestival) return onFestival;
  return { shloka: shlokaForToday(now).shloka, festival: null };
}
