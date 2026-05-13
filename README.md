# ✅ Todo List App

A stylish todo application with add, delete, edit, and mark-complete features. Built with vanilla HTML, CSS, and JavaScript with a dark glassmorphism design.

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

- **Add tasks** with a priority level (High / Normal / Low)
- **Mark complete** with an animated circular checkbox
- **Edit tasks** inline — click ✏️, press Enter to save or Escape to cancel
- **Delete tasks** with a slide-out animation
- **Filter** by All / Active / Done
- **Clear all** completed tasks at once
- **Progress bar** showing overall completion percentage
- **Character counter** (120 char limit)
- **Timestamps** showing when each task was added
- **Persistent storage** — tasks survive page refreshes via `localStorage`

## Project Structure

```
todo-app/
├── index.html    # App shell and markup
├── style.css     # Dark glassmorphism styles
└── script.js     # Task logic, filters, localStorage
```

## Getting Started

No dependencies required. Open directly in a browser:

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
# or
python -m http.server 8080
```

## Design

- Deep space gradient background with ambient glow blobs
- Glassmorphism cards with `backdrop-filter: blur`
- Purple gradient accent color scheme
- Smooth spring animations on task add/remove
- Priority color-coded left accent bars (🔴 High / 🟢 Low / 🟣 Normal)
- Fully responsive for mobile

## Tech Stack

- **HTML5** — semantic markup, `aria-live` for accessibility
- **CSS3** — custom properties, glassmorphism, keyframe animations
- **JavaScript (ES6+)** — localStorage, event delegation, inline editing
