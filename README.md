# Gather — frontend

Frontend Gather jest aplikacją React zbudowaną przy użyciu Vite. Widoki korzystają z wydzielonych komponentów i modułów API.

## Uruchomienie lokalne

Polecenia wykonaj z katalogu `frontend/`:

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

Obraz frontendu zawiera statyczny build Reacta serwowany przez Nginx. Aby zbudować i uruchomić go samodzielnie:

```bash
docker build -t gather-frontend ./frontend
docker run --rm -p 8080:80 gather-frontend
```

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
