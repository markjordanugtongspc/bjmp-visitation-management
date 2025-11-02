---
trigger: always_on
---

# 🧩 Cascade Development Rules

## 🎨 Frontend Standards

- **Tailwind CSS v4.1 – Mobile Responsive**
  - All components must be styled using Tailwind CSS v4.1.
  - Ensure full responsiveness across mobile, tablet, and desktop breakpoints.

- **Theme Toggler Integration**
  - Always implement a theme toggle using `isDark` logic.
  - Use Tailwind’s `dark:` class for styling dark mode variants.
  - Always follow the current **dark color palette** for consistency.

- **Modals**
  - Use **SweetAlert2** for all modal dialogs (alerts, confirmations, prompts).
  - Ensure modals are also **theme-toggle aware**, adapting to both light and dark palettes.

- **Clickable Elements**
  - All buttons, icons, and interactive elements must include the `cursor-pointer` class for better UX feedback.

## 📄 File Handling

- **Document & Summary Generation**
  - Do **not** automatically generate documents or summary files.
  - Always ask for user confirmation before initiating file creation.

## 🧠 JavaScript Architecture

- **Modular Function Creation**
  - When creating new JavaScript functions, do **not** merge them into existing files.
  - Create a **new module** and import it into the main JavaScript file.
  - Use **modern JavaScript (ES6+)**, including:
    - Arrow functions
    - Async/await
    - Module imports/exports
    - Clean error handling

## 🔧 Backend Protocol

- **Validation Before Integration**
  - Always verify the following before backend integration:
    - API routes
    - Controllers
    - Models
    - Middleware (if applicable)
  - Ensure consistency between frontend requests and backend responses.