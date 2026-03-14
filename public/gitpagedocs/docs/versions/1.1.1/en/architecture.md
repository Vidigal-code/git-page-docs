# Architecture

This project uses a modular architecture to keep rendering, theme loading and UI concerns isolated.

## Core layers

- `src/app`: Next.js routes and shell
- `src/entities/docs`: models and loading logic
- `src/widgets/docs-shell`: layout and interactions
