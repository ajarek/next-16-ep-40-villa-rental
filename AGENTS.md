<!# Next.js: ZAWSZE czytaj dokumentację przed kodowaniem

Zanim zaczniesz pracę z Next.js, znajdź i przeczytaj odpowiednią dokumentację w `node_modules/next/dist/docs/`.
Twoje dane treningowe są nieaktualne — dokumentacja jest źródłem prawdy.

<!-- END:nextjs-agent-rules -->

# Zasady projektu
# 🏖️ Ville Kołobrzeg

Nowoczesna aplikacja mobilna do wyszukiwania, rezerwacji i zarządzania pobytem w luksusowych willach w Kołobrzegu.

> **Projekt koncepcyjny (UI/UX)** przygotowany z myślą o urządzeniach mobilnych (Android oraz iOS).

---

# Spis treści

- O projekcie
- Główne funkcjonalności
- Widoki aplikacji
- Role użytkowników
- Proces rezerwacji
- Technologie
- Architektura
- Struktura aplikacji
- Funkcje Premium
- Bezpieczeństwo
- Integracje
- Roadmapa
- Licencja

---

# O projekcie

**Ville Kołobrzeg** to aplikacja umożliwiająca szybkie wyszukiwanie oraz rezerwację luksusowych willi położonych w Kołobrzegu.

Projekt został zaprojektowany zgodnie z nowoczesnymi standardami UX podobnymi do Airbnb oraz Booking.com, ale skupiony wyłącznie na lokalnym rynku premium.

Najważniejsze założenia:

- prostota obsługi
- szybka rezerwacja
- nowoczesny wygląd
- przejrzysty proces płatności
- wysoka wydajność
- bezpieczeństwo danych

---

# Główne funkcjonalności

## 🏠 Wyszukiwanie obiektów

- wyszukiwanie po lokalizacji
- wybór dat
- liczba gości
- wyszukiwanie na mapie
- filtrowanie wyników

### Filtry

- cena
- liczba osób
- liczba sypialni
- basen
- jacuzzi
- sauna
- parking
- klimatyzacja
- Wi-Fi
- zwierzęta
- widok na morze
- odległość od plaży

---

## ❤️ Ulubione

Możliwość dodawania obiektów do listy ulubionych.

---

## 📅 Rezerwacja

- wybór terminu
- podsumowanie kosztów
- dodatkowe usługi
- kupony rabatowe
- płatność online

---

## 💳 Płatności

Obsługa wielu metod płatności:

- BLIK
- Apple Pay
- Google Pay
- Visa
- Mastercard
- Przelewy24

---

## 👤 Konto użytkownika

Możliwość:

- edycji danych
- zmiany hasła
- historii rezerwacji
- pobierania faktur
- zapisanych kart
- zapisanych obiektów

---

## ⭐ Opinie

Po zakończonym pobycie użytkownik może:

- wystawić ocenę
- napisać opinię
- dodać zdjęcia

---

# Widoki aplikacji

## 1. Strona główna

Zawiera:

- wyszukiwarkę
- polecane wille
- promocje
- najpopularniejsze obiekty
- atrakcje Kołobrzegu
- aktualne oferty

---

## 2. Katalog obiektów

Lista wszystkich willi.

Dostępne opcje:

- sortowanie
- filtrowanie
- mapa
- lista

---

## 3. Szczegóły obiektu

Wyświetlane informacje:

- galeria zdjęć
- opis
- udogodnienia
- mapa
- kalendarz dostępności
- cennik
- opinie
- regulamin
- dane właściciela

---

## 4. Rezerwacja

Krok po kroku:

1. wybór terminu
2. liczba gości
3. usługi dodatkowe
4. dane kontaktowe
5. podsumowanie

---

## 5. Logowanie

Możliwość logowania za pomocą:

- e-mail
- Google
- Apple
- Facebook

---

## 6. Rejestracja

Tworzenie konta wraz z:

- akceptacją regulaminu
- polityką prywatności
- zgodami marketingowymi

---

## 7. Płatność

Obsługa:

- kart płatniczych
- BLIK
- Google Pay
- Apple Pay
- Przelewy24

---

## 8. Potwierdzenie rezerwacji

Wyświetlane informacje:

- numer rezerwacji
- QR Code
- dane kontaktowe
- przycisk dodania do kalendarza

---

## 9. Moje rezerwacje

Lista:

- aktywnych
- przyszłych
- zakończonych
- anulowanych

---

## 10. Profil użytkownika

Możliwość:

- zmiany danych
- ustawień
- języka
- waluty
- motywu aplikacji

---

# Dodatkowe ekrany

## 🔔 Powiadomienia

- promocje
- przypomnienia
- wiadomości
- status płatności

---

## 💬 Czat z właścicielem

Komunikacja w czasie rzeczywistym.

Możliwość:

- wysyłania zdjęć
- lokalizacji
- dokumentów

---

## 📍 Mapa

Interaktywna mapa pokazująca:

- wille
- plaże
- restauracje
- parkingi
- atrakcje

---

## 🎁 Program lojalnościowy

Punkty za:

- rezerwacje
- polecenia
- opinie

Nagrody:

