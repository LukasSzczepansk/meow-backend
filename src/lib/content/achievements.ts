export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { key: "first_paw", title: "Pierwszy ślad", description: "Zróbcie pierwszą wspólną aktywność." },
  { key: "first_meow", title: "Pierwsze Miau", description: "Wyślijcie pierwszy mały sygnał." },
  { key: "meow_10", title: "Małe sygnały", description: "Wyślijcie 10 Miau." },
  { key: "meow_50", title: "Jestem obok", description: "Wyślijcie 50 Miau." },
  { key: "good_start", title: "Dobry początek", description: "Zapiszcie 10 odpowiedzi." },
  { key: "getting_to_know", title: "Poznajemy się", description: "Zapiszcie 25 odpowiedzi." },
  { key: "questions_50", title: "Coraz bliżej", description: "Zapiszcie 50 odpowiedzi." },
  { key: "questions_100", title: "Sto odpowiedzi", description: "Zapiszcie 100 odpowiedzi." },
  { key: "playful_duo", title: "Zgrany duet", description: "Ukończcie 10 gier." },
  { key: "games_25", title: "Wiecie o sobie sporo", description: "Ukończcie 25 gier." },
  { key: "calmer", title: "Spokojniej", description: "Ukończcie 5 spokojnych sesji." },
  { key: "calm_15", title: "Chwila ciszy", description: "Ukończcie 15 spokojnych sesji." },
  { key: "first_memory", title: "Pierwsza strona", description: "Dodajcie pierwsze wspomnienie." },
  { key: "memory_keepers", title: "Strażnicy wspomnień", description: "Dodajcie 5 wspomnień." },
  { key: "memories_15", title: "Nasz album", description: "Dodajcie 15 wspomnień." },
  { key: "first_date_idea", title: "Do słoika", description: "Dodajcie pierwszy pomysł do Słoika." },
  { key: "date_ideas_10", title: "Mamy plan", description: "Zbierzcie 10 wspólnych pomysłów." },
  { key: "first_timeline", title: "Początek historii", description: "Dodajcie pierwszy moment do Naszej Historii." },
  { key: "timeline_5", title: "Kilka rozdziałów", description: "Dodajcie 5 momentów do Naszej Historii." },
  { key: "book_5", title: "Warto pamiętać", description: "Zapiszcie 5 rzeczy w Księdze Nas." },
  { key: "book_20", title: "Znam Cię lepiej", description: "Zapiszcie 20 rzeczy w Księdze Nas." },
  { key: "home_5", title: "Robi się nasze", description: "Zdobądźcie 5 elementów Domku." },
  { key: "home_15", title: "Domownicy", description: "Zdobądźcie 15 elementów Domku." },
  { key: "more_ours", title: "Więcej miejsca", description: "Odblokujcie drugie pomieszczenie." },
  { key: "room_4", title: "Mały świat", description: "Dotrzyjcie do czwartego pomieszczenia." },
];

export function getAchievement(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.key === key);
}
