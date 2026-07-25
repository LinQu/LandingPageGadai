import type { 
  Branch, ItemCategory, ItemBrand, ItemSeries, ItemVariant, ItemStorage, 
  ItemYear, ItemColor, Article, FAQItem, Testimonial, ArchiveItem 
} from './types'

// Branches


// Item Categories
export const itemCategories: ItemCategory[] = [
  { kode: 'HP', name: 'Smartphone', icon: '📱' },
  { kode: 'LAPTOP', name: 'Laptop', icon: '💻' },
]

// Brands per category
export const itemBrands: ItemBrand[] = [
  {
    "id": "4585485",
    "kodekat": "DRONE",
    "name": "DJI"
  },
  {
    "id": "4500272",
    "kodekat": "GO_PRO",
    "name": "GOPRO"
  },
  {
    "id": "4615358",
    "kodekat": "HOME_THEATER",
    "name": "LG"
  },
  {
    "id": "6104305",
    "kodekat": "HOME_THEATER",
    "name": "PANASONIC"
  },
  {
    "id": "4587675",
    "kodekat": "HOME_THEATER",
    "name": "POLYTRON"
  },
  {
    "id": "4596278",
    "kodekat": "HOME_THEATER",
    "name": "SAMSUNG"
  },
  {
    "id": "4587673",
    "kodekat": "HOME_THEATER",
    "name": "SHARP"
  },
  {
    "id": "4587674",
    "kodekat": "HOME_THEATER",
    "name": "SONY"
  },
  {
    "id": "2259928",
    "kodekat": "HP",
    "name": "ADVAN"
  },
  {
    "id": "2259918",
    "kodekat": "HP",
    "name": "APPLE"
  },
  {
    "id": "2259920",
    "kodekat": "HP",
    "name": "ASUS"
  },
  {
    "id": "2259930"   ,
    "kodekat": "HP",
    "name": "COOLPAD"
  },
  {
    "id": "14461468",
    "kodekat": "HP",
    "name": "GOOGLE"
  },
  {
    "id": "10385152",
    "kodekat": "HP",
    "name": "HONOR"
  },
  {
    "id": "4588320",
    "kodekat": "HP",
    "name": "HUAWEI"
  },
  {
    "id": "3539944" ,
    "kodekat": "HP",
    "name": "INFINIX"
  },
  {
    "id": "6104302" ,
    "kodekat": "HP",
    "name": "ITEL"
  },
  {
    "id": "2259922"   ,
    "kodekat": "HP",
    "name": "LENOVO"
  },
  {
    "id": "2259934",
    "kodekat": "HP",
    "name": "MOTOROLA"
  },
  {
    "id": "16262453"      ,
    "kodekat": "HP",
    "name": "NUBIA"
  },
  {
    "id": "2259924",
    "kodekat": "HP",
    "name": "OPPO"
  },
  {
    "id": "4587676",
    "kodekat": "HP",
    "name": "POCO"
  },
  {
    "id": "4567352",
    "kodekat": "HP",
    "name": "REALME"
  },
  {
    "id": "2259914",
    "kodekat": "HP",
    "name": "SAMSUNG"
  },
  {
    "id": "2259926",
    "kodekat": "HP",
    "name": "SONY"
  },
  {
    "id": "6104301",
    "kodekat": "HP",
    "name": "TECNOMOBILE"
  },
  {
    "id": "2259932",
    "kodekat": "HP",
    "name": "VIVO"
  },
  {
    "id": "2259916",
    "kodekat": "HP",
    "name": "XIAOMI"
  },
  {
    "id": "2259938",
    "kodekat": "KAMERA",
    "name": "CANON"
  },
  {
    "id": "6511831",
    "kodekat": "KAMERA",
    "name": "CASIO"
  },
  {
    "id": "2259942",
    "kodekat": "KAMERA",
    "name": "FUJIFILM"
  },
  {
    "id": "6203162",
    "kodekat": "KAMERA",
    "name": "GOPRO"
  },
  {
    "id": "16261415",
    "kodekat": "KAMERA",
    "name": "INSTA360"
  },
  {
    "id": "2259936",
    "kodekat": "KAMERA",
    "name": "NIKON"
  },
  {
    "id": "4471643",
    "kodekat": "KAMERA",
    "name": "PANASONIC"
  },
  {
    "id": "2259940",
    "kodekat": "KAMERA",
    "name": "PENTAX"
  },
  {
    "id": "2259944",
    "kodekat": "KAMERA",
    "name": "SONY"
  },
  {
    "id": "2259946",
    "kodekat": "LAPTOP",
    "name": "ACER"
  },
  {
    "id": "7007071",
    "kodekat": "LAPTOP",
    "name": "ADVAN"
  },
  {
    "id": "2259960",
    "kodekat": "LAPTOP",
    "name": "APPLE"
  },
  {
    "id": "2259950",
    "kodekat": "LAPTOP",
    "name": "ASUS"
  },
  {
    "id": "4018272",
    "kodekat": "LAPTOP",
    "name": "AXIOO"
  },
  {
    "id": "4414399",
    "kodekat": "LAPTOP",
    "name": "CHROMEBOOK"
  },
  {
    "id": "4414403",
    "kodekat": "LAPTOP",
    "name": "COMPAQ"
  },
  {
    "id": "16628413",
    "kodekat": "LAPTOP",
    "name": "DAC"
  },
  {
    "id": "2259956",
    "kodekat": "LAPTOP",
    "name": "DELL"
  },
  {
    "id": "2259952",
    "kodekat": "LAPTOP",
    "name": "HP"
  },
  {
    "id": "6104309",
    "kodekat": "LAPTOP",
    "name": "HUAWEI"
  },
  {
    "id": "4414401",
    "kodekat": "LAPTOP",
    "name": "INFINIX"
  },
  {
    "id": "2259958",
    "kodekat": "LAPTOP",
    "name": "LENOVO"
  },
  {
    "id": "12555436",
    "kodekat": "LAPTOP",
    "name": "MICROSOFT"
  },
  {
    "id": "2259964",
    "kodekat": "LAPTOP",
    "name": "MSI"
  },
  {
    "id": "15636011",
    "kodekat": "LAPTOP",
    "name": "REALME"
  },
  {
    "id": "4596452",
    "kodekat": "LAPTOP",
    "name": "REDMI"
  },
  {
    "id": "2259948",
    "kodekat": "LAPTOP",
    "name": "SAMSUNG"
  },
  {
    "id": "2259954",
    "kodekat": "LAPTOP",
    "name": "SONY"
  },
  {
    "id": "16260025",
    "kodekat": "LAPTOP",
    "name": "SPC"
  },
  {
    "id": "16688064",
    "kodekat": "LAPTOP",
    "name": "TECNO"
  },
  {
    "id": "11728648",
    "kodekat": "LAPTOP",
    "name": "TIMI"
  },
  {
    "id": "2259962",
    "kodekat": "LAPTOP",
    "name": "TOSHIBA"
  },
  {
    "id": "4122366",
    "kodekat": "LAPTOP",
    "name": "XIAOMI"
  },
  {
    "id": "6104307",
    "kodekat": "PROYEKTOR",
    "name": "ACER"
  },
  {
    "id": "6104306",
    "kodekat": "PROYEKTOR",
    "name": "BENQ"
  },
  {
    "id": "4500254",
    "kodekat": "PROYEKTOR",
    "name": "EPSON"
  },
  {
    "id": "10347037",
    "kodekat": "PROYEKTOR",
    "name": "INFOCUS"
  },
  {
    "id": "16245530",
    "kodekat": "PROYEKTOR",
    "name": "MICROVISION"
  },
  {
    "id": "16686619",
    "kodekat": "PROYEKTOR",
    "name": "OPTOMA"
  },
  {
    "id": "16686618",
    "kodekat": "PROYEKTOR",
    "name": "POLYTRON"
  },
  {
    "id": "6104308",
    "kodekat": "PROYEKTOR",
    "name": "SONNY"
  },
  {
    "id": "15426186",
    "kodekat": "PROYEKTOR",
    "name": "SPC"
  },
  {
    "id": "15686233",
    "kodekat": "PROYEKTOR",
    "name": "VIEWSONIC"
  },
  {
    "id": "16688954",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ACS"
  },
  {
    "id": "11429429",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ADVANCE"
  },
  {
    "id": "16688214",
    "kodekat": "SPEAKER_AKTIF",
    "name": "AD_SYSTEMS"
  },
  {
    "id": "16688211",
    "kodekat": "SPEAKER_AKTIF",
    "name": "AKATRON"
  },
  {
    "id": "16688212",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ALS_PRO"
  },
  {
    "id": "16628098",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ASATRON"
  },
  {
    "id": "16688213",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ASHLEY"
  },
  {
    "id": "16654764"  ,
    "kodekat": "SPEAKER_AKTIF",
    "name": "AUBERN"
  },
  {
    "id": "16688417",
    "kodekat": "SPEAKER_AKTIF",
    "name": "AUDIOCORE"
  },
  {
    "id": "16688416",
    "kodekat": "SPEAKER_AKTIF",
    "name": "AUDIOSEVEN"
  },
  {
    "id": "16688415"  ,
    "kodekat": "SPEAKER_AKTIF",
    "name": "AUDIOVOICE"
  },
  {
    "id": "16622645",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BARETONE"
  },
  {
    "id": "15827279",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BIGBAND"
  },
  {
    "id": "16688229",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BLACK_SPIDER"
  },
  {
    "id": "10611059",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BMB"
  },
  {
    "id": "16688418",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BOB"
  },
  {
    "id": "16688955",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BODUM"
  },
  {
    "id": "16260980",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BOSE"
  },
  {
    "id": "16688956",
    "kodekat": "SPEAKER_AKTIF",
    "name": "BRODU"
  },
  {
    "id": "10611058",
    "kodekat": "SPEAKER_AKTIF",
    "name": "CRIMSON"
  },
  {
    "id": "6511847",
    "kodekat": "SPEAKER_AKTIF",
    "name": "DAT"
  },
  {
    "id": "16688230",
    "kodekat": "SPEAKER_AKTIF",
    "name": "DBVOICE"
  },
  {
    "id": "6511850",
    "kodekat": "SPEAKER_AKTIF",
    "name": "DIOBA"
  },
  {
    "id": "16688232",
    "kodekat": "SPEAKER_AKTIF",
    "name": "EGGEL"
  },
  {
    "id": "6511846",
    "kodekat": "SPEAKER_AKTIF",
    "name": "GMC"
  },
  {
    "id": "16688957",
    "kodekat": "SPEAKER_AKTIF",
    "name": "GRANDSONIC"
  },
  {
    "id": "16688238",
    "kodekat": "SPEAKER_AKTIF",
    "name": "G_POWER"
  },
  {
    "id": "16226259",
    "kodekat": "SPEAKER_AKTIF",
    "name": "HARDWELL"
  },
  {
    "id": "6104304",
    "kodekat": "SPEAKER_AKTIF",
    "name": "HARMAN/KARDON"
  },
  {
    "id": "15748402",
    "kodekat": "SPEAKER_AKTIF",
    "name": "HUPER"
  },
  {
    "id": "16688233",
    "kodekat": "SPEAKER_AKTIF",
    "name": "IKEDO"
  },
  {
    "id": "15865191",
    "kodekat": "SPEAKER_AKTIF",
    "name": "JBL"
  },
  {
    "id": "16688234",
    "kodekat": "SPEAKER_AKTIF",
    "name": "JK _COUSTIC"
  },
  {
    "id": "12555435",
    "kodekat": "SPEAKER_AKTIF",
    "name": "KINGMAX"
  },
  {
    "id": "4588446",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LAGAWE"
  },
  {
    "id": "16688958",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LAWEGA"
  },
  {
    "id": "16688236",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LENYES"
  },
  {
    "id": "16260912",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LG"
  },
  {
    "id": "16688237",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LOGITECH"
  },
  {
    "id": "16688239",
    "kodekat": "SPEAKER_AKTIF",
    "name": "LUXY"
  },
  {
    "id": "16688240",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MAIKET"
  },
  {
    "id": "16688419",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MARLEY"
  },
  {
    "id": "15893084",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MARSHALL"
  },
  {
    "id": "15865193",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MINAMI"
  },
  {
    "id": "16688420",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MINICON"
  },
  {
    "id": "16688241",
    "kodekat": "SPEAKER_AKTIF",
    "name": "MORPHY"
  },
  {
    "id": "16260283",
    "kodekat": "SPEAKER_AKTIF",
    "name": "NEX"
  },
  {
    "id": "16226258",
    "kodekat": "SPEAKER_AKTIF",
    "name": "NICO"
  },
  {
    "id": "16688243",
    "kodekat": "SPEAKER_AKTIF",
    "name": "NIKO_WTBU"
  },
  {
    "id": "16688421",
    "kodekat": "SPEAKER_AKTIF",
    "name": "NOISE"
  },
  {
    "id": "16688422",
    "kodekat": "SPEAKER_AKTIF",
    "name": "OPTIMA"
  },
  {
    "id": "16625004",
    "kodekat": "SPEAKER_AKTIF",
    "name": "PATHFINDER"
  },
  {
    "id": "16237369",
    "kodekat": "SPEAKER_AKTIF",
    "name": "PEAVEY"
  },
  {
    "id": "16688246",
    "kodekat": "SPEAKER_AKTIF",
    "name": "PHILIPS"
  },
  {
    "id": "16688959",
    "kodekat": "SPEAKER_AKTIF",
    "name": "PIONEER"
  },
  {
    "id": "4588444",
    "kodekat": "SPEAKER_AKTIF",
    "name": "POLYTRON"
  },
  {
    "id": "16688235",
    "kodekat": "SPEAKER_AKTIF",
    "name": "ROADMASTER"
  },
  {
    "id": "6104303",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SAMSUNG"
  },
  {
    "id": "16688247",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SANKEN"
  },
  {
    "id": "4588445",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SHARP"
  },
  {
    "id": "16688248",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SIMBADDA"
  },
  {
    "id": "16689723",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SONY"
  },
  {
    "id": "16237805",
    "kodekat": "SPEAKER_AKTIF",
    "name": "SOUNDBEST"
  },
  {
    "id": "16688231",
    "kodekat": "SPEAKER_AKTIF",
    "name": "TANAKA"
  },
  {
    "id": "16688249",
    "kodekat": "SPEAKER_AKTIF",
    "name": "TCL"
  },
  {
    "id": "16688423",
    "kodekat": "SPEAKER_AKTIF",
    "name": "UE"
  },
  {
    "id": "16688424",
    "kodekat": "SPEAKER_AKTIF",
    "name": "VENOM"
  },
  {
    "id": "16688244",
    "kodekat": "SPEAKER_AKTIF",
    "name": "VOX_PATHFINDER"
  },
  {
    "id": "16688953",
    "kodekat": "SPEAKER_AKTIF",
    "name": "XIAOMI"
  },
  {
    "id": "4588447",
    "kodekat": "SUBWOOFER",
    "name": "POLYTRON"
  },
  {
    "id": "14461486",
    "kodekat": "TV_FLAT",
    "name": "ADVAN"
  },
  {
    "id": "9927993",
    "kodekat": "TV_FLAT",
    "name": "ADVANCE"
  },
  {
    "id": "4075770",
    "kodekat": "TV_FLAT",
    "name": "AKARI"
  },
  {
    "id": "6510962",
    "kodekat": "TV_FLAT",
    "name": "AQUA"
  },
  {
    "id": "3539946",
    "kodekat": "TV_FLAT",
    "name": "CHANGHONG"
  },
  {
    "id": "4471694",
    "kodekat": "TV_FLAT",
    "name": "COOCAA"
  },
  {
    "id": "4587398",
    "kodekat": "TV_FLAT",
    "name": "HISENSE"
  },
  {
    "id": "16687077",
    "kodekat": "TV_FLAT",
    "name": "IFFALCON"
  },
  {
    "id": "2259974",
    "kodekat": "TV_FLAT",
    "name": "LG"
  },
  {
    "id": "2259976",
    "kodekat": "TV_FLAT",
    "name": "PANASONIC"
  },
  {
    "id": "5811708",
    "kodekat": "TV_FLAT",
    "name": "PHILIPS"
  },
  {
    "id": "2259978",
    "kodekat": "TV_FLAT",
    "name": "POLYTRON"
  },
  {
    "id": "4122370",
    "kodekat": "TV_FLAT",
    "name": "REALME"
  },
  {
    "id": "2259966",
    "kodekat": "TV_FLAT",
    "name": "SAMSUNG"
  },
  {
    "id": "16629231",
    "kodekat": "TV_FLAT",
    "name": "SANKEN"
  },
  {
    "id": "2259972",
    "kodekat": "TV_FLAT",
    "name": "SHARP"
  },
  {
    "id": "2259968",
    "kodekat": "TV_FLAT",
    "name": "SONY"
  },
  {
    "id": "4050484",
    "kodekat": "TV_FLAT",
    "name": "TCL"
  },
  {
    "id": "2259970",
    "kodekat": "TV_FLAT",
    "name": "TOSHIBA"
  },
  {
    "id": "4122368",
    "kodekat": "TV_FLAT",
    "name": "XIAOMI"
  }
]

