# Poranne TNT — odliczanie do wyjścia do przedszkola

Apka na TV (Samsung UE55MU6472, Tizen 3.0). Na ekranie stoi laska dynamitu,
której lont pali się do godziny wyjścia (domyślnie **8:30**). Gdy dziecko
zdąży wyjść, lont zostaje zgaszony i do tygodnia dochodzi gwiazdka. Gdy nie
zdąży, o 8:30 jest **BUM!**

## Instalacja / aktualizacja

```sh
cd ~/Electronics/samsung-tv/tizen-tnt && ./build-and-install.sh
```

Wymagania są te same co dla ArtFrame: Tizen Studio, profil certyfikatu `tv`
i włączony Developer Mode na TV.

## Jak to działa

| Pora | Ekran |
|---|---|
| przed 7:45 | lont jeszcze nie płonie, „lont zapali się o 7:45” |
| 7:45–8:30 | lont się pali, a długość lontu pokazuje pozostały czas; duży licznik minut (żółty od 10 min, czerwony od 5 min); w ostatnich 5 min tyka zegar |
| „Wychodzimy!” | lont zgaszony wodą, konfetti, fanfary, „Brawo, <imię>! Zdążyliśmy!”, gwiazdka w tygodniu |
| 8:30 bez wyjścia | wybuch: błysk, trzęsienie ekranu, „BUM!”, „Jutro się uda” |
| po 9:30, weekend | „Na dziś koniec” albo „Wolne!” |

Pod licznikiem są poranne zadania z ikonkami: siku, ubranie, śniadanie, zęby,
buty, kurtka i gwiazdka **wyzwania dnia**, a w piątki dodatkowo zabawka do
przedszkola. Odhaczasz je pilotem albo klawiszami 1–8.

Co jeszcze dzieje się na ekranie:

- **Codziennie coś innego na końcu lontu:** dynamit, bomba, wulkan, tort albo
  arbuz. Każde wybucha inaczej („BUM!”, „PLASK!”, „CHLUP!”). Przez cały dzień
  jest to samo, a kolejne dni robocze się nie powtarzają. Wulkan nie ma lontu:
  napełnia się lawą (bulgocze, a pod koniec drży), a ugaszony stygnie w skałę. Pokaz próbny (D)
  pokazuje za każdym razem następną rzecz.
- **Kotek strażak z wiadrem:** każde odhaczone zadanie dolewa wody do wiadra,
  a kotek podskakuje, miauczy i mówi, co teraz. Po „Wychodzimy!” gasi lont
  wodą z węża. Pełne wiadro daje świecącą gwiazdkę w tygodniu. Przy wybuchu
  kotek jest umorusany sadzą, w wolne dni śpi.
- **Kotek robi wszystko razem z dzieckiem:** zaczyna w piżamie i szlafmycy.
  Po każdym odhaczeniu przez chwilę wykonuje tę samą czynność: siedzi na
  nocniku, je łyżką z miski, myje zęby (potem błyszczy mu uśmiech), a przy
  wyzwaniu robi fikołka. Ubiera się razem z dzieckiem: „Ubranie” daje kurtkę
  strażacką, „Buty” buty, „Kurtka” hełm (przy mrozie także szalik), a
  „Zabawka” misia w łapce. Odhaczenie cofnięte = kotek też to zdejmuje.
- **Wyzwanie dnia:** żółty dymek nad kafelkiem z gwiazdką, np. „Zrób 10 żabich skoków!”; po odhaczeniu robi się zielony („Zaliczone!”).
  Jest ich 32, codziennie inne.
- **Pogoda** (Open-Meteo, miasto w ustawieniach): temperatura w porze wyjścia.
  Kafelki dopasowują się do pogody: kurtka zmienia się w „Kurtka i czapka”,
  „Bluza” albo „Czapka z daszkiem”, a buty w „Kalosze” albo „Śniegowce”.
  Kotek podpowiada, co założyć. W prawym górnym rogu jest
tydzień z gwiazdkami ★ i serią dni z rzędu.

Po zakończonym poranku apka zamyka się sama po 5 minutach bez dotykania pilota.

## Pilot

| Przycisk | Akcja |
|---|---|
| ◄ ► / ▲ ▼ | wybór zadania / przycisku „Wychodzimy!” |
| OK | odhacz zadanie albo „Wychodzimy!” (od razu, bez potwierdzania) |
| 1–8 | szybkie odhaczanie zadań |
| C (żółty) | ustawienia: imię (w wołaczu), godzina wyjścia, start lontu, dni, dźwięk, autostart, miasto do pogody, restart dnia (czyści wynik i odznacza wszystkie zadania – gdy dziecko naklika za dużo) |
| D (niebieski) | pokaz próbny: lont na 1 minutę, czyste zaznaczenia; nic nie trafia do historii ani do prawdziwych zaznaczeń |
| ↩ | wyjście |

## Autostart rano

Apka przy każdym uruchomieniu ustawia budzik systemowy Tizena (`tizen.alarm`)
na godzinę startu lontu w wybrane dni. Budzik działa jednak tylko przy
**włączonym** telewizorze. Żeby TV sam się włączał, ustaw w nim
**Ustawienia → Ogólne → Menedżer systemu → Czas → Timer włączenia** na np. 7:44
w dni robocze. Apka uruchomi się minutę później.

## Pliki

| Plik | Rola |
|---|---|
| `js/game.js` | logika, rysowanie (canvas), cząsteczki, ustawienia, klawisze, autostart |
| `js/sound.js` | dźwięki syntezowane w Web Audio (syk lontu, tykanie, wybuch, plusk, fanfary, miau) |
| `js/props.js` | rzeczy na końcu lontu: rysunek, resztki po wybuchu, kolory eksplozji |
| `js/weather.js` | prognoza z Open-Meteo (bez klucza; wysyłane są tylko współrzędne miasta) |
| `css/style.css`, `index.html` | ekran 1920×1080 |
| `tools/make_icon.py` | rysuje `icon.png` |

Test w przeglądarce: `python3 -m http.server` w tym folderze. Klawisze Y/B
zastępują żółty i niebieski przycisk, Esc to Wstecz. W konsoli `TNT.demo(5000)`
odpala lont na 5 sekund.
