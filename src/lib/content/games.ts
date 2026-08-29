export type GameType = "know_me" | "who_more" | "match" | "agree" | "choose";

export interface GuessPrompt {
  id: string;
  question: string;
  options: string[];
  bookCategory?: string;
  guessQuestion?: (name: string) => string;
}

export const KNOW_ME_PROMPTS: GuessPrompt[] = [
  { id: "km-01", question: "Co najbardziej pomaga Ci, gdy masz gorszy dzień?", guessQuestion: (name) => `Jak myślisz, co najbardziej pomaga ${name}?`, options: ["Rozmowa", "Przytulenie", "Chwila samemu", "Wspólne wyjście", "Sen"], bookCategory: "wspieranie" },
  { id: "km-02", question: "Co najbardziej Cię uspokaja po ciężkim dniu?", guessQuestion: (name) => `Co według Ciebie uspokaja ${name}?`, options: ["Cisza", "Ciepły prysznic", "Rozmowa", "Serial", "Muzyka"], bookCategory: "uspokaja" },
  { id: "km-03", question: "Jaki mały gest najbardziej poprawia Ci humor?", options: ["Wiadomość", "Przytulenie", "Coś do jedzenia", "Żart", "Pomoc w czymś"], bookCategory: "male_rzeczy" },
  { id: "km-04", question: "Czego najbardziej potrzebujesz, gdy jesteś zestresowany/a?", options: ["Przestrzeni", "Wsparcia", "Rozwiązania", "Wysłuchania", "Rozproszenia"], bookCategory: "wspieranie" },
  { id: "km-05", question: "Jaki rodzaj wolnego wieczoru wybierasz najchętniej?", options: ["Film", "Wyjście", "Gry", "Spacer", "Nicnierobienie"], bookCategory: "lubie" },
  { id: "km-06", question: "Jaki prezent ucieszyłby Cię najbardziej?", options: ["Praktyczny", "Sentymentalny", "Wspólne przeżycie", "Jedzenie", "Niespodzianka"], bookCategory: "male_rzeczy" },
  { id: "km-07", question: "Co najbardziej męczy Cię po intensywnym dniu?", options: ["Hałas", "Ludzie", "Dużo decyzji", "Pośpiech", "Brak chwili samemu"], bookCategory: "stresuje" },
  { id: "km-08", question: "Jak najchętniej spędzasz spokojny poranek?", options: ["Dłużej śpię", "Kawa i cisza", "Wspólne śniadanie", "Spacer", "Od razu coś robię"], bookCategory: "lubie" },
  { id: "km-09", question: "Co najłatwiej wyciąga Cię z gorszego nastroju?", options: ["Śmiech", "Ruch", "Bliskość", "Jedzenie", "Czas"], bookCategory: "uspokaja" },
  { id: "km-10", question: "Jaka spontaniczna propozycja najbardziej Ci pasuje?", options: ["Jedzenie na mieście", "Krótki wyjazd", "Spacer", "Kino", "Zostańmy w domu"], bookCategory: "lubie" },
  { id: "km-11", question: "Co jest dla Ciebie najważniejsze podczas trudnej rozmowy?", options: ["Spokojny ton", "Czas", "Konkrety", "Czułość", "Możliwość przerwy"], bookCategory: "wazne" },
  { id: "km-12", question: "Co najchętniej robisz, kiedy potrzebujesz się odłączyć od wszystkiego?", options: ["Śpię", "Słucham muzyki", "Gram", "Idę na spacer", "Oglądam coś"], bookCategory: "uspokaja" },
  { id: "km-13", question: "Jaki typ planu na weekend brzmi najlepiej?", options: ["Bez planu", "Wyjazd", "Dom", "Spotkanie", "Jedna konkretna atrakcja"], bookCategory: "lubie" },
  { id: "km-14", question: "Co najbardziej lubisz dostać ode mnie w zwykły dzień?", options: ["Wiadomość", "Telefon", "Przytulenie", "Mały gest", "Wspólny czas"], bookCategory: "male_rzeczy" },
  { id: "km-15", question: "Co pomaga Ci poczuć, że ktoś naprawdę Cię słucha?", options: ["Nie przerywa", "Dopytuje", "Nie daje od razu rad", "Przytula", "Pamięta później"], bookCategory: "wspieranie" },
];

