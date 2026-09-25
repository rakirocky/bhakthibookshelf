/**
 * Daily shloka (home page card) — one per day in India time, cycling
 * through this list. The card shows each verse in Kannada script
 * (converted from this Devanagari by app/lib/kannadaScript.ts) with the
 * English meaning. `meaning.kn` is kept for a possible Kannada meaning.
 *
 * Verified 2026-09-25 against published texts: Bhagavad Gita verses vs
 * holy-bhagavad-gita.org (18.66 uses the common "त्वां"; some editions
 * such as Gita Press print "त्वा"), the other verses vs shlokam.org,
 * greenmesg.org, vedicheritage.gov.in and Wikipedia (Gayatri Mantra).
 * Still worth a read-through by the client. Add, remove or reorder
 * entries freely — the rotation adapts to the list length.
 */

export interface Shloka {
  /** Devanagari, one entry per line of the verse */
  lines: string[];
  source: { en: string; kn: string };
  meaning: { en: string; kn: string };
}

export const SHLOKAS: Shloka[] = [
  {
    lines: ["कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।", "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥"],
    source: { en: "Bhagavad Gita 2.47", kn: "ಭಗವದ್ಗೀತೆ 2.47" },
    meaning: {
      en: "You have a right to your actions, but never to their fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.",
      kn: "ನಿನ್ನ ಅಧಿಕಾರ ಕರ್ಮದಲ್ಲಿ ಮಾತ್ರ, ಅದರ ಫಲದಲ್ಲಿ ಎಂದಿಗೂ ಅಲ್ಲ. ಕರ್ಮಫಲವೇ ನಿನ್ನ ಉದ್ದೇಶವಾಗದಿರಲಿ; ಕರ್ಮ ಮಾಡದಿರುವುದರಲ್ಲೂ ನಿನಗೆ ಆಸಕ್ತಿ ಬೇಡ.",
    },
  },
  {
    lines: ["यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।", "अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥"],
    source: { en: "Bhagavad Gita 4.7", kn: "ಭಗವದ್ಗೀತೆ 4.7" },
    meaning: {
      en: "Whenever there is a decline of dharma and a rise of adharma, O Bharata, I manifest Myself.",
      kn: "ಓ ಭಾರತ, ಯಾವಾಗ ಯಾವಾಗ ಧರ್ಮಕ್ಕೆ ಹಾನಿಯಾಗಿ ಅಧರ್ಮ ಹೆಚ್ಚುತ್ತದೆಯೋ, ಆಗ ನಾನು ಅವತರಿಸುತ್ತೇನೆ.",
    },
  },
  {
    lines: ["परित्राणाय साधूनां विनाशाय च दुष्कृताम् ।", "धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥"],
    source: { en: "Bhagavad Gita 4.8", kn: "ಭಗವದ್ಗೀತೆ 4.8" },
    meaning: {
      en: "To protect the righteous, to destroy the wicked, and to firmly establish dharma, I am born in every age.",
      kn: "ಸಜ್ಜನರನ್ನು ರಕ್ಷಿಸಲು, ದುಷ್ಟರನ್ನು ನಾಶಮಾಡಲು ಮತ್ತು ಧರ್ಮವನ್ನು ಸ್ಥಾಪಿಸಲು ನಾನು ಯುಗಯುಗಗಳಲ್ಲೂ ಅವತರಿಸುತ್ತೇನೆ.",
    },
  },
  {
    lines: ["ॐ भूर्भुवः स्वः", "तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि", "धियो यो नः प्रचोदयात् ॥"],
    source: { en: "Rigveda 3.62.10 — Gayatri Mantra", kn: "ಋಗ್ವೇದ 3.62.10 — ಗಾಯತ್ರೀ ಮಂತ್ರ" },
    meaning: {
      en: "We meditate on the adorable radiance of the divine Savitr; may that light inspire our intellect.",
      kn: "ಪೂಜ್ಯನಾದ ಸವಿತೃ ದೇವನ ದಿವ್ಯ ತೇಜಸ್ಸನ್ನು ನಾವು ಧ್ಯಾನಿಸುತ್ತೇವೆ; ಆ ತೇಜಸ್ಸು ನಮ್ಮ ಬುದ್ಧಿಯನ್ನು ಪ್ರೇರೇಪಿಸಲಿ.",
    },
  },
  {
    lines: ["असतो मा सद्गमय ।", "तमसो मा ज्योतिर्गमय ।", "मृत्योर्मा अमृतं गमय ॥"],
    source: { en: "Brihadaranyaka Upanishad 1.3.28", kn: "ಬೃಹದಾರಣ್ಯಕ ಉಪನಿಷತ್ 1.3.28" },
    meaning: {
      en: "Lead me from the unreal to the real, from darkness to light, from death to immortality.",
      kn: "ಅಸತ್ಯದಿಂದ ಸತ್ಯದೆಡೆಗೆ, ಕತ್ತಲಿನಿಂದ ಬೆಳಕಿನೆಡೆಗೆ, ಮೃತ್ಯುವಿನಿಂದ ಅಮೃತತ್ವದೆಡೆಗೆ ನನ್ನನ್ನು ನಡೆಸು.",
    },
  },
  {
    lines: ["सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।", "सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥"],
    source: { en: "Shanti Mantra", kn: "ಶಾಂತಿ ಮಂತ್ರ" },
    meaning: {
      en: "May all be happy, may all be free from illness. May all see what is auspicious, and may no one suffer.",
      kn: "ಎಲ್ಲರೂ ಸುಖವಾಗಿರಲಿ, ಎಲ್ಲರೂ ರೋಗಮುಕ್ತರಾಗಿರಲಿ. ಎಲ್ಲರೂ ಶುಭವನ್ನೇ ಕಾಣಲಿ, ಯಾರೂ ದುಃಖಕ್ಕೆ ಒಳಗಾಗದಿರಲಿ.",
    },
  },
  {
    lines: ["वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।", "निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥"],
    source: { en: "Sri Ganesha Shloka", kn: "ಶ್ರೀ ಗಣೇಶ ಶ್ಲೋಕ" },
    meaning: {
      en: "O Lord with the curved trunk and mighty form, radiant as a million suns — remove all obstacles from my endeavours, always.",
      kn: "ಬಾಗಿದ ಸೊಂಡಿಲಿನ, ಮಹಾಕಾಯನಾದ, ಕೋಟಿ ಸೂರ್ಯರ ಕಾಂತಿಯುಳ್ಳ ದೇವನೇ, ನನ್ನ ಎಲ್ಲ ಕಾರ್ಯಗಳನ್ನು ಸದಾ ನಿರ್ವಿಘ್ನವಾಗಿಸು.",
    },
  },
  {
    lines: ["गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ।", "गुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥"],
    source: { en: "Guru Stotram", kn: "ಗುರು ಸ್ತೋತ್ರ" },
    meaning: {
      en: "The Guru is Brahma, the Guru is Vishnu, the Guru is Lord Maheshvara. The Guru is verily the Supreme Brahman — salutations to that revered Guru.",
      kn: "ಗುರುವೇ ಬ್ರಹ್ಮ, ಗುರುವೇ ವಿಷ್ಣು, ಗುರುವೇ ಮಹೇಶ್ವರ. ಗುರುವೇ ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ — ಅಂತಹ ಶ್ರೀಗುರುವಿಗೆ ನಮಸ್ಕಾರ.",
    },
  },
  {
    lines: ["ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते ।", "पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ॥"],
    source: { en: "Isha Upanishad — Shanti Mantra", kn: "ಈಶಾವಾಸ್ಯ ಉಪನಿಷತ್ — ಶಾಂತಿ ಮಂತ್ರ" },
    meaning: {
      en: "That is whole, this is whole; from the whole the whole arises. Taking the whole from the whole, the whole alone remains.",
      kn: "ಅದು ಪೂರ್ಣ, ಇದು ಪೂರ್ಣ; ಪೂರ್ಣದಿಂದಲೇ ಪೂರ್ಣ ಉದಯಿಸುತ್ತದೆ. ಪೂರ್ಣದಿಂದ ಪೂರ್ಣವನ್ನು ತೆಗೆದರೂ ಪೂರ್ಣವೇ ಉಳಿಯುತ್ತದೆ.",
    },
  },
  {
    lines: ["उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।", "आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥"],
    source: { en: "Bhagavad Gita 6.5", kn: "ಭಗವದ್ಗೀತೆ 6.5" },
    meaning: {
      en: "Lift yourself by your own self; do not let yourself sink. The self alone is one's friend, and the self alone is one's enemy.",
      kn: "ನಿನ್ನನ್ನು ನೀನೇ ಉದ್ಧರಿಸಿಕೋ, ನಿನ್ನನ್ನು ಕುಗ್ಗಿಸಿಕೊಳ್ಳಬೇಡ. ನಮಗೆ ನಾವೇ ಬಂಧು, ನಮಗೆ ನಾವೇ ಶತ್ರು.",
    },
  },
  {
    lines: ["अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते ।", "तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥"],
    source: { en: "Bhagavad Gita 9.22", kn: "ಭಗವದ್ಗೀತೆ 9.22" },
    meaning: {
      en: "To those who worship Me with undivided devotion, ever steadfast, I bring what they lack and preserve what they have.",
      kn: "ಅನನ್ಯ ಭಕ್ತಿಯಿಂದ ನನ್ನನ್ನೇ ಚಿಂತಿಸಿ ಉಪಾಸಿಸುವ ನಿತ್ಯನಿರತರ ಯೋಗಕ್ಷೇಮವನ್ನು ನಾನೇ ನೋಡಿಕೊಳ್ಳುತ್ತೇನೆ.",
    },
  },
  {
    lines: ["सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।", "अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥"],
    source: { en: "Bhagavad Gita 18.66", kn: "ಭಗವದ್ಗೀತೆ 18.66" },
    meaning: {
      en: "Abandoning all dharmas, take refuge in Me alone. I shall free you from all sins; do not grieve.",
      kn: "ಎಲ್ಲ ಧರ್ಮಗಳನ್ನೂ ಬಿಟ್ಟು ನನ್ನೊಬ್ಬನಲ್ಲೇ ಶರಣಾಗು. ನಾನು ನಿನ್ನನ್ನು ಎಲ್ಲ ಪಾಪಗಳಿಂದ ಮುಕ್ತಗೊಳಿಸುತ್ತೇನೆ; ಚಿಂತಿಸಬೇಡ.",
    },
  },
  {
    lines: ["मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् ।", "वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥"],
    source: { en: "Sri Rama Raksha Stotram", kn: "ಶ್ರೀ ರಾಮರಕ್ಷಾ ಸ್ತೋತ್ರ" },
    meaning: {
      en: "I take refuge in Hanuman — swift as the mind, fast as the wind, master of the senses, foremost among the wise, son of the Wind god, chief of the vanaras and messenger of Sri Rama.",
      kn: "ಮನಸ್ಸಿನಷ್ಟು ವೇಗಿ, ವಾಯುವಿನಷ್ಟು ಚುರುಕು, ಜಿತೇಂದ್ರಿಯ, ಬುದ್ಧಿವಂತರಲ್ಲಿ ಶ್ರೇಷ್ಠ, ವಾಯುಪುತ್ರ, ವಾನರಸೇನೆಯ ಮುಖ್ಯಸ್ಥ, ಶ್ರೀರಾಮದೂತನಾದ ಹನುಮಂತನಿಗೆ ನಾನು ಶರಣಾಗುತ್ತೇನೆ.",
    },
  },
  {
    lines: ["ॐ सह नाववतु । सह नौ भुनक्तु । सह वीर्यं करवावहै ।", "तेजस्वि नावधीतमस्तु मा विद्विषावहै ॥", "ॐ शान्तिः शान्तिः शान्तिः ॥"],
    source: { en: "Taittiriya Upanishad — Shanti Mantra", kn: "ತೈತ್ತಿರೀಯ ಉಪನಿಷತ್ — ಶಾಂತಿ ಮಂತ್ರ" },
    meaning: {
      en: "May He protect us both; may He nourish us both; may we work together with vigour; may our study be illuminating; may we never bear ill will. Om, peace, peace, peace.",
      kn: "ದೇವರು ನಮ್ಮಿಬ್ಬರನ್ನೂ ರಕ್ಷಿಸಲಿ, ಪೋಷಿಸಲಿ; ನಾವು ಒಟ್ಟಾಗಿ ಶ್ರಮಿಸೋಣ; ನಮ್ಮ ಅಧ್ಯಯನ ತೇಜಸ್ವಿಯಾಗಲಿ; ನಾವು ಪರಸ್ಪರ ದ್ವೇಷಿಸದಿರೋಣ. ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ.",
    },
  },
  {
    lines: ["कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती ।", "करमूले तु गोविन्दः प्रभाते करदर्शनम् ॥"],
    source: { en: "Morning Prayer", kn: "ಪ್ರಾತಃಸ್ಮರಣೆ" },
    meaning: {
      en: "At the fingertips dwells Lakshmi, in the middle of the palm Saraswati, and at its base Govinda — so look at your palms each morning.",
      kn: "ಅಂಗೈಯ ತುದಿಯಲ್ಲಿ ಲಕ್ಷ್ಮಿ, ಮಧ್ಯದಲ್ಲಿ ಸರಸ್ವತಿ, ಬುಡದಲ್ಲಿ ಗೋವಿಂದ ನೆಲೆಸಿದ್ದಾರೆ — ಆದ್ದರಿಂದ ಬೆಳಿಗ್ಗೆ ಎದ್ದೊಡನೆ ಕರದರ್ಶನ ಮಾಡಬೇಕು.",
    },
  },
  {
    lines: ["शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् ।", "प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ॥"],
    source: { en: "Dhyana Shloka", kn: "ಧ್ಯಾನ ಶ್ಲೋಕ" },
    meaning: {
      en: "Meditate on the one clad in white, all-pervading, moon-hued, four-armed, with a gracious face — for the removal of all obstacles.",
      kn: "ಶ್ವೇತವಸ್ತ್ರಧಾರಿಯೂ, ಸರ್ವವ್ಯಾಪಿಯೂ, ಚಂದ್ರನಂತೆ ಕಾಂತಿಯುಳ್ಳವನೂ, ಚತುರ್ಭುಜನೂ, ಪ್ರಸನ್ನವದನನೂ ಆದ ದೇವನನ್ನು ಎಲ್ಲ ವಿಘ್ನಗಳ ನಿವಾರಣೆಗಾಗಿ ಧ್ಯಾನಿಸಬೇಕು.",
    },
  },
  {
    lines: ["यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः ।", "स यत्प्रमाणं कुरुते लोकस्तदनुवर्तते ॥"],
    source: { en: "Bhagavad Gita 3.21", kn: "ಭಗವದ್ಗೀತೆ 3.21" },
    meaning: {
      en: "Whatever a great person does, others follow; whatever standard they set, the world pursues.",
      kn: "ಶ್ರೇಷ್ಠರು ಏನನ್ನು ಆಚರಿಸುತ್ತಾರೋ ಉಳಿದವರೂ ಅದನ್ನೇ ಅನುಸರಿಸುತ್ತಾರೆ; ಅವರು ಹಾಕಿಕೊಟ್ಟ ಮಾದರಿಯನ್ನೇ ಲೋಕ ಅನುಸರಿಸುತ್ತದೆ.",
    },
  },
  {
    lines: ["मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः ।", "आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥"],
    source: { en: "Bhagavad Gita 2.14", kn: "ಭಗವದ್ಗೀತೆ 2.14" },
    meaning: {
      en: "The contact of the senses with their objects brings cold and heat, pleasure and pain; they come and go and are impermanent — endure them patiently, O Bharata.",
      kn: "ಓ ಕೌಂತೇಯ, ಇಂದ್ರಿಯ-ವಿಷಯಗಳ ಸಂಪರ್ಕದಿಂದ ಶೀತ-ಉಷ್ಣ, ಸುಖ-ದುಃಖಗಳು ಉಂಟಾಗುತ್ತವೆ; ಅವು ಬಂದು ಹೋಗುವ ಅನಿತ್ಯ — ಓ ಭಾರತ, ಅವನ್ನು ಸಹನೆಯಿಂದ ಎದುರಿಸು.",
    },
  },
];

/** Today's shloka, by the calendar date in India (IST, UTC+5:30). */
export function shlokaForToday(now: Date = new Date()): { shloka: Shloka; index: number } {
  const ist = new Date(now.getTime() + 330 * 60 * 1000);
  const dayNumber = Math.floor(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) / 86_400_000
  );
  const index = dayNumber % SHLOKAS.length;
  return { shloka: SHLOKAS[index], index };
}
