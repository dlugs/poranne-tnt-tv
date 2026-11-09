# Poranne TNT – przekazanie

Aplikacja na telewizor Samsung (Tizen), która mobilizuje dziecko do porannego wyjścia do
przedszkola: na ekranie pali się lont do godziny wyjścia, dziecko odhacza pilotem poranne
zadania, a kotek strażak gasi lont, gdy wszyscy zdążą. Jak nie zdążą – BUM (niegroźny, z konfetti).
Pełny opis ekranów i pilota: [README.md](README.md).

## Co jest w paczce

Kod źródłowy gotowy do zbudowania (czysty JS/ES5, bez kroku kompilacji). **Nie ma** gotowego
pliku `.wgt`: Samsung wymaga, żeby aplikacja była podpisana certyfikatem wystawionym dla
konkretnego telewizora, więc każdy buduje ją u siebie swoim certyfikatem (raz, ok. 30 min).

## Wymagania

- Telewizor Samsung Smart TV z Tizenem (testowane: UE55MU6472, Tizen 3.0, 2017; nowsze też powinny działać).
- Komputer w tej samej sieci (instrukcja dla macOS; Windows/Linux analogicznie).
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) z rozszerzeniem
  **TV Extensions** i **Samsung Certificate Extension** (Package Manager w Tizen Studio).
- Darmowe konto Samsung (do certyfikatu).

## Instalacja krok po kroku

1. **Tryb dewelopera na TV:** Aplikacje → na pilocie wpisz `1 2 3 4 5` → Developer Mode **ON**,
   *Host PC IP* = adres IP komputera → restart telewizora (wyłącz z prądu na chwilę).
2. **Adres TV:** Ustawienia → Ogólne → Sieć → Stan sieci → Ustawienia IP (np. `192.168.1.50`).
3. **Certyfikat:** Tizen Studio → Tools → Certificate Manager → `+` → **Samsung** → TV →
   utwórz profil o nazwie **`tv`** (autor + dystrybutor, zaloguj się kontem Samsung).
   Przy dystrybutorze podłączony TV zostanie dopisany po numerze DUID – telewizor musi być
   wtedy włączony i połączony (`sdb connect <IP_TV>:26101`).
4. **Ścieżka do narzędzi** (jeśli Tizen Studio nie jest w `~/tizen-studio`, ustaw `TIZEN_HOME`):
   ```sh
   export PATH="$HOME/tizen-studio/tools/ide/bin:$HOME/tizen-studio/tools:$PATH"
   ```
5. **Budowanie i instalacja:**
   ```sh
   TV_IP=192.168.1.50 ./build-and-install.sh
   ```
   Skrypt łączy się z TV, buduje i podpisuje `.wgt`, instaluje i uruchamia aplikację
   („Poranne TNT” w Aplikacjach). Inna nazwa profilu certyfikatu: `TIZEN_PROFILE=...`.

## Pierwsze uruchomienie – do ustawienia (żółty klawisz C)

- **Imię** dziecka w wołaczu (np. „Kasiu”) – bez imienia napisy są po prostu „Dzień dobry!”, „Brawo!”.
- **Godzina wyjścia** (domyślnie 8:30) i **start lontu** (7:45), **dni** (pn–pt).
- **Miasto** do pogody (Open-Meteo, bez klucza; wysyłane są tylko współrzędne miasta).
- **Autostart:** apka sama ustawia budzik systemowy, ale działa on tylko przy włączonym TV –
  ustaw w telewizorze *Ustawienia → Ogólne → Menedżer systemu → Czas → Timer włączenia*
  (np. 7:44 w dni robocze).
- **Restart dnia** – gdy dziecko naklika za dużo zadań.
- Niebieski klawisz D: pokaz próbny (lont na 1 minutę, nic nie zapisuje).

## Zmiany i rozwój

- Test bez telewizora: `python3 -m http.server` w tym folderze → http://localhost:8000
  (Y/B = żółty/niebieski, Esc = Wróć, w konsoli `TNT.demo(5000)`).
- Zadania, wyzwania dnia, rzeczy na końcu lontu: `js/game.js` i `js/props.js`; dźwięki: `js/sound.js`
  (syntezowane w Web Audio, bez plików).
- Telewizor ma stary silnik WebKit (Tizen 3.0): pisz w ES5 (bez `let`/`=>`/klas), bez CSS grid i zmiennych CSS.
- Dane (ustawienia, historia gwiazdek) są w `localStorage` telewizora.

## Znane ograniczenia

- Instalacja z trybu dewelopera jest „prywatna” – inny telewizor wymaga własnego certyfikatu (krok 3).
- Pogoda potrzebuje internetu; bez niego kafelki ubrań są domyślne.
- Wyłączenie trybu dewelopera lub reset TV może usunąć aplikację – wtedy wystarczy ponownie `build-and-install.sh`.