// Series per brand
export const itemSeries: ItemSeries[] = [
  // iPhone
  { id: '1', brandId: '1', name: 'iPhone 15' },
  { id: '2', brandId: '1', name: 'iPhone 14' },
  { id: '3', brandId: '1', name: 'iPhone 13' },
  // Samsung
  { id: '4', brandId: '2', name: 'Galaxy S24' },
  { id: '5', brandId: '2', name: 'Galaxy S23' },
  { id: '6', brandId: '2', name: 'Galaxy A54' },
  // Xiaomi
  { id: '7', brandId: '3', name: '14' },
  { id: '8', brandId: '3', name: '13T' },
  // MacBook
  { id: '9', brandId: '6', name: 'MacBook Pro 16"' },
  { id: '10', brandId: '6', name: 'MacBook Air 15"' },
  { id: '11', brandId: '6', name: 'MacBook Pro 14"' },

]

// Variants per series
export const itemVariants: ItemVariant[] = [
  // iPhone 15
  { id: '1', seriesId: '1', name: 'Pro Max' },
  { id: '2', seriesId: '1', name: 'Pro' },
  { id: '3', seriesId: '1', name: 'Standard' },
  // iPhone 14
  { id: '4', seriesId: '2', name: 'Pro Max' },
  { id: '5', seriesId: '2', name: 'Pro' },
  // Galaxy S24
  { id: '6', seriesId: '4', name: 'Ultra' },
  { id: '7', seriesId: '4', name: 'Plus' },
  // MacBook Pro 16"
  { id: '8', seriesId: '9', name: 'M4' },
  { id: '9', seriesId: '9', name: 'M3' },
  // Honda PCX
  { id: '10', seriesId: '14', name: '160' },
  { id: '11', seriesId: '14', name: '150' },
]