KNOW_ME_PROMPTS.push(
  { id: "km-16", question: "Co najbardziej lubisz robić, kiedy masz cały wieczór bez planu?", options: ["Oglądać", "Wyjść", "Grać", "Czytać", "Nic nie planować"], bookCategory: "lubie" },
  { id: "km-17", question: "Jaki sposób okazywania troski zauważasz najszybciej?", options: ["Słowa", "Pomoc", "Czas razem", "Dotyk", "Drobny gest"], bookCategory: "wspieranie" },
  { id: "km-18", question: "Co najłatwiej przeciąża Cię podczas wyjazdu?", options: ["Pośpiech", "Tłum", "Brak planu", "Za dużo planu", "Mało snu"], bookCategory: "stresuje" },
  { id: "km-19", question: "Jaki dzień bez obowiązków brzmi najlepiej?", options: ["W domu", "Poza miastem", "Na mieście", "Ze znajomymi", "Bez żadnego planu"], bookCategory: "lubie" },
  { id: "km-20", question: "Kiedy jestem cicho, najczęściej potrzebuję…", options: ["Chwili", "Pytania co się dzieje", "Przytulenia", "Rozproszenia", "Normalnej obecności"], bookCategory: "wspieranie" },
  { id: "km-21", question: "Jaka mała rzecz w domu daje Ci najwięcej komfortu?", options: ["Koc", "Ciepłe światło", "Muzyka", "Porządek", "Coś dobrego do jedzenia"], bookCategory: "male_rzeczy" },
  { id: "km-22", question: "Co wolisz dostać po trudnym dniu?", options: ["Pytanie jak było", "Spokój", "Przytulenie", "Jedzenie", "Propozycję wspólnego planu"], bookCategory: "wspieranie" },
  { id: "km-23", question: "Jaki rodzaj niespodzianki najbardziej Ci odpowiada?", options: ["Mały prezent", "Jedzenie", "Wyjście", "Wiadomość", "Nie lubię niespodzianek"], bookCategory: "male_rzeczy" },
  { id: "km-24", question: "Kiedy plan się nagle zmienia, zwykle…", options: ["Lubię spontan", "Potrzebuję chwili", "Wolę nowy plan", "Trochę mnie to stresuje", "Zależy od dnia"], bookCategory: "wazne" },
  { id: "km-25", question: "Co najbardziej poprawia Ci zwykły poranek?", options: ["Dłuższy sen", "Dobre śniadanie", "Wiadomość", "Muzyka", "Brak pośpiechu"], bookCategory: "male_rzeczy" },
  { id: "km-26", question: "Jaki typ wspólnego czasu daje Ci najwięcej bliskości?", options: ["Rozmowa", "Wyjście", "Przytulanie", "Robienie czegoś razem", "Bycie obok bez gadania"], bookCategory: "wazne" },
  { id: "km-27", question: "Kiedy coś mnie martwi, najłatwiej mi o tym powiedzieć…", options: ["Od razu", "Po chwili", "Wieczorem", "Gdy ktoś zapyta", "Dopiero kiedy sam/a to poukładam"], bookCategory: "wspieranie" },
  { id: "km-28", question: "Co wybierzesz na mały prezent bez okazji?", options: ["Coś praktycznego", "Coś śmiesznego", "Coś sentymentalnego", "Jedzenie", "Wspólne wyjście"], bookCategory: "lubie" },
  { id: "km-29", question: "Co najczęściej pomaga Ci wrócić do dobrego humoru po spięciu?", options: ["Czas", "Rozmowa", "Przytulenie", "Żart", "Zmiana otoczenia"], bookCategory: "uspokaja" },
  { id: "km-30", question: "W ważnej rozmowie bardziej cenisz…", options: ["Szczerość", "Delikatność", "Konkrety", "Cierpliwość", "Czas na odpowiedź"], bookCategory: "wazne" },
  { id: "km-31", question: "Jak najchętniej świętujesz mały sukces?", options: ["Jedzeniem", "Wyjściem", "Opowiadam komuś", "Kupuję sobie coś", "Po prostu się cieszę"], bookCategory: "male_rzeczy" },
  { id: "km-32", question: "Co najbardziej lubisz w spokojnym wspólnym wieczorze?", options: ["Rozmowę", "Film", "Jedzenie", "Bliskość", "Każde robi swoje obok"], bookCategory: "lubie" },
  { id: "km-33", question: "Gdy jestem zmęczony/a, najbardziej drażni mnie…", options: ["Dużo pytań", "Hałas", "Pośpiech", "Podejmowanie decyzji", "Brak chwili samemu"], bookCategory: "stresuje" },
  { id: "km-34", question: "Najbardziej spontaniczny plan, na który łatwo mnie namówić, to…", options: ["Jedzenie", "Spacer", "Wyjazd", "Kino", "Spotkanie"], bookCategory: "lubie" },
  { id: "km-35", question: "Co sprawia, że zwykły dzień staje się dla mnie lepszy?", options: ["Śmiech", "Dobra rozmowa", "Dobre jedzenie", "Ruch", "Chwila spokoju"], bookCategory: "male_rzeczy" },
);

