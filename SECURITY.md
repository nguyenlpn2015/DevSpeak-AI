# Security Policy: DevSpeak AI

DevSpeak AI is built with a **Security-First** and **DevSecOps** mindset. We appreciate the responsible disclosure of security vulnerabilities by researchers, candidates, and contributors.

---

## 1. Supported Versions

Security patches and dependency updates are actively maintained for the following release branch:

| Version | Supported | Status |
| :--- | :--- | :--- |
| **1.0.x** (Current: `v1.0.2`) | :white_check_mark: Yes | Active Production & Portfolio Release |
| `< 1.0.0` | :x: No | Deprecated Pre-release Milestones |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, privacy leak, or authentication flaw in DevSpeak AI, **please DO NOT open a public GitHub issue**.

Instead, please report it through one of the following private channels:

1. **GitHub Private Security Advisory (Preferred)**:
   - Navigate to the [Security tab of this repository](https://github.com/nguyenlpn2015/DevSpeak-AI/security/advisories).
   - Click **Report a vulnerability** to submit a private draft advisory.
2. **Repository Maintainer**:
   - If GitHub Advisory is unavailable, open a confidential communication with the maintainer via GitHub profile contact.

### What to Include in Your Report
To accelerate investigation and remediation, please provide:
- A concise description of the vulnerability (e.g., BOLA/IDOR, XSS, rate-limit bypass, secret exposure).
- Affected file(s), endpoint(s), or architectural components.
- Step-by-step reproduction instructions or a minimal proof of concept (PoC).
- Potential impact on candidate privacy or cloud infrastructure integrity.

### Our Commitment
- **Initial Response**: We aim to acknowledge receipt of security reports within **48 hours**.
- **Assessment & Triage**: We will confirm the vulnerability, assign a severity rating (CVSS), and keep you informed of remediation progress.
- **Coordinated Disclosure**: We request that you maintain confidentiality until an official patch has been deployed and released.

---

## 3. Security Architecture & Controls

DevSpeak AI incorporates defense-in-depth measures across all layers:
- **Zero Static Credentials**: CI/CD uses GitHub Actions with **Keyless Workload Identity Federation (WIF)**. Production deployment service accounts are strictly bound to `refs/heads/main`.
- **Stateless Authentication & Memory-Hard Hashing**: Passwords hashed with **Argon2id** (memory cost 64MB, parallelism 4); API endpoints authenticated via signed stateless JWT tokens.
- **Local-First & Candidate Privacy**: The default deployment uses a deterministic Heuristic Mock AI provider, ensuring candidate interview responses are never transmitted to external commercial LLMs without explicit configuration.
- **Automated DevSecOps Quality Gates**: Every push and PR is scanned using Gitleaks (secret detection), Bandit (Python SAST), Ruff, and Trivy container vulnerability scanning.

For deep technical architectural details and STRIDE analysis, see:
- 🛡️ [System Security Architecture & Controls](./docs/SECURITY.md)
- 🎯 [STRIDE Threat Model & Remediation Matrix](./docs/THREAT_MODEL.md)