// Storage options per variant
export const itemStorages: ItemStorage[] = [
  // iPhone 15
  { id: '1', variantId: '1', name: '256GB' },
  { id: '2', variantId: '1', name: '512GB' },
  { id: '3', variantId: '1', name: '1TB' },
  // Galaxy S24
  { id: '4', variantId: '6', name: '256GB' },
  { id: '5', variantId: '6', name: '512GB' },
  // MacBook Pro 16"
  { id: '6', variantId: '8', name: '512GB' },
  { id: '7', variantId: '8', name: '1TB' },
]

// Years
export const itemYears: ItemYear[] = [
  { id: '1', storageId: '1', year: 2024 },
  { id: '2', storageId: '1', year: 2023 },
  { id: '3', storageId: '1', year: 2022 },
  { id: '4', storageId: '4', year: 2024 },
  { id: '5', storageId: '4', year: 2023 },
  { id: '6', storageId: '6', year: 2024 },
  { id: '7', storageId: '6', year: 2023 },
]

// Colors with valuations
export const itemColors: ItemColor[] = [
  // iPhone 15 256GB 2024
  { id: '1', yearId: '1', name: 'Midnight Black', valuation: 9500000 },
  { id: '2', yearId: '1', name: 'Starlight', valuation: 9500000 },
  { id: '3', yearId: '1', name: 'Blue', valuation: 9400000 },
  { id: '4', yearId: '1', name: 'Red', valuation: 9400000 },
  // iPhone 15 256GB 2023
  { id: '5', yearId: '2', name: 'Midnight Black', valuation: 8200000 },
  { id: '6', yearId: '2', name: 'Starlight', valuation: 8200000 },
  { id: '7', yearId: '2', name: 'Blue', valuation: 8100000 },
  // Galaxy S24 Ultra 256GB 2024
  { id: '8', yearId: '4', name: 'Onyx Black', valuation: 10500000 },
  { id: '9', yearId: '4', name: 'Titanium Gray', valuation: 10500000 },
  { id: '10', yearId: '4', name: 'Titanium Gold', valuation: 10400000 },
  // MacBook Pro 16" M4 512GB 2024
  { id: '11', yearId: '6', name: 'Space Black', valuation: 18000000 },
  { id: '12', yearId: '6', name: 'Silver', valuation: 17500000 },
]