export const MATCH_PROMPTS: GuessPrompt[] = [
  { id: "match-01", question: "Jak najbardziej lubię spędzać wolny wieczór?", options: ["Film / serial", "Książka", "Gotowanie", "Spacer", "Gry"], bookCategory: "lubie" },
  { id: "match-02", question: "Co najbardziej lubię w weekendowy poranek?", options: ["Spać dłużej", "Wspólne śniadanie", "Ruch", "Kawa w ciszy", "Plan na dzień"], bookCategory: "lubie" },
  { id: "match-03", question: "Jaka pora dnia najbardziej mi odpowiada?", options: ["Wczesny ranek", "Przedpołudnie", "Popołudnie", "Wieczór", "Noc"], bookCategory: "male_rzeczy" },
  { id: "match-04", question: "Jaki typ wyjścia najchętniej wybiorę?", options: ["Restauracja", "Kino", "Spacer", "Koncert", "Kawiarnia"], bookCategory: "lubie" },
  { id: "match-05", question: "Co najchętniej wybieram na szybki poprawiacz humoru?", options: ["Słodkie", "Słone", "Kawa", "Muzyka", "Drzemka"], bookCategory: "male_rzeczy" },
  { id: "match-06", question: "Jaka pogoda najbardziej pasuje mi do wolnego dnia?", options: ["Słońce", "Lekki deszcz", "Śnieg", "Chłodno", "Obojętnie"], bookCategory: "lubie" },
  { id: "match-07", question: "W podróży wolę przede wszystkim…", options: ["Zwiedzać", "Odpoczywać", "Jeść", "Robić zdjęcia", "Improwizować"], bookCategory: "lubie" },
  { id: "match-08", question: "Kiedy mam godzinę dla siebie, najczęściej wybiorę…", options: ["Telefon", "Serial", "Spacer", "Grę", "Sen"], bookCategory: "male_rzeczy" },
  { id: "match-09", question: "Najlepsza mała niespodzianka to dla mnie…", options: ["Jedzenie", "Kwiat / drobiazg", "Wiadomość", "Plan wyjścia", "Coś śmiesznego"], bookCategory: "male_rzeczy" },
  { id: "match-10", question: "Jaki klimat mieszkania najbardziej lubię?", options: ["Minimalny", "Cozy", "Nowoczesny", "Kolorowy", "Klasyczny"], bookCategory: "lubie" },
];

