
import { Category, Era, QuestStatus } from './types';

// Backward compatibility (we will eventually generate this from Eras)
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-ancient-hun',
    name: 'Bozkırın Efendileri: Hunlar',
    description: 'Orta Asya bozkırlarında kurulan ilk Türk imparatorluğunun gizli mühürleri.',
    nodes: [
      {
        id: 'node-hun-1',
        title: 'Mete Han ve Islıklı Oklar',
        historyQuestion: 'Onluk sistemi kuran Mete Han, Asya Hun Devleti tahtına hangi yıl geçmiştir?',
        correctYear: 209,
        mathLogic: '(rakam_toplamı * 2)',
        mathResult: 22,
        locationHint: 'Okçuluk alanındaki en uzun mesafeli yayın hemen altında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1554178286-db414c02b2dc?q=80&w=1000&auto=format&fit=crop', // Archery/Bow
        targetZone: { x: 45, y: 40, radius: 10 },
        rewardKeyId: 'KEY-HUN-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-gokturk',
    name: 'GökTürkler: Yazılı Kaynaklar',
    description: 'Türk adıyla kurulan ilk devletin taşlara kazınmış vasiyetleri.',
    nodes: [
      {
        id: 'node-gok-1',
        title: 'Orhun Yazıtları',
        historyQuestion: 'Bilge Kağan Yazıtı hangi yıl dikilmiştir?',
        correctYear: 735,
        mathLogic: '(rakam_toplamı + 5)',
        mathResult: 20,
        locationHint: 'Müze girişindeki devasa yazıt kopyasının kaidesinde.',
        mapImageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop', // Stone/Ancient Text
        targetZone: { x: 60, y: 30, radius: 12 },
        rewardKeyId: 'KEY-GOK-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-seljuk-grand',
    name: 'Selçuklu: Anadolu Kapıları',
    description: 'Anadolu’nun yurt tutulduğu şanlı zaferler ve kervansaraylar.',
    nodes: [
      {
        id: 'node-sel-1',
        title: 'Malazgirt Zaferi',
        historyQuestion: 'Sultan Alparslan Anadolu’nun kapılarını hangi yıl Türklere açtı?',
        correctYear: 1071,
        mathLogic: '(rakam_toplamı * 3)',
        mathResult: 27,
        locationHint: 'Zırh koleksiyonundaki en görkemli Selçuklu kalkanının arkasında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1598556776374-0a37466d3a87?q=80&w=1000&auto=format&fit=crop', // Armor/Shield
        targetZone: { x: 70, y: 20, radius: 15 },
        rewardKeyId: 'KEY-SEL-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-ottoman-conquest',
    name: 'Osmanlı: Cihan Devleti',
    description: 'Fatih’ten Kanuni’ye, üç kıtaya hükmeden imparatorluğun sırları.',
    nodes: [
      {
        id: 'node-ott-1',
        title: 'İstanbul’un Fethi',
        historyQuestion: 'Fatih Sultan Mehmet İstanbul’u hangi yıl fethetti?',
        correctYear: 1453,
        mathLogic: '(rakam_toplamı * 2)',
        mathResult: 26,
        locationHint: 'Fatih’in kılıcının sergilendiği cam bölmenin altında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1626278664285-b79560f78083?q=80&w=1000&auto=format&fit=crop', // Sword/Museum
        targetZone: { x: 50, y: 50, radius: 10 },
        rewardKeyId: 'KEY-OTT-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-republic-era',
    name: 'Cumhuriyet: Çağdaşlaşma',
    description: 'Milli Mücadele’den modern Türkiye’nin kuruluşuna.',
    nodes: [
      {
        id: 'node-rep-1',
        title: 'Cumhuriyetin İlanı',
        historyQuestion: 'Türkiye Cumhuriyeti hangi yıl ilan edildi?',
        correctYear: 1923,
        mathLogic: '(rakam_toplamı * 2)',
        mathResult: 30,
        locationHint: 'Milli Mücadele salonundaki ilk meclis kürsüsünün yanında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1577083288073-4530835269af?q=80&w=1000&auto=format&fit=crop', // Parliament/Old Building
        targetZone: { x: 30, y: 60, radius: 10 },
        rewardKeyId: 'KEY-REP-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  }
];

export const INITIAL_ERAS: Era[] = [
  {
    id: 'era-turkic-history',
    name: 'TÜRK TARİHİ',
    description: 'Orta Asya\'dan Anadolu\'ya uzanan binlerce yıllık kadim yolculuk.',
    order: 0,
    imageUrl: '',
    topics: [
      {
        id: 'topic-pre-islamic',
        name: 'İslamiyet Öncesi Türk Tarihi',
        description: 'Bozkırın atlı göçebeleri ve ilk devletler.',
        order: 0,
        subTopics: [
          {
            id: 'sub-huns',
            name: 'Asya Hun Devleti',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-ancient-hun')!.nodes
          },
          {
            id: 'sub-gokturks',
            name: 'Göktürk Devleti',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-gokturk')!.nodes
          }
        ]
      },
      {
        id: 'topic-seljuk',
        name: 'Selçuklu Dönemi',
        description: 'Anadolu\'nun kapılarının açılması ve yerleşik hayata geçiş.',
        order: 1,
        subTopics: [
          {
            id: 'sub-great-seljuk',
            name: 'Büyük Selçuklu Devleti',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-seljuk-grand')!.nodes
          }
        ]
      },
      {
        id: 'topic-ottoman',
        name: 'Osmanlı İmparatorluğu',
        description: 'Üç kıtaya hükmeden cihan devleti.',
        order: 2,
        subTopics: [
          {
            id: 'sub-ottoman-rise',
            name: 'Yükselme Dönemi',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-ottoman-conquest')!.nodes
          }
        ]
      }
    ]
  },
  {
    id: 'era-republic',
    name: 'CUMHURİYET TARİHİ',
    description: 'Milli Mücadele ve modern Türkiye\'nin doğuşu.',
    order: 1,
    imageUrl: '',
    topics: [
      {
        id: 'topic-modern-turkey',
        name: 'Modern Türkiye',
        description: 'Bağımsızlık savaşı ve devrimler.',
        order: 0,
        subTopics: [
          {
            id: 'sub-republic-founding',
            name: 'Kuruluş Dönemi',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-republic-era')!.nodes
          }
        ]
      }
    ]
  }
];

