# How to Run AniStream

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Backend

```bash
cd server
npm run dev
```

The server starts on port 5000 by default.

### 3. Start the Frontend

In a separate terminal:

```bash
cd client
npm start
```

The React app opens at `http://localhost:3000`.

### 4. Open the App

Navigate to `http://localhost:3000` in your browser. You can:
- Browse trending and recent anime on the home page
- Search for anime using the search bar
- View anime details and episode listings
- Watch trailers via the built-in video player

## Production Build

```bash
cd client
npm run build

cd ../server
NODE_ENV=production npm start
```

The server will serve both the API and the React build at `http://localhost:5000`.

