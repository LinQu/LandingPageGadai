export type SimulationCategoryKey = 'HP' | 'LAPTOP'

export interface SimulationSpecOption {
  id: string
  label: string
  minValuation: number
  maxValuation: number
  apiCode?: string
  note?: string
}

export interface SimulationItemOption {
  id: string
  category: SimulationCategoryKey
  name: string
  aliases: string[]
  summary: string
  specs: SimulationSpecOption[]
}

export const SIMULATION_CATEGORIES = [
  {
    kode: 'HP' as const,
    name: 'HP',
    icon: '📱',
    description: 'Smartphone populer yang paling sering digadai',
  },
  {
    kode: 'LAPTOP' as const,
    name: 'Laptop',
    icon: '💻',
    description: 'Laptop kerja, kuliah, dan gaming ringan',
  },
] as const

export const SIMULATION_CATALOG: Record<SimulationCategoryKey, SimulationItemOption[]> = {
  HP: [
    {
      id: 'iphone-11',
      category: 'HP',
      name: 'iPhone 11',
      aliases: ['iphone 11', 'iphone11', '11'],
      summary: 'Unit aman, banyak dicari, dan cepat cair.',
      specs: [
        { id: 'iphone-11-64-ibox', label: 'IBOX 64GB', minValuation: 2200000, maxValuation: 2500000 },
        { id: 'iphone-11-128-ibox', label: 'IBOX 128GB', minValuation: 2500000, maxValuation: 2851000, apiCode: 'IP_11_128GB_IBOX' },
        { id: 'iphone-11-256-ibox', label: 'IBOX 256GB', minValuation: 2800000, maxValuation: 3150000 },
        { id: 'iphone-11-64-inter', label: 'INTER 64GB', minValuation: 2100000, maxValuation: 2400000 },
        { id: 'iphone-11-128-inter', label: 'INTER 128GB', minValuation: 2400000, maxValuation: 2750000 },
        { id: 'iphone-11-256-inter', label: 'INTER 256GB', minValuation: 2700000, maxValuation: 3050000 },

      ],
    },
    {
      id: 'iphone-11-pro',
      category: 'HP',
      name: 'iPhone 11 Pro',
      aliases: ['iphone 11 pro', '11 pro'],
      summary: 'Seri premium dengan permintaan stabil di pasar gadai.',
      specs: [
        { id: 'iphone-11-pro-64', label: '64GB', minValuation: 3200000, maxValuation: 3550000 },
        { id: 'iphone-11-pro-256', label: '256GB', minValuation: 3500000, maxValuation: 3850000 },
      ],
    },
    {
      id: 'iphone-11-pro-max',
      category: 'HP',
      name: 'iPhone 11 Pro Max',
      aliases: ['iphone 11 pro max', '11 pro max'],
      summary: 'Ukuran besar, diminati, dan harganya relatif kuat.',
      specs: [
        { id: 'iphone-11-pro-max-64', label: '64GB', minValuation: 3600000, maxValuation: 4000000 },
        { id: 'iphone-11-pro-max-256', label: '256GB', minValuation: 4000000, maxValuation: 4450000 },
      ],
    },
    {
      id: 'iphone-13',
      category: 'HP',
      name: 'iPhone 13',
      aliases: ['iphone 13', '13'],
      summary: 'Model populer dengan nilai jaminan yang masih tinggi.',
      specs: [
        { id: 'iphone-13-128', label: '128GB', minValuation: 4800000, maxValuation: 5250000 },
        { id: 'iphone-13-256', label: '256GB', minValuation: 5200000, maxValuation: 5650000 },
      ],
    },
    {
      id: 'samsung-s21-fe',
      category: 'HP',
      name: 'Samsung S21 FE',
      aliases: ['s21 fe', 'samsung s21 fe', 'samsung fe'],
      summary: 'Flagship value yang masih banyak dipakai.',
      specs: [
        { id: 's21-fe-128', label: '128GB', minValuation: 2500000, maxValuation: 2900000 },
        { id: 's21-fe-256', label: '256GB', minValuation: 2850000, maxValuation: 3250000 },
      ],
    },
    {
      id: 'redmi-note-12',
      category: 'HP',
      name: 'Redmi Note 12',
      aliases: ['redmi note 12', 'note 12'],
      summary: 'Cepat laku dan cocok untuk simulasi gadget kelas menengah.',
      specs: [
        { id: 'redmi-note-12-128', label: '128GB', minValuation: 1200000, maxValuation: 1450000 },
        { id: 'redmi-note-12-256', label: '256GB', minValuation: 1400000, maxValuation: 1650000 },
      ],
    },
  ],
  LAPTOP: [
    {
      id: 'macbook-air-m1',
      category: 'LAPTOP',
      name: 'MacBook Air M1',
      aliases: ['macbook air m1', 'mba m1', 'air m1'],
      summary: 'Laris untuk kantor dan mahasiswa, nilai jual stabil.',
      specs: [
        { id: 'mba-m1-256', label: '256GB', minValuation: 6500000, maxValuation: 7200000 },
        { id: 'mba-m1-512', label: '512GB', minValuation: 7800000, maxValuation: 8500000 },
      ],
    },
    {
      id: 'macbook-pro-m1',
      category: 'LAPTOP',
      name: 'MacBook Pro M1',
      aliases: ['macbook pro m1', 'mbp m1', 'pro m1'],
      summary: 'Seri kerja yang aman untuk dijadikan agunan.',
      specs: [
        { id: 'mbp-m1-256', label: '256GB', minValuation: 8200000, maxValuation: 9000000 },
        { id: 'mbp-m1-512', label: '512GB', minValuation: 9300000, maxValuation: 10100000 },
      ],
    },
    {
      id: 'asus-vivobook-14',
      category: 'LAPTOP',
      name: 'Asus VivoBook 14',
      aliases: ['asus vivobook 14', 'vivobook 14'],
      summary: 'Banyak dicari untuk kuliah dan kerja harian.',
      specs: [
        { id: 'vivobook-8-512', label: '8GB / 512GB', minValuation: 3200000, maxValuation: 3900000 },
        { id: 'vivobook-16-512', label: '16GB / 512GB', minValuation: 3800000, maxValuation: 4500000 },
      ],
    },
    {
      id: 'lenovo-ideapad-slim-3',
      category: 'LAPTOP',
      name: 'Lenovo IdeaPad Slim 3',
      aliases: ['lenovo ideapad slim 3', 'ideapad slim 3'],
      summary: 'Masuk kategori aman untuk simulasi laptop tipis.',
      specs: [
        { id: 'ideapad-8-512', label: '8GB / 512GB', minValuation: 2900000, maxValuation: 3500000 },
        { id: 'ideapad-16-512', label: '16GB / 512GB', minValuation: 3600000, maxValuation: 4200000 },
      ],
    },
    {
      id: 'thinkpad-t14',
      category: 'LAPTOP',
      name: 'ThinkPad T14',
      aliases: ['thinkpad t14', 't14'],
      summary: 'Laptop bisnis dengan value pasar yang kuat.',
      specs: [
        { id: 'thinkpad-8-256', label: '8GB / 256GB', minValuation: 4500000, maxValuation: 5100000 },
        { id: 'thinkpad-16-512', label: '16GB / 512GB', minValuation: 5000000, maxValuation: 5800000 },
      ],
    },
    {
      id: 'dell-latitude-7420',
      category: 'LAPTOP',
      name: 'Dell Latitude 7420',
      aliases: ['dell latitude 7420', 'latitude 7420'],
      summary: 'Seri kantor premium yang masih sering masuk gadai.',
      specs: [
        { id: 'latitude-16-256', label: '16GB / 256GB', minValuation: 5200000, maxValuation: 6000000 },
        { id: 'latitude-16-512', label: '16GB / 512GB', minValuation: 5800000, maxValuation: 6500000 },
      ],
    },
  ],
}