// Articles
export const articles: Article[] = [
  {
    id: '1',
    title: '5 Tips Aman Saat Gadai Elektronik Anda',
    slug: '5-tips-aman-gadai-elektronik',
    description: 'Panduan lengkap untuk memastikan proses gadai yang aman dan menguntungkan.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600',
    author: 'Tim Gadai Sakti',
    publishedAt: new Date('2024-01-15'),
    category: 'Tips & Trik',
    readTime: 5,
  },
  {
    id: '2',
    title: 'Berapa Maksimal Taksiran untuk Smartphone Flagship?',
    slug: 'taksiran-smartphone-flagship',
    description: 'Informasi terbaru tentang harga taksiran untuk smartphone premium tahun 2024.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=600',
    author: 'Tim Gadai Sakti',
    publishedAt: new Date('2024-01-10'),
    category: 'Informasi Harga',
    readTime: 4,
  },
  {
    id: '3',
    title: 'Proses Gadai Motor di Gadai Sakti Sangat Cepat',
    slug: 'proses-gadai-motor-cepat',
    description: 'Tidak perlu dokumen lengkap, cukup STNK dan KTP, proses hanya 30 menit.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    author: 'Tim Gadai Sakti',
    publishedAt: new Date('2024-01-05'),
    category: 'Produk',
    readTime: 3,
  },
]

