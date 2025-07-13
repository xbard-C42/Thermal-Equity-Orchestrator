# Thermal Equity Orchestrator

An interactive React application that simulates justice-first thermal cooling strategies across urban neighborhoods. Leveraging AI-driven agents and radiative cooling techniques, this tool visualizes and prioritizes cooling deployment to maximize equity and impact.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Consciousness Council**: Four AI agents (Metamaterial Specialist, Cool Coating Coordinator, Weather Pattern AI, Justice Advocate) collaborate in real time.
- **Justice-First Logic**: Vulnerable areas (Critical & High risk) receive prioritized cooling.
- **Interactive Deployment**: Step-by-step orchestration with progress bar and dynamic metrics.
- **Equity Metrics**: Tracks total cooling achieved and equity score.
- **Responsive UI**: Dark/light mode, Tailwind CSS styling, Lucide iconography.

## Demo

> *Insert animated GIF or link to live demo here*

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/thermal-equity-orchestrator.git
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

## Usage

1. Open your browser at `http://localhost:3000` (or the port indicated).
2. Click **Start Thermal Justice AI** to begin the orchestration sequence.
3. Monitor the progress bar, active agents, and neighborhood temperatures.
4. Click **Reset** to restart the simulation.

Customize initial neighborhood data by editing `src/thermal-equity-orchestrator2.tsx`:

```ts
const initialNeighbourhoods = [ /* ... */ ];
```

## Project Structure

```
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── thermal-equity-orchestrator2.tsx  # Main orchestrator view
│   ├── index.tsx         # Application entry point
│   └── styles/           # Global CSS and Tailwind config
├── package.json
├── tsconfig.json
└── README.md             # Project overview
```

## Technologies

- **React** & **TypeScript**
- **Tailwind CSS** for utility-first styling
- **Lucide-React** icons
- **Vite** or **Create React App** for bundling (adjust per setup)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Commit your changes: \`git commit -m "feat: add new feature"
4. Push to the branch: `git push origin feat/new-feature`
5. Open a Pull Request and describe your changes

Please follow the [Microsoft TypeScript Style Guide](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines) and ensure all linting checks pass.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Created and maintained by **Your Name**. For questions or suggestions, open an issue or reach out at [[email@example.com](mailto\:email@example.com)].