MATCH_PROMPTS.push(
  { id: "match-11", question: "Na deser najchętniej wybieram…", options: ["Ciasto", "Lody", "Czekoladę", "Owoce", "Nic słodkiego"], bookCategory: "lubie" },
  { id: "match-12", question: "Gdy wybieram film, częściej szukam…", options: ["Komedii", "Thrillera", "Dramatu", "Fantasy / sci-fi", "Czegoś lekkiego"], bookCategory: "lubie" },
  { id: "match-13", question: "W kawiarni najchętniej zamawiam…", options: ["Kawę", "Herbatę", "Coś zimnego", "Coś słodkiego", "Cokolwiek nowego"], bookCategory: "male_rzeczy" },
  { id: "match-14", question: "Na wspólnym spacerze najbardziej lubię…", options: ["Rozmawiać", "Robić zdjęcia", "Iść bez celu", "Kupić coś po drodze", "Być w ciszy"], bookCategory: "lubie" },
  { id: "match-15", question: "Najbardziej odpoczywam, kiedy…", options: ["Śpię", "Jestem sam/a", "Jestem z Tobą", "Jestem na zewnątrz", "Nie mam planu"], bookCategory: "uspokaja" },
  { id: "match-16", question: "Najchętniej planuję wyjazd…", options: ["Dokładnie", "Tylko nocleg", "Dzień wcześniej", "Wcale", "Zależy od miejsca"], bookCategory: "lubie" },
  { id: "match-17", question: "W domu najbardziej przeszkadza mi…", options: ["Bałagan", "Hałas", "Zimno", "Brak jedzenia", "Za dużo rzeczy"], bookCategory: "stresuje" },
  { id: "match-18", question: "Mój idealny szybki lunch to…", options: ["Pizza", "Makaron", "Kanapka", "Azjatyckie", "Coś domowego"], bookCategory: "lubie" },
  { id: "match-19", question: "Na prezent bardziej ucieszy mnie…", options: ["Rzecz", "Przeżycie", "Jedzenie", "Coś własnoręcznego", "Niespodzianka"], bookCategory: "male_rzeczy" },
  { id: "match-20", question: "Gdy pada cały dzień, najchętniej…", options: ["Oglądam", "Śpię", "Gotuję", "Wychodzę mimo wszystko", "Gram / czytam"], bookCategory: "lubie" },
);

export interface WhoMorePrompt { id: string; question: string; }
export const WHO_MORE_PROMPTS: WhoMorePrompt[] = [
  { id: "wm-01", question: "Kto częściej zasypia pierwszy?" },
  { id: "wm-02", question: "Kto bardziej lubi niespodzianki?" },
  { id: "wm-03", question: "Kto pierwszy proponuje wspólne wyjście?" },
  { id: "wm-04", question: "Kto dłużej wybiera film?" },
  { id: "wm-05", question: "Kto częściej pamięta drobne szczegóły?" },
  { id: "wm-06", question: "Kto szybciej zgłodnieje podczas wyjścia?" },
  { id: "wm-07", question: "Kto częściej mówi „jeszcze pięć minut”?" },
  { id: "wm-08", question: "Kto bardziej lubi planować?" },
  { id: "wm-09", question: "Kto częściej robi zdjęcia?" },
  { id: "wm-10", question: "Kto szybciej zaprzyjaźnia się z kotami?" },
  { id: "wm-11", question: "Kto częściej proponuje jedzenie?" },
  { id: "wm-12", question: "Kto bardziej lubi spontaniczne wyjazdy?" },
  { id: "wm-13", question: "Kto częściej wraca po coś, czego zapomniał?" },
  { id: "wm-14", question: "Kto częściej zasypia przy filmie?" },
  { id: "wm-15", question: "Kto bardziej przejmuje się pogodą przed wyjściem?" },
];

