/* ============================================================================
 * KITCHEN COACH — CONFIG  (the only file you need to edit to change numbers)
 * ----------------------------------------------------------------------------
 * Per-person targets, meal templates, grocery list, batch steps, and the
 * masterbrief knowledge the offline coach draws on. Inline comments flag where
 * values come from the masterbrief.
 *
 * COUPLE RULE: two configs, JEAN and GF. The app loads ONE at a time
 * (?user=jean / ?user=gf) and namespaces all stored data by that key. Neither
 * instance can read the other's data. Do not add a shared view.
 *
 * NO API / NO COST: the coach runs fully offline (rules + your real logged
 * data). There is no API key, no network call, nothing to pay for.
 * ==========================================================================*/

/* ============================================================================
 * MEAL TEMPLATE LIBRARIES
 * Protein values are taken straight from the masterbrief. Calories/carbs/fat
 * are ESTIMATES allocated so each day's items roughly sum to the brief's
 * confirmed day totals — edit freely.
 *   day: which day-type this belongs to → 'training' | 'rest' | 'soccer' | 'any' | 'grab'
 *        'any'  = part of the daily plan on every day type (shown on home + plan)
 *        'grab' = building block, only shown in the full Log library
 * ==========================================================================*/

// Jean — full portions
const JEAN_LIBRARY = [
  // --- daily architecture (these tap-to-log on the home screen) ---
  { name: 'Chicken + rice lunch',          desc: '250g chicken · 200g rice · veg · 1 tsp oil', kcal: 700, p: 75, c: 78, f: 14, time: '12:00', day: 'training' },
  { name: 'Greek yogurt + protein muffin', desc: '250g yogurt · 1 plated muffin',              kcal: 360, p: 35, c: 34, f: 10, time: '15:00', day: 'any' },
  { name: 'Whey + banana',                 desc: 'the daily shake',                            kcal: 280, p: 26, c: 38, f: 4,  time: '18:30', day: 'any' },
  { name: 'Turkey + rice + 2 eggs',        desc: '250g turkey · 200g rice · veg',              kcal: 850, p: 85, c: 80, f: 24, time: '19:45', day: 'training' },
  { name: 'Nuts / fruit top-up',           desc: '~150 kcal',                                  kcal: 210, p: 5,  c: 18, f: 14, time: '20:00', day: 'training' },
  // --- rest-day smaller portions ---
  { name: 'Chicken + rice lunch',          desc: 'REST · 220g chicken · 150g rice · big veg',  kcal: 620, p: 68, c: 62, f: 12, time: '12:00', day: 'rest' },
  { name: 'Turkey + 2 eggs + rice',        desc: 'REST · 220g turkey · 120g rice · big veg',   kcal: 840, p: 72, c: 70, f: 22, time: '19:30', day: 'rest' },
  // --- Thursday soccer add-on ---
  { name: 'Pre-game banana',               desc: '~5:30 PM',                                   kcal: 110, p: 1,  c: 27, f: 0,  time: '17:30', day: 'soccer' },
  // --- grab / building blocks (Log tab only) ---
  { name: 'Greek yogurt (250g)',           desc: '',  kcal: 150, p: 23, c: 9, f: 4,  time: '15:00', day: 'grab' },
  { name: 'Protein muffin (1, plated)',    desc: '',  kcal: 180, p: 15, c: 18, f: 6, time: '15:00', day: 'grab' },
  { name: 'Whey scoop',                    desc: '',  kcal: 120, p: 24, c: 3, f: 2,  time: '18:30', day: 'grab' },
  { name: '2 boiled eggs',                 desc: '',  kcal: 140, p: 12, c: 1, f: 10, time: '19:45', day: 'grab' },
  { name: 'Canned tuna',                   desc: '',  kcal: 100, p: 22, c: 0, f: 1,  time: '13:00', day: 'grab' },
  { name: 'Cottage cheese (200g)',         desc: '',  kcal: 160, p: 22, c: 8, f: 5,  time: '15:00', day: 'grab' },
];

