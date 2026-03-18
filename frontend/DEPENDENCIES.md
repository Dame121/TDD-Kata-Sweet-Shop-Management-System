# Frontend Dependencies Documentation

## 📦 Core Dependencies

These are the essential libraries required for the React application to function.

| Package | Required Version | Purpose |
|---------|-----------------|---------|
| **react** | ^19.1.0 | Core React library for building UI components |
| **react-dom** | ^19.1.0 | React package for working with the DOM |
| **react-router-dom** | ^7.6.2 | Client-side routing and navigation |
| **axios** | ^1.10.0 | HTTP client for API requests |
| **lucide-react** | ^0.523.0 | Icon library for React components |

### Installation
```bash
npm install react@19.1.0 react-dom@19.1.0 react-router-dom@7.6.2 axios@1.10.0 lucide-react@0.523.0
```

---

## 🎨 Build and Styling Dependencies

Tools for development, building, and styling the application.

| Package | Required Version | Purpose |
|---------|-----------------|---------|
| **vite** | ^7.0.0 | Fast build tool and development server |
| **tailwindcss** | ^3.4.3 | Utility-first CSS framework for styling |
| **@vitejs/plugin-react** | ^4.5.2 | Vite plugin for React fast refresh |
| **postcss** | Latest | CSS transformation tool (required for Tailwind) |
| **autoprefixer** | Latest | PostCSS plugin for vendor prefixes |

### Installation
```bash
npm install --save-dev vite@7.0.0 tailwindcss@3.4.3 @vitejs/plugin-react@4.5.2 postcss autoprefixer
```

---

## 🔄 Redux Dependencies (Optional)

These packages are only needed if you're using Redux for state management.

| Package | Required Version | Purpose |
|---------|-----------------|---------|
| **react-redux** | ^9.2.0 | React bindings for Redux |
| **@reduxjs/toolkit** | ^2.9.0 | Redux state management toolkit |
| **@types/react-redux** | ^7.1.34 | TypeScript types for React-Redux |

### Installation (If Using Redux)
```bash
npm install react-redux@9.2.0 @reduxjs/toolkit@2.9.0
npm install --save-dev @types/react-redux@7.1.34
```

### Note
> ⚠️ Redux is **optional** and not required for basic applications. Only install if your application needs centralized state management.

---

## 📋 Current Project Dependencies

To see your current dependencies, run:
```bash
npm list
```

To update all packages:
```bash
npm update
```

To install all dependencies (from package.json):
```bash
npm install
```

---

## 🔍 Checking Installed Versions

```bash
# Check a specific package version
npm list react

# Check all outdated packages
npm outdated

# Check all installed packages
npm list --all
```

---

## ⚠️ Important Notes

1. **Node Modules**: The `node_modules/` folder is gitignored and not included in version control
2. **package-lock.json**: This file locks dependency versions for consistency across environments
3. **Installation**: Always run `npm install` after cloning the repository to install all dependencies
4. **Updates**: Be cautious when updating packages; test thoroughly before committing major version updates

---

## 📚 Related Documentation

- [Routing Setup Instructions](./ROUTING_SETUP.md) - How to configure React Router
- [Vite Configuration](./vite.config.js) - Build tool configuration
- [Tailwind Configuration](./tailwind.config.js) - Styling framework setup
- [PostCSS Configuration](./postcss.config.js) - CSS processing setup
