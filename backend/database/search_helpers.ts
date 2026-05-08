// ai generated maps - just asked to generate for marketplace app a 
// synonym map and replacement map to replace multi-word phrases until satisfied 

const REPLACEMENT_MAP: Record<string, string> = {
  'mini fridge': 'refrigerator',
  'small fridge': 'refrigerator',
  'smart tv': 'television',
  'desk chair': 'chair',
  'office chair': 'chair',
  'gaming chair': 'chair',
  'side table': 'nightstand',
  'bedside table': 'nightstand',
  'coffee table': 'table',
  'study table': 'desk',
  'study desk': 'desk',
  'book bag': 'backpack',
  'school bag': 'backpack',
  'graphing calculator': 'calculator',
  'desk lamp': 'lamp',
  'floor lamp': 'lamp',
  'table lamp': 'lamp',
  'running shoes': 'sneakers',
  'tennis shoes': 'sneakers',
  'winter coat': 'jacket',
  'computer monitor': 'monitor',
  'wifi router': 'router',
  'power adapter': 'charger',
  'phone charger': 'charger',
  'water bottle': 'bottle',
  'bike helmet': 'helmet',
  'electric scooter': 'scooter',
  'free weights': 'dumbbell',
  'weight set': 'dumbbell',
  'bed frame': 'bed',
  'bedframe': 'bed',
  'desk fan': 'fan',
  'floor fan': 'fan',
  'vacuum cleaner': 'vacuum',
  'shoe rack': 'shelf',
  'book shelf': 'bookshelf',
  'text book': 'textbook',
};

const SYNONYM_MAP: Record<string, string[]> = {
  couch: ['sofa', 'settee', 'loveseat'],
  sofa: ['couch', 'settee', 'loveseat'],
  settee: ['couch', 'sofa'],
  loveseat: ['couch', 'sofa'],

  chair: ['seat', 'stool'],
  stool: ['chair', 'seat'],
  seat: ['chair', 'stool'],

  desk: ['table'],
  table: ['desk'],

  bed: ['mattress'],
  mattress: ['bed'],

  dresser: ['bureau', 'drawers'],
  bureau: ['dresser'],
  drawers: ['dresser'],

  nightstand: ['table'],
  lamp: ['light'],
  light: ['lamp'],

  fridge: ['refrigerator'],
  refrigerator: ['fridge'],

  tv: ['television'],
  television: ['tv'],

  monitor: ['screen', 'display'],
  screen: ['monitor', 'display'],
  display: ['monitor', 'screen'],

  speaker: ['speakers'],
  speakers: ['speaker'],

  headphones: ['headset', 'earphones'],
  headset: ['headphones'],
  earphones: ['headphones'],

  charger: ['adapter'],
  adapter: ['charger'],

  laptop: ['notebook', 'computer'],
  notebook: ['laptop'],
  computer: ['pc', 'desktop', 'laptop'],
  pc: ['computer', 'desktop'],
  desktop: ['computer', 'pc'],

  keyboard: ['keys'],
  mouse: ['computer'],

  printer: ['scanner'],
  scanner: ['printer'],

  router: ['modem'],
  modem: ['router'],

  bike: ['bicycle'],
  bicycle: ['bike'],

  scooter: ['vespa'],
  skateboard: ['longboard'],
  longboard: ['skateboard'],

  helmet: ['protective'],

  backpack: ['bag', 'bookbag'],
  bag: ['backpack'],
  bookbag: ['backpack'],

  suitcase: ['luggage'],
  luggage: ['suitcase'],

  textbook: ['book'],
  book: ['textbook'],

  binder: ['folder'],
  folder: ['binder'],

  calculator: ['graphing'],

  hoodie: ['sweatshirt'],
  sweatshirt: ['hoodie'],

  jacket: ['coat'],
  coat: ['jacket'],

  sneakers: ['shoes'],
  shoes: ['sneakers', 'boots'],
  boots: ['shoes'],

  jeans: ['pants'],
  pants: ['jeans'],

  shirt: ['tshirt', 'tee', 'top'],
  tshirt: ['shirt', 'tee'],
  tee: ['shirt', 'tshirt'],
  top: ['shirt'],

  rug: ['carpet'],
  carpet: ['rug'],

  shelf: ['bookshelf', 'rack'],
  bookshelf: ['shelf'],
  rack: ['shelf'],

  storage: ['bin', 'container'],
  bin: ['storage', 'container'],
  container: ['storage', 'bin'],

  vacuum: ['cleaner'],
  fan: ['cooler'],

  dumbbell: ['weight'],
  weight: ['dumbbell'],
  weights: ['dumbbell'],

  guitar: ['instrument'],
  piano: ['keyboard'],
  keyboardpiano: ['piano'],

  bottle: ['flask'],
};

/* Takes in a search query like word1 word2 and converts
into (word1 | synonym1 | synonym2 ...) & (word2 | synonym1 | ...)
to make it friendly for full text search. Replaces common multi-word
phrases with related word first for better synonym mapping. */
export function expandQuery(query: string) {

    for (const [phrase, replacement] of Object.entries(REPLACEMENT_MAP)) {
        if (query.includes(phrase))
            query = query.replaceAll(phrase, replacement);
    }

    const words = query.split(/\s+/).filter(Boolean);

    const groups = words.map((word) => {
        word = word.replace(/[^\w]/g, '');
        const synonyms = SYNONYM_MAP[word];
        if (!synonyms) return word;
        const wordWithSynonyms = [word, ...synonyms].join(' | ');
        return `(${wordWithSynonyms})`;
    });

    return groups.join(' & ');
}