WHO_MORE_PROMPTS.push(
  { id: "wm-16", question: "Kto częściej mówi „nie jestem głodny/a”, a potem podjada?" },
  { id: "wm-17", question: "Kto częściej szuka telefonu, który ma przy sobie?" },
  { id: "wm-18", question: "Kto szybciej zaczyna rozmawiać z obcym kotem?" },
  { id: "wm-19", question: "Kto częściej ma pięć otwartych rzeczy naraz?" },
  { id: "wm-20", question: "Kto częściej wybiera miejsce do jedzenia?" },
  { id: "wm-21", question: "Kto szybciej marznie?" },
  { id: "wm-22", question: "Kto częściej zasypia z telefonem w ręce?" },
  { id: "wm-23", question: "Kto bardziej lubi robić listy?" },
  { id: "wm-24", question: "Kto częściej mówi „chodźmy jeszcze kawałek”?" },
  { id: "wm-25", question: "Kto częściej robi spontaniczny zakup?" },
  { id: "wm-26", question: "Kto dłużej zastanawia się nad zamówieniem?" },
  { id: "wm-27", question: "Kto częściej pamięta daty i szczegóły?" },
  { id: "wm-28", question: "Kto szybciej proponuje przerwę, gdy oboje jesteście zmęczeni?" },
  { id: "wm-29", question: "Kto bardziej lubi siedzieć do późna?" },
  { id: "wm-30", question: "Kto częściej wybiera coś słodkiego?" },
  { id: "wm-31", question: "Kto częściej wysyła śmieszne rzeczy bez kontekstu?" },
  { id: "wm-32", question: "Kto bardziej lubi planować wakacje?" },
  { id: "wm-33", question: "Kto częściej zaczyna sprzątać w losowym momencie?" },
  { id: "wm-34", question: "Kto częściej mówi „zobaczymy na miejscu”?" },
  { id: "wm-35", question: "Kto szybciej proponuje wspólny odpoczynek?" },
);

export const WHO_MORE_OPTIONS = ["Ja", "Partner", "Oboje"] as const;

export interface ChoicePrompt { id: string; question: string; options: string[]; }

export const AGREE_PROMPTS: ChoicePrompt[] = [
  { id: "agree-01", question: "Idealny wolny wieczór?", options: ["Film w domu", "Wyjście na jedzenie", "Spacer", "Spotkanie ze znajomymi"] },
  { id: "agree-02", question: "Najlepszy spontaniczny plan?", options: ["Krótki wyjazd", "Jedzenie", "Kino", "Zostać w domu"] },
  { id: "agree-03", question: "Na wspólny weekend?", options: ["Góry", "Miasto", "Nad wodę", "Bez wyjazdu"] },
  { id: "agree-04", question: "Najlepsze wspólne śniadanie?", options: ["Na słodko", "Na słono", "Na mieście", "Byle kawa była"] },
  { id: "agree-05", question: "Wieczorem wolimy…", options: ["Rozmawiać", "Oglądać", "Grać", "Każde coś swojego obok siebie"] },
  { id: "agree-06", question: "Idealna długość spontanicznego spaceru?", options: ["10 minut", "30 minut", "Godzina", "Dopóki nam się chce"] },
  { id: "agree-07", question: "Gdy mamy jeden wolny dzień…", options: ["Plan", "Zero planu", "Wyjazd", "Dom"] },
  { id: "agree-08", question: "Na randkę najchętniej wybieramy…", options: ["Jedzenie", "Aktywność", "Spacer", "Coś nowego"] },
  { id: "agree-09", question: "Wspólna muzyka najlepiej działa…", options: ["W aucie", "W domu", "Na spacerze", "Na żywo"] },
  { id: "agree-10", question: "Najlepsza pora na ważną rozmowę?", options: ["Rano", "Po południu", "Wieczorem", "Gdy oboje mamy przestrzeń"] },
  { id: "agree-11", question: "W podróży najważniejsze jest…", options: ["Jedzenie", "Miejsca", "Spokój", "Spontaniczność"] },
  { id: "agree-12", question: "Najlepszy wspólny prezent?", options: ["Wyjazd", "Coś do domu", "Bilety", "Dobre jedzenie"] },
];