// FAQ
export const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'Berapa lama proses gadai di Gadai Sakti?',
    answer: 'Proses gadai di Gadai Sakti sangat cepat, hanya membutuhkan waktu 15-30 menit dari awal hingga selesai. Kami berkomitmen memberikan layanan tercepat di industri gadai.',
  },
  {
    id: '2',
    question: 'Apa saja persyaratan untuk gadai barang?',
    answer: 'Persyaratan minimal: KTP asli, KPLG (untuk motor), dan barang yang akan digadai. Untuk smartphone dan laptop, tidak perlu kertas-kertas tambahan, cukup KTP saja.',
  },
  {
    id: '3',
    question: 'Apakah barang saya diasuransikan?',
    answer: 'Ya, semua barang yang digadai di Gadai Sakti diasuransikan penuh tanpa biaya tambahan. Anda tidak perlu khawatir jika terjadi sesuatu pada barang Anda.',
  },
  {
    id: '4',
    question: 'Berapa persen maksimal taksiran nilai barang?',
    answer: 'Kami memberikan taksiran hingga 90% dari nilai pasaran barang Anda. Taksiran ditentukan berdasarkan kondisi, spesifikasi, dan umur barang.',
  },
  {
    id: '5',
    question: 'Bagaimana cara menebus barang yang sudah digadai?',
    answer: 'Anda dapat menebus barang dengan membayar pinjaman pokok plus bunga sesuai waktu gadai. Bunga dihitung per bulan, dan Anda bisa melunasi kapan saja tanpa penalti.',
  },
  {
    id: '6',
    question: 'Apakah ada biaya tambahan selain bunga?',
    answer: 'Tidak ada biaya tersembunyi. Biaya yang anda bayar hanya bunga gadai sesuai perhitungan. Semua biaya asuransi dan administrasi sudah kami tanggung.',
  },
]

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    role: 'Pengusaha Muda',
    content: 'Gadai Sakti benar-benar membantu saya ketika butuh dana cepat. Prosesnya sangat transparan dan taksiran yang diberikan sangat adil.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    role: 'Ibu Rumah Tangga',
    content: 'Layanan pelanggan Gadai Sakti sangat baik. Mereka memberikan penjelasan yang jelas dan tidak ada biaya tersembunyi. Sangat merekomendasikan!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '3',
    name: 'Ahmad Wijaya',
    role: 'Profesional',
    content: 'Taksiran yang diberikan sesuai dengan ekspektasi saya. Proses gadai motor saya hanya 20 menit. Terima kasih Gadai Sakti!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: '4',
    name: 'Rini Kuswati',
    role: 'Freelancer',
    content: 'Sangat puas dengan pelayanan mereka. Yang terbaik adalah mereka benar-benar mengerti kondisi barang dan memberikan harga yang kompetitif.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
  {
    id: '5',
    name: 'Rachmat Fajar',
    role: 'Entrepreneur',
    content: 'Gadai Sakti membantu saya mendapatkan dana cepat untuk modal usaha. Prosesnya mudah dan cepat, serta stafnya sangat ramah dan profesional.',
    rating: 4 ,
    image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150',
  }
]

// Archive (sample booking history)
export const archiveItems: ArchiveItem[] = [
  {
    id: '1',
    bookingNumber: 'GS-2024-001234',
    itemName: 'iPhone 15 Pro Max 256GB Midnight Black',
    valuation: 9500000,
    bookingDate: new Date('2024-01-15'),
    status: 'active',
  },
  {
    id: '2',
    bookingNumber: 'GS-2024-001233',
    itemName: 'MacBook Pro 16" M4 512GB Space Black',
    valuation: 18000000,
    bookingDate: new Date('2024-01-10'),
    status: 'redeemed',
  },
  {
    id: '3',
    bookingNumber: 'GS-2024-001232',
    itemName: 'Honda PCX 160cc 2024 Hitam',
    valuation: 12000000,
    bookingDate: new Date('2024-01-05'),
    status: 'active',
  },
]
