## Description
<!-- Provide a clear, concise summary of the changes proposed in this Pull Request. -->

## Motivation & Context
<!-- Why is this change required? What problem does it solve? If it fixes an open issue, link it here: e.g., Fixes #12 -->

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] UI / UX enhancement (visual refinement or layout improvement)
- [ ] Documentation update (improving guides, specs, or runbooks)
- [ ] Performance / FinOps optimization
- [ ] CI/CD / DevOps / Infrastructure update

## Architectural Verification Checklist
- [ ] My code follows the code style guidelines of this project (`npm run lint`, `ruff check .`).
- [ ] I have verified that all unit and integration tests pass:
  - Frontend: `npm --prefix apps/web test` (Vitest)
  - Backend: `apps/api/.venv/Scripts/python -m pytest apps/api/tests` (Pytest)
- [ ] I have performed a self-review of my own code.
- [ ] I have verified that **zero secrets, credentials, or API keys** are present in my commits or diffs.
- [ ] My changes do not introduce breaking database migrations without backwards compatibility.
- [ ] Documentation has been updated accordingly (if applicable).

## Verification Evidence
<!-- Paste terminal command output or test summary showing passing results. -->
```text

```
