# Changelog

All notable changes to Bordy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-02-04

### Fixed
- **Task edit dialog closing unexpectedly** - Fixed a bug where the edit dialog would close when adding subtasks/checklist items, comments, or attachments. The issue was caused by `useEffect` resetting the editing state on every task object change instead of only when opening a different task.

## [2.1.0] - 2026-02-04

### Added
- **Attachments** - Attach images and files to tasks (up to 10MB per file)
  - Support for images (with lightbox preview) and documents
  - Drag & drop upload support
  - Attachments included in JSON export/import
- **Comprehensive Test Suite**
  - Unit tests with Jest + React Testing Library
  - E2E tests with Playwright (88 tests)
  - IndexedDB mocking with `fake-indexeddb`

### Changed
- IndexedDB schema updated to version 7 (added attachments store)

## [2.0.0] - 2026-02-03

### Added
- **Markdown Support** - Full markdown rendering in task descriptions and comments
  - Headers, bold, italic, lists, code blocks, links
  - GFM (GitHub Flavored Markdown) support with `remark-gfm`
  - Live preview in editor with toggle
- **Markdown Editor Component** - Rich editing experience with toolbar

### Changed
- Task descriptions and comments now render as Markdown
- Added `@tailwindcss/typography` for prose styling

## [1.5.0] - 2026-02-02

### Added
- **Task Comments/Notes** - Add notes and comments to tasks
  - Edit and delete comments
  - Timestamps on comments
  - Persisted in IndexedDB

## [1.4.0] - 2026-02-01

### Added
- **Agenda View** - List-based view organized by due date
  - Overdue, Today, Tomorrow, This Week, Later sections
  - Collapsible "No Date" section
- **View Mode Cycling** - Press `V` to cycle through views

## [1.3.0] - 2026-01-31

### Added
- **Calendar View** - View tasks in calendar format
  - Month and Week views
  - Drag & drop to change task due dates
  - Quick add tasks by clicking on days
  - Calendar keyboard shortcuts (`T`, `M`, `W`, `[`, `]`)

## [1.2.0] - 2026-01-30

### Added
- **Column Colors** - Color-code columns with 10 predefined colors
- **Task Priority** - Set priority levels (Critical, High, Medium, Low)
  - Visual indicators with colored borders
  - Filter by priority

## [1.1.0] - 2026-01-29

### Added
- **Keyboard Shortcuts** - Navigate and manage without mouse
  - `←`/`→` to switch boards
  - `N` for new task, `B` for new board
  - `D` to toggle theme
  - `?` to show help dialog
- **Subtasks/Checklists** - Break down tasks into smaller items
  - Progress tracking with visual bar
  - Check/uncheck in detail view

## [1.0.0] - 2026-01-28

### Added
- Initial release
- Multiple boards support
- Drag & drop for tasks and columns
- Labels/Tags system
- Due dates with visual indicators
- Board templates (9 built-in + custom)
- Search & filter functionality
- Dark/Light theme
- Import/Export as JSON
- 100% local storage with IndexedDB