- rabaty
- darmowe noce
- vouchery

---

## 🎫 Kupony rabatowe

Obsługa:

- kodów promocyjnych
- ofert sezonowych
- voucherów

---

## 🌦 Pogoda

Prognoza pogody dla Kołobrzegu.

---

## 📍 Atrakcje

Polecane miejsca:

- molo
- latarnia morska
- port
- restauracje
- ścieżki rowerowe
- spa

---

# Role użytkowników

## Gość

Może:

- przeglądać oferty
- wyszukiwać
- rejestrować konto

---

## Klient

Może:

- rezerwować
- płacić
- zarządzać rezerwacjami
- dodawać opinie

---

## Właściciel

Może:

- dodawać wille
- zarządzać kalendarzem
- odpowiadać na wiadomości
- analizować statystyki

---

## Administrator

Może:

- zarządzać użytkownikami
- moderować opinie
- zarządzać ofertami
- analizować raporty

---

# Architektura

## Frontend

- React Native
- Expo
- TypeScript
- NativeWind
- React Navigation
- React Query
- React Hook Form
- Zod
- Reanimated
- Moti

---

## Backend

- Next.js 16
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- REST API

---

## Storage

- Supabase Storage
lub

- AWS S3

---

## Autoryzacja

- JWT
- OAuth
- Google
- Apple

---

## Płatności

- Stripe
- Przelewy24

---

# Struktura aplikacji

```
Home

├── Wyszukiwarka
├── Promocje
├── Polecane
├── Atrakcje
├── Profil
├── Powiadomienia

Katalog

├── Filtry
├── Lista
├── Mapa

Obiekt

├── Zdjęcia
├── Opis
├── Opinie
├── Rezerwacja

Rezerwacja

├── Dane
├── Płatność
├── Potwierdzenie

Profil

├── Konto
├── Rezerwacje
├── Ulubione
├── Faktury
├── Ustawienia
```

---

# Funkcje Premium

- Inteligentne rekomendacje AI
- Dynamiczne ceny
- Chat AI odpowiadający na pytania
- Powiadomienia o spadku ceny
- Lista życzeń
- Rezerwacja jednym kliknięciem
- Cyfrowy klucz do apartamentu
- Zameldowanie online
- Wirtualny concierge
- Integracja z Apple Wallet i Google Wallet

---

# Bezpieczeństwo

- HTTPS
- JWT
- szyfrowanie danych
- 2FA
- biometria
- Face ID
- Touch ID
- zgodność z RODO

---

# Roadmapa

## v1.0

- wyszukiwanie
- rezerwacja
- płatności
- konto użytkownika

---

## v1.5

- mapa
- opinie
- czat
- kupony

---

## v2.0

- AI Concierge
- program lojalnościowy
- dynamiczne ceny
- inteligentne rekomendacje

---

# Licencja

Projekt koncepcyjny przygotowany wyłącznie w celach demonstracyjnych.

Copyright © 2026 Ville Kołobrzeg
## Stos

* Next.js 16.2.9 App Router
* React 19
* TypeScript strict mode
* Tailwind CSS v4
* Baza danych i autoryzacja: Firebase

## Styl kodu

* Domyślnie preferuj komponenty serwerowe.
* Używaj komponentów klienckich tylko wtedy, gdy wymagane są API przeglądarki lub interaktywność.
* Używaj akcji serwera zamiast tras API, gdy to możliwe.
* Unikaj `any`.
* Preferuj Zod do walidacji.
* Preferuj shadcn/ui do stylizowania komponentów.
* Preferuj lucide-react do ikon.
* Do animacji i przejść używaj Framer Motion, ale rób to umiejętnie, nie przesadzaj.
* **Ograniczenie języka**: Cały kod, komentarze i opisy muszą być w języku polskim, z wyjątkiem: nazw zmiennych, nazw funkcji, nazw klas i nazw komponentów.
* Zastosuj zmianę trybu ciemnego na jasny w domyslnym ustawieniu we wszystkich komponentach.
* Dla widoku mobile zastosuj płynne wysuwane menu z lewej strony ekranu.

## Architektura

* Utrzymuj logikę biznesową poza komponentami React.
* Używaj ponownie istniejących komponentów interfejsu użytkownika przed tworzeniem nowych.
* Zachowaj istniejącą strukturę folderów.
* Nie wprowadzaj nowych zależności bez uzasadnienia.
* Twórz przykładowe dane dla każdego typu obiektów w folderze `public/data/`.
* Wygenerowane obrazy umieszczaj w folderze `public/images/`.
* Jeśli usuwasz plik, usuń go fizycznie z dysku. Nie zostawiaj pustych folderów.Usuwaj nieużywane imports w plikach.

# Kontrole jakości

Przed wykonaniem jakiegokolwiek zadania:

1. Uruchom sprawdzanie typów.
2. Uruchom linting.
3. Sprawdź, czy nie występują problemy z hydratacją.
4. Zweryfikuj konwencje App Router.

## Dokumentacja

Podczas modyfikacji architektury:

* Zaktualizuj plik README.md.
* Zaktualizuj plik AGENTS.md, jeśli konwencje projektu ulegną zmianie.