// Girlfriend — ~⅔ portions of the same food (ESTIMATES, see masterbrief)
const GF_LIBRARY = [
  { name: 'Chicken + rice lunch',          desc: '⅔ portion · chicken · rice · veg', kcal: 470, p: 50, c: 52, f: 9,  time: '12:00', day: 'any' },
  { name: 'Greek yogurt + protein muffin', desc: 'yogurt · 1 plated muffin',         kcal: 240, p: 23, c: 22, f: 7,  time: '15:00', day: 'any' },
  { name: 'Whey + banana',                 desc: 'shake',                            kcal: 190, p: 17, c: 25, f: 3,  time: '16:00', day: 'any' },
  { name: 'Turkey + rice + egg',           desc: '⅔ portion · turkey · rice · veg',  kcal: 560, p: 57, c: 53, f: 16, time: '19:00', day: 'any' },
  { name: 'Greek yogurt (200g)',           desc: '', kcal: 120, p: 18, c: 7, f: 3,  time: '15:00', day: 'grab' },
  { name: 'Protein muffin (1, plated)',    desc: '', kcal: 180, p: 15, c: 18, f: 6, time: '15:00', day: 'grab' },
  { name: 'Whey scoop',                    desc: '', kcal: 120, p: 24, c: 3, f: 2,  time: '16:00', day: 'grab' },
  { name: '2 boiled eggs',                 desc: '', kcal: 140, p: 12, c: 1, f: 10, time: '12:30', day: 'grab' },
  { name: 'Canned tuna',                   desc: '', kcal: 100, p: 22, c: 0, f: 1,  time: '13:00', day: 'grab' },
  { name: 'Cottage cheese (150g)',         desc: '', kcal: 120, p: 17, c: 6, f: 4,  time: '15:00', day: 'grab' },
];

/* ============================================================================
 * GROCERY LIST + SUNDAY BATCH STEPS (Kitchen tab + coach). Edit in code.
 * ==========================================================================*/
const GROCERY_LIST = [
  { cat: 'Protein', items: [
    'Chicken breast or thighs — ~2.5 kg (thighs cheaper; bake 32 min not 28)',
    'Lean ground turkey — ~1.5 kg',
    'Eggs — 2 dozen',
    'Greek yogurt (plain, high-protein) — 2 large tubs',
    'Whey protein — 1 tub',
    'Canned tuna — 4 tins',
    'Cottage cheese — 1 tub',
  ]},
  { cat: 'Carbs', items: [
    'Rice — 2 kg bag',
    'Bananas — 1 bunch',
    'Oats (for protein muffins) — 1 bag',
  ]},
  { cat: 'Veg / Fruit', items: [
    'Mixed roasting veg (peppers, onion, zucchini, broccoli) — ~2 kg',
    'Bagged salad / leafy greens — 2',
    'Fruit for top-ups — apples / berries',
  ]},
  { cat: 'Fats / Extras', items: [
    'Olive oil',
    'Mixed nuts — 1 bag (pre-portion into counted snack bags)',
    'Muffin ingredients (protein powder, oats, baking staples)',
  ]},
];
const GROCERY_BUDGET = '~$150–180/week for both · cheaper levers → ~$130 (thighs, more eggs, tuna, cottage cheese, sales/frozen in bulk).';

const BATCH_STEPS = [
  'Preheat oven to 200°C (400°F). Start the rice cooker now — 4 cups dry rice — so it runs while the oven works.',
  'Chicken: season ~2.5 kg, spread on 2 trays. Bake 28 min (breast) / 32 min (thighs). One tray top rack, one bottom; rotate at 15 min.',
  'While chicken bakes: brown the turkey on the stovetop in 2 batches, breaking it fine. ~10 min/batch until no pink. Salt, set aside.',
  'Roast veg: toss ~2 kg with 1 tbsp oil + salt on a third tray. Goes in when chicken comes out — 20–25 min at 200°C.',
  'Boil eggs in parallel: cover with water, bring to boil, 9 min, then ice bath. Peel a dozen.',
  'Protein muffins (her bake): batch the full tray per your recipe. Cool, store, plate ONE at a time — count each.',
  'Portion by day type: training lunches (250g chicken + 200g rice), rest lunches (220g + 150g), turkey dinners. Label.',
  'Pre-portion nuts into small counted bags so a desk snack is always plated and logged.',
];

