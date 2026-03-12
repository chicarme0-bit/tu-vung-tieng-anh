export type DemoCategory = {
  id: string;
  name: string;
};

export type DemoVocabulary = {
  id: string;
  english: string;
  vietnamese: string;
  pronunciation: string | null;
  exampleEn: string | null;
  exampleVi: string | null;
  source: string;
  difficulty: number;
  categoryId: string;
  category: DemoCategory | null;
};

export const demoCategories: DemoCategory[] = [
  { id: "food", name: "Ẩm thực" },
  { id: "travel", name: "Du lịch" },
  { id: "business", name: "Công việc" },
  { id: "technology", name: "Công nghệ" }
];

export const demoVocabulary: DemoVocabulary[] = [
  {
    id: "travel-destination",
    english: "destination",
    vietnamese: "điểm đến",
    pronunciation: "/ˌdestɪˈneɪʃən/",
    exampleEn: "Da Nang is a popular travel destination.",
    exampleVi: "Đà Nẵng là một điểm đến du lịch phổ biến.",
    source: "SYSTEM",
    difficulty: 2,
    categoryId: "travel",
    category: demoCategories[1]
  },
  {
    id: "business-deadline",
    english: "deadline",
    vietnamese: "hạn chót",
    pronunciation: "/ˈdedlaɪn/",
    exampleEn: "The deadline for this report is Friday.",
    exampleVi: "Hạn chót cho báo cáo này là thứ Sáu.",
    source: "SYSTEM",
    difficulty: 1,
    categoryId: "business",
    category: demoCategories[2]
  },
  {
    id: "food-ingredient",
    english: "ingredient",
    vietnamese: "nguyên liệu",
    pronunciation: "/ɪnˈɡriːdiənt/",
    exampleEn: "Fresh ingredients make the meal better.",
    exampleVi: "Nguyên liệu tươi làm món ăn ngon hơn.",
    source: "SYSTEM",
    difficulty: 1,
    categoryId: "food",
    category: demoCategories[0]
  },
  {
    id: "tech-device",
    english: "device",
    vietnamese: "thiết bị",
    pronunciation: "/dɪˈvaɪs/",
    exampleEn: "This device can connect to Wi-Fi.",
    exampleVi: "Thiết bị này có thể kết nối Wi-Fi.",
    source: "SYSTEM",
    difficulty: 1,
    categoryId: "technology",
    category: demoCategories[3]
  },
  {
    id: "travel-reservation",
    english: "reservation",
    vietnamese: "đặt chỗ",
    pronunciation: "/ˌrezərˈveɪʃən/",
    exampleEn: "I made a hotel reservation online.",
    exampleVi: "Tôi đã đặt chỗ khách sạn trực tuyến.",
    source: "SYSTEM",
    difficulty: 2,
    categoryId: "travel",
    category: demoCategories[1]
  },
  {
    id: "business-invoice",
    english: "invoice",
    vietnamese: "hóa đơn",
    pronunciation: "/ˈɪnvɔɪs/",
    exampleEn: "Please send the invoice by email.",
    exampleVi: "Vui lòng gửi hóa đơn qua email.",
    source: "SYSTEM",
    difficulty: 2,
    categoryId: "business",
    category: demoCategories[2]
  }
];

export const demoReviewItems = demoVocabulary.slice(0, 4).map((item, index) => ({
  ...item,
  state: index < 2 ? "REVIEW" : "NEW",
  dueAt: new Date().toISOString(),
  intervalDays: index < 2 ? 3 : 0,
  totalReviews: index < 2 ? 4 : 0,
  consecutiveCorrect: index < 2 ? 3 : 0,
  lapses: index === 1 ? 1 : 0,
  isDue: true
}));

export const demoDashboard = {
  vocabularyCount: demoVocabulary.length,
  reviewDue: 4,
  learningCount: 2,
  maturedCount: 2,
  streak: 5,
  recentAttempts: [
    { id: "1", score: 80, correctAnswers: 4, totalQuestions: 5, direction: "EN_TO_VI", mode: "MULTIPLE_CHOICE", category: { name: "Du lịch" } },
    { id: "2", score: 100, correctAnswers: 5, totalQuestions: 5, direction: "VI_TO_EN", mode: "TYPING", category: { name: "Công việc" } }
  ]
};
