# 📇 Digital Contact Book App (Full-Stack Mini Project)

A modern, responsive, full-stack **Digital Contact Book** web application built with **Node.js, Express.js, HTML5, CSS3, and Vanilla JavaScript**. Featuring a RESTful API, persistent storage with auto-seeding, glassmorphism design, real-time search, category filtering, favorites pinning, vCard & CSV export/import, and direct communication integrations (Call, WhatsApp, Email).

---

## 🌟 Key Features

1. **Full CRUD Contact Operations**:
   - **Create**: Add new contacts with comprehensive fields (Name, Phone, Email, Category, Company, Address, Notes, and customizable Avatar badge colors).
   - **Read**: View contacts in dynamic **Grid View** or structured **List View**.
   - **Update**: Edit existing contact details with a pre-filled, validated modal form.
   - **Delete**: Safely delete contacts with an interactive confirmation modal to prevent accidental data loss.

2. **Instant Search & Real-Time Filtering**:
   - **Debounced Fuzzy Search**: Live filtering across names, phone numbers, email addresses, companies, and notes without lagging.
   - **Category Filter Tabs**: Quick filtering by *All, Work, Personal, Family, Friends, Emergency*.
   - **Sorting Options**: Sort by Name (A-Z), Name (Z-A), Favorites First, and Recently Added.

3. **Favorites & Quick Access**:
   - One-click star/pin icon to favorite contacts with immediate optimistic UI updates.

4. **Direct Communication Actions**:
   - 📞 **Direct Call**: One-click `tel:` link initiates a phone call.
   - 💬 **WhatsApp Integration**: Direct `https://wa.me/` link opens a pre-composed chat with the contact.
   - ✉️ **Direct Email**: Instant `mailto:` link launches your default mail client.
   - 📋 **Copy to Clipboard**: One-click quick copy with visual toast notifications.

5. **Data Portability (Export & Import)**:
   - **Export to CSV**: Download contacts in spreadsheet format (`contacts.csv`).
   - **Export to vCard (.vcf)**: Export standard vCards compatible with Apple Contacts, Google Contacts, and Outlook.
   - **Bulk Import**: Import contacts directly via JSON file.

6. **Rich Visual Aesthetics & UX**:
   - Glassmorphic card design with frosted glass blur effects (`backdrop-filter`).
   - **Dark / Light Mode**: Seamless theme toggle with persistent user preference in `localStorage`.
   - **Live Analytics Dashboard**: Real-time counters for Total Contacts, Favorites, and Category distribution.
   - Keyboard shortcuts (`/` or `Ctrl+K` to search, `Esc` to close dialogs).

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Browser Client [Frontend - Vanilla HTML5/CSS3/JS]
        UI[Glassmorphic UI View: Grid/List]
        AppCtrl[App Controller: app.js]
        ApiClient[API Client: api.js]
        ThemeEngine[Theme & LocalStorage]
    end

    subgraph Backend Server [Node.js + Express.js]
        Server[server.js - Express Server]
        Router[routes/contactRoutes.js]
        Controller[controllers/contactController.js]
        Model[models/contactModel.js]
    end

    subgraph Storage [Persistent Storage Layer]
        JSONDB[(data/contacts.json)]
    end

    UI -->|User Actions| AppCtrl
    AppCtrl -->|State / DOM Changes| UI
    AppCtrl -->|HTTP Requests| ApiClient
    ApiClient -->|REST API Calls (JSON)| Server
    Server --> Router
    Router --> Controller
    Controller --> Model
    Model -->|Read / Atomic Write| JSONDB
    JSONDB -->|Persistent Data| Model
    Model -->|JSON Response / CSV / VCF| Controller
    Controller -->|HTTP 200/201/400/404| ApiClient
    ApiClient -->|Render Contacts & Stats| AppCtrl
```

---

## 📁 Directory Structure

```text
FSD/
├── data/
│   └── contacts.json          # Persistent JSON database (auto-created & seeded)
├── controllers/
│   └── contactController.js   # Request handling, input validation, and business logic
├── models/
│   └── contactModel.js        # Data Access Layer, CRUD operations, CSV/VCF generation
├── routes/
│   └── contactRoutes.js       # Express REST API routes
├── public/                    # Frontend Client
│   ├── css/
│   │   └── styles.css         # Glassmorphism, CSS variables, dark/light themes
│   ├── js/
│   │   ├── api.js             # Client-side API fetch wrapper
│   │   └── app.js             # State management, DOM rendering, modal events
│   └── index.html             # Semantic Single Page Application layout
├── package.json               # Dependencies and npm scripts
├── server.js                  # Express backend entry point
└── README.md                  # Complete project documentation
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contacts` | Retrieve list of contacts | `search`, `category`, `isFavorite`, `sortBy` |
| `GET` | `/api/contacts/:id` | Get details of a single contact | None |
| `POST` | `/api/contacts` | Create a new contact | `{ name, phone, email, category, company, address, notes, isFavorite, avatarColor }` |
| `PUT` | `/api/contacts/:id` | Update an existing contact | Partial or full contact object |
| `PATCH` | `/api/contacts/:id/favorite` | Toggle favorite status | None |
| `DELETE`| `/api/contacts/:id` | Delete a contact | None |
| `GET` | `/api/contacts/stats` | Retrieve aggregate metrics | None |
| `GET` | `/api/contacts/export/csv` | Download contacts as CSV | None |
| `GET` | `/api/contacts/export/vcf` | Download contacts as vCard (.vcf) | None |
| `POST` | `/api/contacts/import` | Bulk import contacts | `{ contacts: [...] }` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### 2. Installation
Clone or navigate to the project directory and install the dependencies:
```bash
cd /Users/nitinsj/FSD
npm install
```

### 3. Running the Application
To start the production server:
```bash
npm start
```

Or run in development mode with automatic restart:
```bash
npm run dev
```

### 4. Accessing the Web Application
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🎓 Viva Voce & Presentation Q&A

### Q1: What architectural pattern is implemented in this mini project?
**Answer**: The project adheres to the **Model-View-Controller (MVC)** architectural pattern:
- **Model (`contactModel.js`)**: Encapsulates data structure, file I/O operations, data validation, and seeding logic.
- **View (`index.html` + `styles.css`)**: Presents the glassmorphic graphical interface and user controls to the client.
- **Controller (`contactController.js` + `app.js`)**: Processes requests, executes business logic, communicates between model and view, and formats responses.

### Q2: Why is debouncing used on the search input?
**Answer**: Debouncing introduces a short delay (250ms) before executing the search query. This prevents excessive API queries or DOM recalculations on every single keystroke, significantly improving responsiveness and reducing CPU overhead.

### Q3: How is data persisted without an external database service?
**Answer**: Data is managed via a persistent JSON file (`data/contacts.json`). The application checks for file existence on boot, automatically populates realistic initial seed data if absent, and performs safe writes on create, update, and delete actions. This eliminates third-party database configuration while preserving data across restarts.

### Q4: How is dark/light theme switching implemented?
**Answer**: Theme switching is implemented using **CSS Custom Properties (Variables)** mapped under `:root` and `[data-theme="light"]`. When the user clicks the theme toggle button, the `data-theme` attribute on the `<html>` tag updates dynamically and the choice is saved in browser `localStorage` for continuity across sessions.
# Digital-Contact-Book