/* ============================================================================
 * THE TWO INSTANCE CONFIGS  —  ROYAL WHITE & GOLD
 * accent  = gold (the hero ring); accent2 = the royal secondary (per person,
 * so the two phones never get mixed up). Jean = gold + royal navy,
 * Her = champagne gold + royal plum.
 * dayTypes: getDay() index 0=Sun … 6=Sat → { label, kcal, protein }
 * ==========================================================================*/
const CONFIGS = {
  jean: {
    key: 'jean',
    name: 'Jean',
    accent: '#A8842B',          // antique gold (hero ring)
    accent2: '#1B2A4A',         // royal navy
    estimates: false,           // Jean's numbers are confirmed
    fasting: true,              // eats 12:00–20:00
    eatingWindow: { start: 12, end: 20 },
    waterTargetMl: 3000,
    weighInDay: 0,              // Sunday AM
    goalWeightKg: 115,
    goalDateLabel: 'Sep 8, 2026',
    calorieFloor: 2059,         // masterbrief hard floor
    library: JEAN_LIBRARY,
    // index by getDay(): 0 Sun … 6 Sat  (masterbrief schedule)
    dayTypes: [
      { label: 'Rest · weigh-in',      short: 'Rest',     kcal: 2100, protein: 200, training: false, soccer: false }, // Sun
      { label: 'Training · Kettlebell', short: 'Training', kcal: 2400, protein: 220, training: true,  soccer: false }, // Mon
      { label: 'Training · Conditioning', short: 'Training', kcal: 2400, protein: 220, training: true,  soccer: false }, // Tue
      { label: 'Rest day',             short: 'Rest',     kcal: 2100, protein: 200, training: false, soccer: false }, // Wed
      { label: 'Soccer night',         short: 'Soccer',   kcal: 2500, protein: 220, training: true,  soccer: true  }, // Thu
      { label: 'Training · Upper',     short: 'Training', kcal: 2400, protein: 220, training: true,  soccer: false }, // Fri
      { label: 'Training · Lower',     short: 'Training', kcal: 2400, protein: 220, training: true,  soccer: false }, // Sat
    ],
    deskNibble: true,           // Jean's #1 leak
  },

  gf: {
    key: 'gf',
    name: 'Her',
    accent: '#C2A14D',          // champagne gold
    accent2: '#8E4B63',         // royal plum
    estimates: true,
    fasting: false,
    eatingWindow: null,
    waterTargetMl: 3000,
    weighInDay: 0,
    goalWeightKg: 75,
    goalDateLabel: 'mid-Sept 2026',
    calorieFloor: 1550,
    library: GF_LIBRARY,
    estimateRanges: { kcal: '1,600–1,750', protein: '120–140' },
    dayTypes: Array.from({ length: 7 }, () => ({
      label: 'Daily target', short: 'Daily', kcal: 1650, protein: 130, training: false, soccer: false,
    })),
    deskNibble: false,
  },
};

/* ============================================================================
 * COACH KNOWLEDGE — the offline coach (no API) draws facts from here.
 * Plain text the coach quotes when relevant. Edit freely.
 * ==========================================================================*/
const COACH_FACTS = {
  philosophy: 'Change 2–3 things permanently — never overhaul everything. Adherence beats perfection.',
  deskNibble: 'Nothing at the desk, OR one pre-portioned, plated, COUNTED snack. A "healthy" muffin grazed freely is the same leak — it only helps plated, single, and logged.',
  protein: 'Protein at every meal is priority #1. Hit the number before anything else.',
  liquids: 'No liquid calories — juice, soda, sweetened drinks. No pork. Max one protein shake a day.',
  water: '3 L of water minimum, every day.',
  eatingWindow: 'Eat 12:00–8:00 PM. Rest days (Sun + Wed) same window, less food. Never fast on a training or soccer day.',
  soccer: 'Thursday soccer: recovery overrides the window — shake + banana within 30 min, real meal by ~9 PM.',
  eatingOut: 'Out for a meal: lead with a grilled/baked protein, add one carb, skip the liquid calories and the bread basket. Aim to land near the protein you have left for the day.',
  week2: 'If the scale hasn\'t moved as expected after two clean weeks, trim ~150 kcal — not before. Early scale movement is water, not fat.',
  couple: 'You lead the kitchen — the environment — never her plate. Stock it, cook the batch, eat your portion beside her. You never audit her bites. Her data stays in her tracker.',
};
