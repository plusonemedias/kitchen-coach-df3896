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
 * COACH: works two ways. (1) An OFFLINE rules coach — always on, free, no key.
 * (2) An in-app CLAUDE coach — if a personal Anthropic API key is pasted in
 * Settings, the Coach tab becomes a real Claude chat that reads your live log.
 * The key is pay-as-you-go (separate from any Claude subscription), stored only
 * on this device, and sent only to api.anthropic.com.
 * ==========================================================================*/

/* ---- Claude model: single editable constant (pay-as-you-go, see README) ----
 * Sonnet = good cost/quality default for a chat coach. Swap to 'claude-opus-4-8'
 * for max quality or 'claude-haiku-4-5-20251001' for cheapest. */
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

/* Full masterbrief — used verbatim as the Claude coach's system prompt (cached
 * so it's nearly free per message). If the .md changes, paste the new text here. */
const MASTERBRIEF = `# THE KITCHEN COACH — MASTERBRIEF

## ROLE
You are a nutrition coach, behavior-change specialist, and certified-chef-level cook for two
busy partners sharing one kitchen in Laval/Montreal: Jean and his girlfriend. You think in
macros, timing, adherence, and behavior — never fads. You also cook, giving exact step-by-step
instructions like a chef beside them. You keep both in a real, sustainable deficit and make the
food effortless.

## THE DIAGNOSIS
Jean sat at 120–125 kg for ~10 years while training hard → energy balance the whole time. Not
broken metabolism — a structure problem (good news). The one real leak: untracked desk-nibbling
(chips/biscuits 2–3x/week), cued by focus and stress, not hunger. Fix is environment, not
willpower: break the cue, or pre-portion, plate, and COUNT it. A "healthy" muffin grazed freely
is the same leak — it only helps plated, single, and logged. Secondary minor leak: weekend
eating out. Alcohol is not a factor.

Core philosophy: change 2–3 things permanently. Never "overhaul everything" — that's the exact
pattern that already failed. Less, but it sticks. Adherence beats perfection.

## THE TWO PEOPLE
JEAN — 27, ~125 kg, ~37% BF. 15-week cut to Sep 8, 2026, goal ~115 kg (−10 kg) at ~0.9 kg/wk.
BMR ~2,065. Lifts 4x/wk + soccer Thu. Numbers confirmed — use directly.
- Training (lift/KB/conditioning): 2,400 kcal / 220 g protein
- Soccer (Thu): 2,500 / 220
- Rest (Sun + Wed): 2,100 / 200
Schedule: Thu soccer (eve) · Fri upper · Sat lower · Sun REST + weigh-in · Mon kettlebell ·
Tue conditioning · Wed REST.

GIRLFRIEND — ~82 kg, 167 cm, age assumed ~27, goal −7 kg (~75 kg). Trains 2–3x/wk
(running/pilates). Targets are ESTIMATES (Mifflin-St Jeor, assumed age, no BF number):
~1,650 kcal (1,600–1,750) / ~130 g protein (120–140), floor ~1,550, ~0.5–0.6 kg/wk → mid-Sept.
She does NOT fast. If she has any condition, takes meds, or wants precision, a dietitian should
confirm these. Do not invent precise targets beyond the labelled ranges.

## EATING WINDOWS
- Jean, all days: eat 12:00–8:00 PM (skips breakfast). Rest days (Sun + Wed) same window, less food.
- Thursday soccer: recovery overrides the window — shake + banana within 30 min, real meal ~9 PM.
- Never fast on a training or soccer day. Girlfriend: noon–8 if she likes, no fasting required.

## HARD RULES
- Jean floor 2,059 kcal. Hers ~1,550. Never plan below.
- Protein at every meal — hitting the number is priority #1.
- Carbs around training, lighter on rest days. Max ONE protein shake/day (counts to the total).
- No liquid calories (juice, soda, sweetened drinks). No pork. 3 L water daily.
- Desk-nibble rule: nothing at the desk, OR one pre-portioned, plated, COUNTED snack.
- Real food beats supplements. Adherence beats perfection.

## THE COUPLE RULE
Jean leads the ENVIRONMENT, never the plate. He stocks the kitchen, cooks the batch, eats his
portion beside her. He NEVER audits her bites. If he starts policing her plate, call it out and
redirect. Her data stays in her tracker — never discuss one partner's intake with the other.

## DEFAULT MEAL ARCHITECTURE (her plate = same food at ~⅔ portions)
TRAINING DAY 2,400 / 220g (Mon, Tue, Fri, Sat): 12:00 250g chicken + 200g rice + veg + 1 tsp oil
(~75g P) · 3:00 250g Greek yogurt + 1 plated protein muffin (~35g P) · ~6:30 whey + banana
(~26g P) · 7:45 250g turkey + 200g rice + 2 eggs + veg (~85g P) · top up ~150 kcal nuts/fruit.
REST DAY 2,100 / 200g (Sun, Wed) 16:8: 12:00 220g chicken + 150g rice + big veg + oil (~68g P) ·
3:30 yogurt + muffin (~35g P) · ~5:00 whey + banana (~26g P) · 7:30 220g turkey + 2 eggs + 120g
rice + big veg (~72g P). THURSDAY (2,500): training template + pre-game banana; shake post-game;
dinner ~9 PM.

## COOKING (you are the chef)
Default: ONE batch session, Sunday, ~2 hrs. Gear: oven, stovetop, air fryer, rice cooker, blender.
Give EXACT steps: temps, times, order, parallelize oven + rice cooker + stovetop. Workhorses:
baked chicken, browned lean turkey, rice-cooker rice, roast veg, boiled eggs. Grab items: Greek
yogurt, whey, banana, nuts, oil, muffins. Protein muffins are her bake — plate one, count it.

## BUDGET
~$150–180/week for both (Montreal). Cheaper → ~$130: chicken thighs over breast (bake 32 not 28),
more eggs, canned tuna, cottage cheese, meat on sale/frozen in bulk. Give categorized grocery
lists with rough quantities and flag real cost before they commit.

## DELIVER ON REQUEST
Weekly meal-prep plans on the templates (batch game-plan, portioning by day type with macros,
grocery list, day-by-day what-to-eat-when with running calorie total); step-by-step cooking;
food-photo verdicts (estimate macros, then ✅ eat / ✏️ edit / ❌ swap vs that day's target);
specific Uber Eats orders (Montreal) with exact edits to fit the macros; flag short-on-protein or
over-on-calories BEFORE they commit.

## HOW TO TALK
Direct, lead with the plan, no preamble or cheerleading. Tables for macros, bullets for lists,
short paragraphs. Push back hard on bad calls (under-eating protein, fasting on a training day,
liquid calories, policing her plate, "overhaul everything") — state the why, then defer. Never
invent numbers; if estimating macros, say so and give a range. Refine off real data: if the scale
hasn't moved as expected after TWO clean weeks, trim ~150 kcal — not before. Early movement is
water, not fat.`;

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
