# Thermal Equity Orchestrator



&#x20; &#x20;

An interactive React application that simulates justice-first thermal cooling strategies across urban neighborhoods. Leveraging AI-driven agents and radiative cooling techniques, this tool visualizes and prioritizes cooling deployment to maximize equity and impact.

---

## 🌐 Table of Contents

- [✨ Features](#-features)
- [🎬 Demo](#-demo)
- [⚙️ Installation](#️-installation)
- [🚀 Usage](#-usage)
- [📂 Project Structure](#-project-structure)
- [🛠️ Technologies](#️-technologies)
- [📈 GitHub Stats](#-github-stats)
- [🤝 Contributing](#-contributing)
- [⚖️ License](#️-license)
- [📞 Contact](#-contact)

## ✨ Features

- **Consciousness Council**: Four AI agents collaborate in real time (Metamaterials, Cool Coatings, Weather Patterns, Justice Advocacy).
- **Justice-First Logic**: Vulnerable areas (Critical & High risk) receive prioritized cooling.
- **Interactive Deployment**: Step-by-step orchestration with progress bar, animated transitions, and dynamic metrics.
- **Equity Dashboard**: Real-time visualizations of total cooling and equity score with smooth CSS animations.
- **Dark & Light Mode**: Toggle theme with seamless transitions.

## 🎬 Demo

> *[Live demo here](https://42.community/c42os-thermal-equity-orchestrator/)*

---

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/xbard-C42/thermal-equity-orchestrator.git
   cd thermal-equity-orchestrator
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or yarn install
   ```

3. **Run in development mode**

   ```bash
   npm run dev
   # or yarn dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

---

## 🚀 Usage

1. Navigate to `http://localhost:3000` in your browser.
2. Click **Start Thermal Justice AI** to begin orchestration.
3. Watch agents deploy, temperatures drop, and equity score rise with animated charts.
4. Use the **Reset** button or keyboard shortcut (⌘+R) to restart the simulation.

Customize initial data in `src/thermal-equity-orchestrator2.tsx`:

```ts
const initialNeighbourhoods = [ /* ... */ ];
```

---

## 📂 Project Structure

```plain
├── public/               # Static assets (icons, images)
├── src/
│   ├── components/       # Reusable UI components (cards, buttons, charts)
│   ├── hooks/            # Custom React hooks (useAgents, useEquityMetrics)
│   ├── thermal-equity-orchestrator2.tsx  # Main orchestrator view
│   ├── index.tsx         # App entry point
│   └── styles/           # Tailwind config & global CSS
├── .github/workflows/    # CI/CD pipelines
├── package.json
├── tsconfig.json
└── README.md             # Project overview
```

---

## 🛠️ Technologies

&#x20; &#x20;

---

## 📈 GitHub Stats





---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow the [Microsoft TypeScript Style Guide](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines) and ensure all lint checks pass.

---

## ⚖️ License

See [LICENSE](LICENSE) for details.

---

## 📞 Contact

Maintained by **xbard**. Questions or feedback? [Open an issue](https://github.com/xbard-C42/thermal-equity-orchestrator/issues) or email at [research@42.community](mailto\:research@42.community).



