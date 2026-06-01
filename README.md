# CineHub — Professional Movie Explorer Portal

CineHub is a high-fidelity, fullstack web application designed for browsing, searching, and inspecting movie records. It features a minimalist typographic brand design, light-accent color schemes, fully interactive responsive touch pagination, and fluid micro-animations.

---

## ✨ Key Features

### 1. Minimal Typographic Brand Design
- A clean, professional aesthetic tailored for institutional or enterprise use.
- Replaced graphical emojis and icons with elegant sans-serif typographies, a navy blue color palette, and subtle blue accent rules.
- Fully optimized layouts utilizing Google Fonts (**Inter**).

### 2. High-Fidelity Responsive Hover Effects
- **Buttery Transforms**: Cards elevate `-5px` and scale `scale(1.02)` on mouse hover using a custom `cubic-bezier(0.16, 1, 0.3, 1)` transition curve.
- **Brand Glow**: Soft accent colored shadows expand on hover: `box-shadow: 0 12px 28px rgba(26, 86, 164, 0.12)`.
- **Typographic Shifts**: Title text shifts to brand-blue, ratings badges scale and transition to bright gold, and footer directional arrows slide out (`translateX(6px) scale(1.15)`) to direct clicks.
- **Interactive Metadata**: Detail view tiles dynamically float and float shadows on hover.

### 3. Customized Entities Pagination & Live Count
- **Flexible Dropdown**: Choose between **4**, **8**, **12**, **24**, or **48** entries per page. These counts align perfectly with the responsive grid columns.
- **Live Statistics**: Displays real-time ranges like **`Showing X to Y of Z records`** based on active search queries and pages.
- **Responsive Page Selection**: Interactive centered numeric page button listings (`← Prev`, `1`, `2`, `3`, ..., `Next →`) that resize and stack cleanly on mobile viewports.
- **Search Boundaries Correction**: Autoresets current navigation to page `1` when filters update to prevent blank result states.

### 4. Fully Responsive Web Layouts
- Adapts fluidly across all modern viewports:
  - **Desktops**: 4-column card grid.
  - **Horizontal Tablets**: 3-column grid.
  - **Tablets/Large Phones**: 2-column grid.
  - **Portrait Mobile Phones**: 1-column grid, compact container margins, vertical footer listings, and touch-optimized touch targets.

### 5. Detailed Records Page
- Comprehensive meta inspect tiles (Release Date, Runtime, Vote Average, and Synopsis panels).
- Localized date formatting matching individual browser settings (`Intl.DateTimeFormat`).
- Interactive breadcrumbs and clean back navigation.

---

## 🛠️ Technology Stack

- **Frontend**: React (ES6+, Functional Hooks, CSS3 Custom Properties)
- **Backend**: Node.js, Express API server
- **Styling**: Vanilla CSS3
- **Development Tooling**: Concurrent Webpack dev server & Express watcher, Proxy middleware integration

---

## 🚀 Installation & Local Development

### 1. Install Dependencies
Run the following command at the root of the workspace directory:
```bash
npm install
```

### 2. Run the Development Environment
To start both the front-end React dev server (listening on port `3000`) and the dynamic Express API server (listening on port `3001` with requests proxied via proxy middleware):
```bash
npm run development
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run Production Bundle
To build the React production assets and serve them fully integrated over a single Node.js express listener (port `3000`):
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 GitHub Pages Deployment Guide

**Important Context**: GitHub Pages is a **static web hosting service**. It does not run live server-side environments like Node.js or Express. To successfully deploy and run CineHub online, select one of the two standard deployment approaches:

### Approach A: Standalone Static Mocking (Easiest & Free)
Since the Express backend operates primarily as a read-only provider for the JSON dataset, you can bundle the data directly into your frontend build to run completely standalone without a live server.

1. **Move Dataset to Public Directory**:
   Copy the `movies_metadata.json` dataset to the `public/` folder so it compiles with the static build:
   - Copy `server/movies_metadata.json` $\rightarrow$ `public/movies_metadata.json`.
2. **Refactor Fetch Route**:
   Update `fetchMovies` in `src/App.js` to fetch directly from the static file assets instead of `/api/movies`:
   ```javascript
   // Change from:
   const res = await fetch('/api/movies');
   // Change to:
   const res = await fetch('/movies_metadata.json');
   ```
3. **Deploy with `gh-pages`**:
   Install the `gh-pages` helper package:
   ```bash
   npm install --save-dev gh-pages
   ```
   Add the following deployment keys to your `package.json`:
   ```json
   "homepage": "https://<your-username>.github.io/<your-repo-name>",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
   Then trigger the deployment pipeline:
   ```bash
   npm run deploy
   ```

---

### Approach B: Decoupled Fullstack Hosting (Dynamic Backend)
Keep the Express backend fully active by hosting it on a dynamic API service, while hosting the static React user interface on GitHub Pages.

1. **Host the Express API Server**:
   Upload the server folder (`server/`) and dataset to a dynamic hosting platform (e.g., **Render**, **Railway**, **Fly.io**, or **Vercel**). Set up your environment so that your live Express server listens at a public web URL, for example: `https://my-cinehub-api.onrender.com`.
2. **Enable Cross-Origin Resource Sharing (CORS)**:
   Install `cors` on your Express app so it permits queries from other domains (like your GitHub Pages domain):
   ```bash
   npm install cors
   ```
   In `server/server.js`, integrate the middleware:
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```
3. **Configure API Endpoint in React**:
   Modify the fetch URL inside `src/App.js` to target your deployed backend instead of local proxies:
   ```javascript
   const API_URL = process.env.NODE_ENV === 'production' 
     ? 'https://my-cinehub-api.onrender.com' 
     : '';
   
   // Fetch movies
   const res = await fetch(`${API_URL}/api/movies`);
   ```
4. **Deploy static frontend**:
   Configure the `homepage` and run `npm run deploy` to upload the static build to GitHub Pages.

---

## 📂 Project Directory Structure

```text
CineHub/
├── public/                # HTML Entry point & favicons
├── server/                # Node.js + Express API Backend
│   ├── server.js          # API endpoints & server setup
│   └── movies_metadata.json # Dataset
├── src/                   # React Frontend
│   ├── App.js             # Main components, pagination, detailed view
│   ├── index.css          # CSS Design Tokens & custom transitions
│   └── setupProxy.js      # Middleware routing
├── package.json           # Scripts and dependencies
└── README.md              # Project documentation
```
