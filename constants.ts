
import { Category, Era, QuestStatus } from './types';

// Backward compatibility (we will eventually generate this from Eras)
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-ancient-hun',
    name: 'Bozkırın Efendileri: Hunlar',
    description: 'Orta Asya bozkırlarında kurulan ilk Türk imparatorluğunun gizli mühürleri.',
    periods: [],
    nodes: [
      {
        id: 'node-hun-1',
        title: 'Mete Han ve Islıklı Oklar',
        historyQuestion: 'Onluk sistemi kuran Mete Han, Asya Hun Devleti tahtına hangi yıl geçmiştir?',
        questionType: 'YEAR',
        correctYear: 209,
        mathLogic: '(rakam_toplamı * 2)',
        unlockType: 'MATH',
        mathResult: 22,
        locationHint: 'Okçuluk alanındaki en uzun mesafeli yayın hemen altında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1554178286-db414c02b2dc?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 45, y: 40, radius: 10 },
        rewardKeyId: 'KEY-HUN-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      },
      {
        id: 'node-hun-2',
        title: 'Hun Savaş Sanatı',
        historyQuestion: 'Hun ordusunun en etkili ve psikolojik üstünlük sağlayan silahı hangisidir?',
        questionType: 'MULTIPLE_CHOICE',
        options: ['Mızrak', 'Islıklı Ok', 'Gürz', 'Kılıç'],
        correctAnswer: 'Islıklı Ok',
        // Dummy values for type safety
        correctYear: 0,

        mathLogic: 'Hangi sandığı açmalısın?',
        unlockType: 'MULTIPLE_CHOICE',
        unlockOptions: ['Mavi Sandık', 'Kırmızı Kutu', 'Altın Kese', 'Demir Kasa'],
        unlockAnswer: 'Altın Kese',
        mathResult: 0,

        locationHint: 'Silah müzesinin girişindeki vitrinde.',
        mapImageUrl: 'https://images.unsplash.com/photo-1598556776374-0a37466d3a87?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 30, y: 50, radius: 15 },
        rewardKeyId: 'KEY-HUN-2',
        status: QuestStatus.LOCKED,
        order: 1
      },
      {
        id: 'node-hun-3',
        title: 'Bozkırın Hükümdarı',
        historyQuestion: 'Mete Han\'ın babasının adı nedir? (Sadece isim)',
        questionType: 'TEXT',
        correctAnswer: 'Teoman',
        correctYear: 0,

        mathLogic: 'Şifre: BOZKIR (Tersi nedir?)',
        unlockType: 'TEXT',
        unlockAnswer: 'RIKZOB',
        mathResult: 0,

        locationHint: 'Saltanat çadırının girişindeki direğin dibinde.',
        mapImageUrl: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 60, y: 60, radius: 12 },
        rewardKeyId: 'KEY-HUN-3',
        status: QuestStatus.LOCKED,
        order: 2
      },
      {
        id: 'node-hun-4',
        title: 'Tarihin Seyri (Video)',
        historyQuestion: 'Videodaki savaş Hunların en büyük zaferlerinden biridir. Hangi Çin hanedanına karşı kazanılmıştır?',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
        questionType: 'MULTIPLE_CHOICE',
        options: ['Han Hanedanı', 'Ming Hanedanı', 'Tang Hanedanı', 'Song Hanedanı'],
        correctAnswer: 'Han Hanedanı',
        correctYear: 0,

        mathLogic: '(5 + 3) * 2 = ?',
        unlockType: 'MATH',
        mathResult: 16,

        locationHint: 'Sinema salonunun çıkış kapısında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1461301214746-1e790926d323?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 80, y: 20, radius: 20 },
        rewardKeyId: 'KEY-HUN-4',
        status: QuestStatus.LOCKED,
        order: 3
      }
    ]
  },
  {
    id: 'cat-gokturk',
    name: 'GökTürkler: Yazılı Kaynaklar',
    description: 'Türk adıyla kurulan ilk devletin taşlara kazınmış vasiyetleri.',
    periods: [],
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
    periods: [],
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
    periods: [],
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
    periods: [],
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
  },
  {
    id: 'cat-egypt',
    name: 'Mısır: Piramitlerin Sırrı',
    description: 'Nil Nehri kıyısında yükselen devasa anıtlar ve firavunların gizemi.',
    periods: [],
    nodes: [
      {
        id: 'node-egypt-1',
        title: 'Büyük Giza Piramidi',
        historyQuestion: 'Keops Piramidi M.Ö. 2560 yılında tamamlanmıştır. Bu yılın rakamları toplamının 3 katı kaçtır?',
        correctYear: 2560,
        mathLogic: '(rakam_toplamı * 3)',
        mathResult: 39,
        locationHint: 'Antik Yakındoğu galerisindeki en büyük firavun büstünün tam karşısında.',
        mapImageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 50, y: 30, radius: 12 },
        rewardKeyId: 'KEY-EGY-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-rome',
    name: 'Roma: İmparatorluk Gücü',
    description: 'Kolezyum’dan hukuk sistemine, batı medeniyetinin temelleri.',
    periods: [],
    nodes: [
      {
        id: 'node-rome-1',
        title: 'Kolezyum’un Açılışı',
        historyQuestion: 'Roma’nın simgesi Kolezyum (Flavian Amfitiyatrosu) M.S. kaç yılında açılmıştır?',
        correctYear: 80,
        mathLogic: '(rakam_toplamı + 12)',
        mathResult: 20,
        locationHint: 'Gladyatör miğferlerinin sergilendiği vitrinin sol köşesinde.',
        mapImageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 40, y: 60, radius: 15 },
        rewardKeyId: 'KEY-ROM-1',
        status: QuestStatus.AVAILABLE,
        order: 0
      }
    ]
  },
  {
    id: 'cat-maya',
    name: 'Maya: Gökyüzü Gözlemcileri',
    description: 'Ormanların derinliklerinde kaybolan kadim şehirler ve takvimler.',
    periods: [],
    nodes: [
      {
        id: 'node-maya-1',
        title: 'Kukulkan Piramidi',
        historyQuestion: 'Maya şehri Chichen Itza’nın merkezindeki El Castillo piramidi yaklaşık M.S. 1000 yılında inşa edilmiştir. Bu yılın rakamları toplamı nedir?',
        correctYear: 1000,
        mathLogic: '(rakam_toplamı)',
        mathResult: 1,
        locationHint: 'Maya takvimi replikasının hemen arkasında, gizli bir bölmede.',
        mapImageUrl: 'https://images.unsplash.com/photo-1518105779142-d975fb19a15f?q=80&w=1000&auto=format&fit=crop',
        targetZone: { x: 65, y: 45, radius: 10 },
        rewardKeyId: 'KEY-MAY-1',
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
  },
  {
    id: 'era-world-heritage',
    name: 'DÜNYA MİRASI',
    description: 'İnsanlık tarihine yön veren küresel medeniyetler ve mirasları.',
    order: 2,
    imageUrl: '',
    topics: [
      {
        id: 'topic-egypt',
        name: 'Mısır Medeniyeti',
        description: 'Piramitler ve Nil\'in gizemi.',
        order: 0,
        subTopics: [
          {
            id: 'sub-egypt-pyramids',
            name: 'Piramitler ve Yaşam',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-egypt')!.nodes
          }
        ]
      },
      {
        id: 'topic-rome',
        name: 'Roma İmparatorluğu',
        description: 'Hukuk, mimari ve fetih.',
        order: 1,
        subTopics: [
          {
            id: 'sub-rome-colosseum',
            name: 'Roma Mimarisi',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-rome')!.nodes
          }
        ]
      },
      {
        id: 'topic-maya',
        name: 'Maya Uygarlığı',
        description: 'Astronomi ve kayıp şehirler.',
        order: 2,
        subTopics: [
          {
            id: 'sub-maya-astronomy',
            name: 'Takvim ve Piramitler',
            nodes: INITIAL_CATEGORIES.find(c => c.id === 'cat-maya')!.nodes
          }
        ]
      }
    ]
  }
];

