# Gather — frontend

Frontend Gather jest aplikacją React zbudowaną przy użyciu Vite. Widoki korzystają z wydzielonych komponentów i modułów API.

## Uruchomienie lokalne

Logowanie korzysta z puli Cognito utworzonej przez Terraform. Po wdrożeniu zasobów uruchom z katalogu głównego projektu:

```bash
python3 scripts/sync_terraform_env.py
```

Skrypt uzupełnia `frontend/.env` i — jeśli istnieje — `frontend/.env.local`, zachowując inne ustawienia. Identyfikatory Cognito są publiczne i nie są sekretami.

Frontend obsługuje rejestrację e-mail/hasło, potwierdzanie adresu kodem e-mail, logowanie, reset hasła przez kod wysłany przez Cognito oraz wylogowanie. Po zalogowaniu automatycznie dołącza access token Cognito do wywołań API. Załączniki wysyła i pobiera bezpośrednio z S3 za pomocą krótkotrwałych signed URL-i.

Kod pokoju jest widoczny w nagłówku aktywnego pokoju. Aby wejść do innego pokoju, wybierz „Dołącz kodem” w panelu bocznym i wpisz udostępniony kod.
Wiadomości w aktywnym pokoju są odświeżane automatycznie co 4 sekundy, więc uczestnicy widzą wiadomości innych osób bez przeładowania strony.

Następnie uruchom frontend z katalogu `frontend/`:

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:5173`. W trybie developerskim frontend domyślnie łączy się z API pod `http://localhost:8000`.

Inny adres API można ustawić przez zmienną środowiskową przed uruchomieniem Vite:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

Build produkcyjny:

```bash
npm run build
npm run preview
```

## Docker

Obraz frontendu zawiera statyczny build Reacta serwowany przez Nginx. Vite wczytuje `frontend/.env` podczas budowania obrazu. Po zmianie wartości w pliku wykonaj ponowny build (`docker compose up --build`), zwykłe `docker compose up` nie przebudowuje istniejącego obrazu.

```bash
docker build -t gather-frontend ./frontend
docker run --rm -p 8080:80 gather-frontend
```

Identyfikatory Cognito są częścią konfiguracji publicznego klienta frontendowego i zostaną wbudowane w statyczny JavaScript, nie są sekretami. Nie zapisuj sekretów ani kluczy AWS w `frontend/.env`.

Domyślnie Nginx przekazuje żądania `/api` do hosta `backend` na porcie `8000`, jak w konfiguracji Docker Compose projektu. Przy osobnym uruchomieniu frontendu należy zapewnić osiągalny host `backend` albo dostosować upstream w `nginx.conf` do adresu backendu.

Jeśli frontend ma łączyć się bezpośrednio z publicznym API zamiast przez proxy Nginx, ustaw adres API w czasie budowania obrazu:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t gather-frontend ./frontend
```

W takim wdrożeniu backend musi zezwalać na pochodzenie frontendu w konfiguracji CORS.

W projekcie można uruchomić oba moduły poleceniem `docker compose up --build` z katalogu głównego. Frontend będzie dostępny pod `http://localhost:8080`.

## Struktura

```text
src/
  api/         # Klient HTTP i wywołania endpointów
  components/  # Współdzielone elementy interfejsu
  views/       # Widoki aplikacji
  utils/       # Funkcje pomocnicze
  App.jsx      # Komponent główny
  main.jsx     # Punkt wejścia Reacta
```