AGREE_PROMPTS.push(
  { id: "agree-13", question: "Jeśli mamy dwie wolne godziny, najlepiej…", options: ["Wyjść coś zjeść", "Spacer", "Film", "Nic nie planować"] },
  { id: "agree-14", question: "Wspólny wieczór najlepiej zaczyna się od…", options: ["Jedzenia", "Rozmowy", "Spaceru", "Wybrania filmu"] },
  { id: "agree-15", question: "Na mały prezent bez okazji wybieramy…", options: ["Jedzenie", "Drobiazg", "Kwiat / roślinę", "Wspólne wyjście"] },
  { id: "agree-16", question: "Gdy pogoda psuje plan, wolimy…", options: ["Zmienić plan", "Zostać w domu", "Iść mimo wszystko", "Zdecydować później"] },
  { id: "agree-17", question: "Idealny wspólny poranek to…", options: ["Długi sen", "Śniadanie", "Spacer", "Od razu coś robić"] },
  { id: "agree-18", question: "Najlepszy krótki wyjazd to…", options: ["Natura", "Miasto", "SPA / odpoczynek", "Bez konkretnego celu"] },
  { id: "agree-19", question: "W domu najbardziej lubimy klimat…", options: ["Cozy", "Minimalny", "Nowoczesny", "Pełen pamiątek"] },
  { id: "agree-20", question: "Jeśli oboje mamy gorszy dzień, wybieramy…", options: ["Rozmowę", "Film", "Jedzenie", "Trochę ciszy"] },
  { id: "agree-21", question: "Na spontaniczne jedzenie najchętniej…", options: ["Pizza", "Azjatyckie", "Burger", "Coś słodkiego"] },
  { id: "agree-22", question: "Na wspólne zdjęcia wolimy…", options: ["Naturalne", "Pozowane", "Śmieszne", "Prawie nie robimy"] },
  { id: "agree-23", question: "W nowym miejscu najpierw…", options: ["Zwiedzamy", "Szukamy jedzenia", "Odpoczywamy", "Idziemy bez planu"] },
  { id: "agree-24", question: "Wieczór bez telefonów najlepiej spędzić…", options: ["Rozmawiając", "Gotując", "Spacerując", "Grając"] },
);

export const CHOOSE_PROMPTS: ChoicePrompt[] = [
  ["Morze", "Góry"], ["Rano", "Noc"], ["Pizza", "Sushi"], ["Film", "Serial"], ["Miasto", "Natura"],
  ["Kawa", "Herbata"], ["Plan", "Spontan"], ["Lato", "Zima"], ["Koncert", "Kino"], ["Spacer", "Kanapa"],
  ["Słodkie", "Słone"], ["Wschód słońca", "Zachód słońca"], ["Hotel", "Domek"], ["Samochód", "Pociąg"], ["Książka", "Gra"],
  ["Śniadanie na mieście", "Kolacja na mieście"], ["Piknik", "Restauracja"], ["Zdjęcia", "Filmiki"], ["Deszcz", "Śnieg"], ["Zwiedzanie", "Odpoczynek"],
].map((options, index) => ({ id: `choose-${String(index + 1).padStart(2, "0")}`, question: "Co wybierasz?", options }));

CHOOSE_PROMPTS.push(...[
  ["Las", "Jezioro"], ["Wschód", "Zachód"], ["Gotowanie", "Zamawianie"], ["Planszówki", "Gry wideo"], ["Komedia", "Thriller"],
  ["Pies", "Kot"], ["Długi spacer", "Krótki wyjazd"], ["Domek", "Apartament"], ["Piknik", "Kawiarnia"], ["Zdjęcie", "Pamiątka"],
  ["Cisza", "Muzyka"], ["Świeczki", "Lampki"], ["Woda", "Lasy"], ["Śniadanie", "Brunch"], ["Wcześnie", "Późno"],
  ["Słońce", "Chmury"], ["Słuchawki", "Głośnik"], ["Nowe miejsce", "Znane miejsce"], ["Plan dnia", "Wolny dzień"], ["Ciasto", "Lody"],
].map((options, index) => ({ id: `choose-${String(index + 21).padStart(2, "0")}`, question: "Co wybierasz?", options })));

export function getGamePrompt(gameType: GameType, promptId: string) {
  if (gameType === "know_me") return KNOW_ME_PROMPTS.find((prompt) => prompt.id === promptId);
  if (gameType === "match") return MATCH_PROMPTS.find((prompt) => prompt.id === promptId);
  if (gameType === "who_more") return WHO_MORE_PROMPTS.find((prompt) => prompt.id === promptId);
  if (gameType === "agree") return AGREE_PROMPTS.find((prompt) => prompt.id === promptId);
  return CHOOSE_PROMPTS.find((prompt) => prompt.id === promptId);
}
