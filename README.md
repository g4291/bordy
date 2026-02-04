# Bordy

A simple, fast, and privacy-focused task board application. All data is stored locally in your browser using IndexedDB - no server, no account required.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)

## ✨ Features
- **Multiple Boards** - Create and manage multiple boards
- **Multiple Boards** - Create and manage multiple Kanban boards
- **Drag & Drop** - Intuitive drag and drop for tasks and columns
- **Labels/Tags** - Organize tasks with colored labels
- **Dark/Light Theme** - Switch between themes based on your preference
- **Import/Export** - Backup and restore your data as JSON
- **100% Local Storage** - Your data never leaves your browser
- **No Account Required** - Start using immediately, no sign-up needed

## 🖼️ Screenshots

![Kanban Board](./screenshots/board.png)
![Kanban Board Dark](./screenshots/board-dark.png)
![Kanban Edit Task](./screenshots/task-edit.png)

## 🛠️ Tech Stack

- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [@dnd-kit](https://dndkit.com/) - Drag and drop
- [idb](https://github.com/jakearchibald/idb) - IndexedDB wrapper

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/kanban-board.git
   cd kanban-board
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

The build output will be in the `build/` folder, ready to be deployed to any static hosting service.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # App header with board management
│   ├── KanbanBoard.tsx  # Main board component
│   ├── KanbanColumn.tsx # Column component
│   ├── TaskCard.tsx     # Task card component
│   ├── LabelBadge.tsx   # Label display component
│   └── LabelManager.tsx # Label management dialogs
├── hooks/
│   ├── useKanban.ts     # Board, column, task & label logic
│   └── useTheme.ts      # Theme management
├── lib/
│   ├── db.ts            # IndexedDB setup
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx
└── index.css            # Tailwind & global styles
```

## 📦 Data Format

Export/Import uses JSON format (version 1.1.0):

```json
{
  "version": "1.1.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "boards": [...],
  "columns": [...],
  "tasks": [...],
  "labels": [...]
}
```

## 🗺️ Roadmap

- [ ] Due dates for tasks
- [ ] Search and filter (including by label)
- [ ] Keyboard shortcuts
- [ ] Task comments
- [ ] Subtasks / checklists
- [ ] Board templates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [dnd-kit](https://dndkit.com/) for the smooth drag and drop experience
- Built with the help of [Claude Opus 4](https://www.anthropic.com/claude) AI model via [AYETO.ai](https://ayeto.ai) platform
