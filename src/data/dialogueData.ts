import { DialogueTurn } from '../types';

export const PARTNER_PROFILE = {
  name: 'Jina',
  role: 'International University Student',
  status: 'Online · Exchange Buddy',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80',
  bio: 'Friendly, supportive university student meeting a new friend on campus.',
};

export const USER_PROFILE = {
  name: 'Alex',
  role: 'Undergraduate Student',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=280&q=80',
};

export const PRACTICE_DIALOGUE: DialogueTurn[] = [
  {
    id: 1,
    partnerPrompt: "Hey! I don't think we've met before. What's your name?",
    partnerKorean: "안녕! 우리 전에 본 적 없는 것 같은데. 이름이 뭐야?",
    targetSentence: "Hi! I'm Alex. Nice to meet you!",
    targetKorean: "안녕! 나는 Alex야. 만나서 반가워!",
    keywords: ["Alex", "nice", "meet"],
    firstLetterHint: "Try starting with 'Hi! I'm Alex...'",
    chunkedPhrases: ["Hi! I'm Alex.", "Nice to meet you!"],
    alternativeExpressions: [
      "Hey there! My name is Alex, really great to meet you!",
      "Hello! I'm Alex. It's a pleasure to meet you!",
      "Hi! I go by Alex, wonderful to meet you too."
    ]
  },
  {
    id: 2,
    partnerPrompt: "Nice to meet you, too! What are you studying?",
    partnerKorean: "나도 만나서 반가워! 너 전공이 뭐야?",
    targetSentence: "I'm studying literature, but I'm also interested in biotechnology.",
    targetKorean: "나 문학을 공부하지만 생명공학에도 관심이 있어.",
    keywords: ["studying", "literature", "biotechnology"],
    firstLetterHint: "Try starting with 'I'm studying literature, but...'",
    chunkedPhrases: [
      "I'm studying literature,",
      "but I'm also interested in biotechnology."
    ],
    alternativeExpressions: [
      "My major is literature, but I have a strong interest in biotechnology.",
      "I study literature, though biotechnology also catches my attention.",
      "I'm in literature, but I'm really curious about biotech as well."
    ]
  },
  {
    id: 3,
    partnerPrompt: "That's an interesting combination! What got you interested in biotechnology?",
    partnerKorean: "흥미로운 조합이네! 어떻게 생명공학에 관심을 갖게 됐어?",
    targetSentence: "I've always been curious about how science can improve people's lives.",
    targetKorean: "과학이 어떻게 사람들의 삶을 개선할 수 있는지 항상 궁금했어.",
    keywords: ["curious", "science", "improve"],
    firstLetterHint: "Try starting with 'I've always been curious about...'",
    chunkedPhrases: [
      "I've always been curious",
      "about how science can improve people's lives."
    ],
    alternativeExpressions: [
      "I've always wondered how science can make people's daily lives healthier.",
      "I love seeing how scientific discoveries can genuinely help people.",
      "I'm fascinated by the way science can solve real human problems."
    ]
  },
  {
    id: 4,
    partnerPrompt: "That's cool! What do you usually do in your free time?",
    partnerKorean: "멋지다! 여가 시간에는 주로 뭐 해?",
    targetSentence: "I enjoy watching movies and trying new restaurants with friends.",
    targetKorean: "친구들과 영화를 보고 새로운 식당에 가보는 걸 좋아해.",
    keywords: ["enjoy", "movies", "restaurants"],
    firstLetterHint: "Try starting with 'I enjoy watching movies and...'",
    chunkedPhrases: [
      "I enjoy watching movies",
      "and trying new restaurants with friends."
    ],
    alternativeExpressions: [
      "In my spare time, I love watching films and checking out new food spots with friends.",
      "I usually hang out with friends, watch good movies, and try delicious restaurants.",
      "I like relaxing with a movie and exploring hidden restaurant gems with friends."
    ]
  },
  {
    id: 5,
    partnerPrompt: "We should hang out sometime! Are you free this weekend?",
    partnerKorean: "우리 언제 한번 같이 놀자! 이번 주말에 시간 있어?",
    targetSentence: "Sure! I'm free on Saturday. How about grabbing coffee?",
    targetKorean: "좋아! 토요일에 시간 있어. 커피 마시는 건 어때?",
    keywords: ["free", "Saturday", "coffee"],
    firstLetterHint: "Try starting with 'Sure! I'm free on Saturday...'",
    chunkedPhrases: [
      "Sure! I'm free on Saturday.",
      "How about grabbing coffee?"
    ],
    alternativeExpressions: [
      "Sounds great! Saturday works for me. Want to get a cup of coffee?",
      "I'd love to! I'm free this Saturday. How about we grab some coffee?",
      "Sure thing! Saturday is totally open for me. Coffee sounds wonderful!"
    ]
  }
];

export const SCENARIO_DETAILS = {
  title: "Meeting a New Friend",
  titleKorean: "새로운 외국인 친구와의 첫 만남",
  level: "CEFR B1–B2",
  targetTime: "5–7 min",
  description: "Practice starting a friendly conversation with an international university student. Cover introductions, sharing diverse academic interests, and making casual weekend plans without fear of grammar mistakes.",
  goals: [
    "Greet and introduce yourself naturally",
    "Describe your major and secondary academic interests",
    "Explain what inspires your curiosity",
    "Share everyday hobbies and free-time activities",
    "Confidently invite a friend for weekend coffee"
  ]
};
