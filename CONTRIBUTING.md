# Contributing to DevSpeak AI

Thank you for your interest in contributing to **DevSpeak AI**! We welcome community contributions from software engineers, DevOps practitioners, SREs, technical writers, and AI enthusiasts.

This guide outlines our development workflow, coding standards, and pull request procedures.

---

## 1. Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat all community members with respect, professionalism, and empathy.

---

## 2. Getting Started

### Prerequisites
Ensure your local development environment meets the following requirements:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Python**: `3.12+`
- **Docker & Docker Compose**: `v24+` (Docker Desktop, Colima, or Podman)
- **Git**: `2.40+`

### Local Repository Setup
1. Fork the repository on GitHub and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/DevSpeak-AI.git
   cd DevSpeak-AI
   ```
2. Start the local multi-container stack:
   ```bash
   docker compose up -d --build
   ```
3. Access local endpoints:
   - Web Frontend: `http://localhost:3001`
   - FastAPI REST API: `http://localhost:8000`
   - Health Probe: `http://localhost:8000/readyz`
   - Swagger Documentation: `http://localhost:8000/docs`

---

## 3. Development Workflow

### Branch Naming Conventions
Create a descriptive feature branch from `main`:
- `feat/feature-name`: New features or interview scenarios
- `fix/bug-description`: Bug fixes or UI corrections
- `docs/topic-name`: Documentation updates or translations
- `refactor/component-name`: Code refactoring without behavior change
- `test/test-scope`: Unit or integration test additions

### Coding Standards

#### Frontend (`apps/web`)
- Framework: **Next.js 15 (App Router / Standalone)**, **React 19**, **TypeScript**, **Tailwind CSS**.
- Run type checking:
  ```bash
  npm --prefix apps/web run type-check
  ```
- Run linter:
  ```bash
  npm --prefix apps/web run lint
  ```
- Run frontend tests:
  ```bash
  npm --prefix apps/web test
  ```

#### Backend (`apps/api`)
- Framework: **FastAPI**, **Python 3.12**, **SQLAlchemy 2.0 (AsyncIO)**, **Pydantic v2**.
- Lint and format checks (Ruff):
  ```bash
  apps/api/.venv/Scripts/ruff check apps/api
  ```
- Run backend test suite (Pytest):
  ```bash
  apps/api/.venv/Scripts/python -m pytest apps/api/tests
  ```

---

## 4. Security & Quality Gates

Every Pull Request automatically triggers our automated DevSecOps CI pipeline:
1. **Gitleaks**: Scans for accidental secrets, API keys, or private certificates.
2. **Bandit**: Static Application Security Testing (SAST) on backend Python code.
3. **Ruff & ESLint**: Linting and formatting assertions.
4. **Pytest & Vitest**: 100% pass rate required across backend (70 tests) and frontend (58 tests).
5. **Next.js Build**: Standalone production compile validation.

> [!IMPORTANT]
> **Zero Secrets Policy**: Never commit `.env` files, production database connection strings, or personal API keys. Use `.env.example` templates for configuration variables.

---

## 5. Submitting a Pull Request (PR)

1. Ensure all local tests and linters pass cleanly.
2. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(studio): add keyword search to interview scenario selector"
   ```
3. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against the `main` branch of `nguyenlpn2015/DevSpeak-AI`.
5. Complete the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) with details of your changes and test evidence.

---

## 6. Questions & Community Support

If you have questions about architecture or need guidance:
- Check the [System Architecture Guide](./docs/ARCHITECTURE.md).
- Review the [Developer Operations Guide](./docs/OPERATIONS.md).
- Open a GitHub Discussion or create an Issue using our templates.
