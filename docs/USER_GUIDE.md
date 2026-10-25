# DevSpeak AI — Candidate User Guide (End-User Manual)

**Target Audience**: Software Engineers, DevOps Engineers, SREs, Cloud & Platform Engineers, and International IT Professionals  
**Application Release**: DevSpeak AI v1.0.2 (Bilingual English / Vietnamese)  
**Supported Environments**: Web Browsers (Desktop, Tablet, Mobile) across all 5 operational environments  

---

## Table of Contents

1. [Product Overview & Prerequisites](#1-product-overview--prerequisites)
2. [Accessing the Application Across Environments](#2-accessing-the-application-across-environments)
3. [Registration, Sign In & Guest Mode](#3-registration-sign-in--guest-mode)
4. [Dashboard & Navigation (LinguaFlow Design)](#4-dashboard--navigation-linguaflow-design)
5. [Browsing & Filtering the Question Bank](#5-browsing--filtering-the-question-bank)
6. [Practicing in the 3-Zone AI Interview Studio](#6-practicing-in-the-3-zone-ai-interview-studio)
7. [Submitting Answers & Interpreting AI Evaluation Reports](#7-submitting-answers--interpreting-ai-evaluation-reports)
8. [Candidate Assistance Tools: Technical Vocabulary & STAR Framework](#8-candidate-assistance-tools-technical-vocabulary--star-framework)
9. [Interactive Multi-Turn Interview Dialogue Engine](#9-interactive-multi-turn-interview-dialogue-engine)
10. [Voice Practice Mode (Web Speech API) & Browser Compatibility](#10-voice-practice-mode-web-speech-api--browser-compatibility)
11. [Progress Tracking, Experience Points (XP) & Day Streaks](#11-progress-tracking-experience-points-xp--day-streaks)
12. [Bilingual Switching (English / Vietnamese)](#12-bilingual-switching-english--vietnamese)
13. [Troubleshooting Common Issues](#13-troubleshooting-common-issues)
14. [Privacy Policy & Local-First Security Architecture](#14-privacy-policy--local-first-security-architecture)
15. [Frequently Asked Questions (FAQ)](#15-frequently-asked-questions-faq)
16. [Current Capabilities & Upcoming Roadmap](#16-current-capabilities--upcoming-roadmap)

---

## 1. Product Overview & Prerequisites

### 1.1. Purpose
**DevSpeak AI** is a specialized technical English interview coaching platform crafted for IT and DevOps professionals preparing for senior technical interviews, live incident briefings, and system design defenses at international technology enterprises.

The platform targets three primary interview obstacles:
- **Expression Gap**: Deep engineering competency coupled with hesitation in articulating architectural nuances in fluent English.
- **Unstructured Responses**: Lengthy, meandering explanations lacking industry-standard structures (STAR method, chronological triage, or root-cause retrospectives).
- **Ad-Hoc Pressure**: Difficulty handling follow-up probing questions regarding production outages, scaling limits, or architectural trade-offs.

### 1.2. Hardware & Browser Requirements
- **Devices**: Desktop PCs, laptops, tablets, or smartphones with standard network connectivity.
- **Recommended Browsers**:
  - **Google Chrome** (*Recommended for best Web Speech API voice performance*).
  - **Microsoft Edge** (Full native Web Speech API support).
  - **Apple Safari** (Full Web Speech API and PWA installation support).
  - *Note*: Mozilla Firefox does not natively implement the standard Web Speech API; on Firefox, all features operate seamlessly via keyboard input.
- **Permissions**: Grant **Microphone access** when prompted if practicing via voice.

---

## 2. Accessing the Application Across Environments

DevSpeak AI is available across 5 distinct environments:

| Environment | Purpose | URL |
| :--- | :--- | :--- |
| **GCP GKE Autopilot (Production)** | Flagship Kubernetes & GitOps deployment | [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/) |
| **GCP Cloud Run (Production)** | Production Serverless container deployment | [https://devspeak-web-prod-ygz4gsol4q-as.a.run.app](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app) |
| **GCP Cloud Run (Staging)** | Staging pre-release verification environment | [https://devspeak-web-staging-ygz4gsol4q-as.a.run.app](https://devspeak-web-staging-ygz4gsol4q-as.a.run.app) |
| **Local Kubernetes (kind)** | Local cluster with Ingress-NGINX | `http://localhost/` |
| **Local Docker Compose** | Full local developer stack | `http://localhost:3001` |

### Connection Health Indicator
In the top-right corner of the **Header**:
- **Connected (Green Pulse)**: The frontend is actively communicating with the backend FastAPI engine (`/readyz` probe returning HTTP 200).
- **Offline / Degraded (Amber)**: The backend service is currently unreachable or starting up. Clicking this badge triggers an immediate background probe retry.

---

## 3. Registration, Sign In & Guest Mode

DevSpeak AI supports both authenticated accounts (for persistent XP and streak tracking) and instant Guest Mode.

### 3.1. Creating an Account (Sign Up)
1. Click the purple **Sign In** button in the header.
2. Select the **Create Account** tab.
3. Fill in the required fields:
   - **Email**: A valid email address (e.g., `engineer@example.com`).
   - **Password**: Minimum 8 characters (up to 128 characters, hashed with Argon2id).
   - **Full Name**: Your display name.
   - **Target Role**: Select your specialization (`DevOps & SRE Engineer`, `Cloud Architect`, `Backend Engineer`, or `General IT Specialist`).
   - **Target Level**: Desired CEFR fluency milestone (`B1 - Intermediate`, `B2 - Upper Intermediate` *[Recommended for global hiring]*, or `C1 - Advanced Professional`).
4. Click **Create Account**. Your session is immediately authenticated with a secure JWT.

### 3.2. Signing In
1. Click **Sign In** in the header.
2. Enter your **Email** and **Password**.
3. Click **Sign In**. Your avatar, CEFR badge, and saved database progress sync instantly.

### 3.3. Guest Mode
- You may explore questions, review rubrics, inspect flashcards, and submit answers without signing in.
- In Guest Mode, session metrics are maintained locally in browser memory for the duration of the visit.

---

## 4. Dashboard & Navigation (LinguaFlow Design)

DevSpeak AI employs the **LinguaFlow** design system—a dark-neon interface optimized for extended engineering focus:

```
+-----------------------------------------------------------------------------------------+
| [Header] Logo DevSpeak AI | AI Studio Pill | Nav Tabs | Status (Connected) | Lang | User|
+---------------------+-------------------------------------------------------------------+
| [LinguaSidebar]     | [Main Content Area]                                               |
| - Day Streak & Level| - Welcome Banner & Current Target CEFR Level                      |
| - XP Progress Bar   | - 4 Metric Cards: Streak, Total XP, Words Mastered, Rank          |
|                     | - Weekly Practice Velocity & Day Streak Grid                      |
| - Dashboard         | - Quick Actions: Review Cards, Shadow Practice, Talk AI, Practice |
| - Question Bank     | - Today's Recommended Goal & Milestone Badges                     |
| - Flashcards Vault  |                                                                   |
| - Interview Studio  |                                                                   |
| - STAR Method       |                                                                   |
+---------------------+-------------------------------------------------------------------+
| [Footer] Copyright © 2026 DevSpeak AI • Security-First • Zero Cost • Local-First        |
+-----------------------------------------------------------------------------------------+
```

### 4.1. Navigation Sidebar
- **Day Streak & Level**: Real-time counter of consecutive practice days.
- **XP Progress Bar**: Visual gauge tracking progression toward the next 500 XP milestone.
- **Sections**:
  - **Dashboard**: High-level learning analytics, velocity charts, and recommended exercises.
  - **Question Bank**: 26 production interview scenarios cataloged by domain and difficulty.
  - **Flashcards / Vocab Vault**: Interactive 3D technical terminology flashcards with native pronunciation.
  - **Practice Studio**: Focused 3-zone interview simulator for the selected question.
  - **STAR Method**: Behavioral and incident mitigation templates structured via the STAR model.

---

## 5. Browsing & Filtering the Question Bank

The question catalog contains **26 curated technical interview prompts** mapped to real-world evaluation rubrics used by global tech firms:

### 5.1. Engineering Topics Covered
1. **Kubernetes Architecture & Diagnostics**: Pod `CrashLoopBackOff` investigation, Ingress DNS routing, cgroup memory limits & `OOMKilled` (Exit Code 137), CNI NetworkPolicies.
2. **CI/CD & DevSecOps Pipelines**: Automated Canary rollbacks, SAST/DAST pipeline integration, GitOps reconciliation workflows with Argo CD.
3. **Linux Internals & SRE Diagnostics**: High `iowait` storage bottlenecks, cgroup memory saturation, kernel network packet inspection with `tcpdump`.
4. **AWS & Multi-Cloud Infrastructure**: Multi-AZ network transfer cost optimization, IAM Least Privilege policies, Transit Gateway vs VPC Peering trade-offs.
5. **Docker & Containerization**: Multi-stage build caching, non-root user execution, and minimal Distroless image hardening.
6. **Distributed Systems & System Design**: Distributed rate limiters (Token Bucket vs Leaky Bucket), idempotent payment webhooks, database replication lag mitigation.
7. **STAR Behavioral & Engineering Leadership**: Production outage post-mortems, architectural disagreements with Principal Engineers, junior engineer mentorship.

### 5.2. Search and Filtering
- Filter by **Role** (`All Roles`, `DevOps Engineer`, `Software Engineer`).
- Filter by **Topic** (Kubernetes, Linux, AWS, CI/CD, System Design, STAR).
- Filter by **Difficulty** (`Junior`, `Mid-Level`, `Senior`).
- Click **View Details** on any card to examine key evaluation criteria and follow-up questions, or click **Practice in Studio** to immediately launch the simulation.

---

## 6. Practicing in the 3-Zone AI Interview Studio

The **AI Interview Studio** provides a dedicated, independently scrollable three-column workspace:

```
+---------------------------------------------------------------------------------------------------+
| AI INTERVIEW STUDIO                                                                               |
+--------------------------+------------------------------------------+-----------------------------+
| COLUMN 1: QUESTION LIST  | COLUMN 2: RESPONSE EDITOR                | COLUMN 3: RUBRIC & COACH    |
| - Header & Counter (26)  | - Scenario & Technical Prompt (Bounded)  | - Key Technical Concepts    |
| - Topic & Difficulty Tag | - Voice Mode [Click to Speak]            | - 1-Click Vocabulary Insert |
| - Scrollable Catalog     | - English Text Draft Editor              | - STAR Framework Helper     |
| - Exit Action            | - Character Counter (10 - 4,000)         | - Expert Model Answer       |
|                          | - [Study Model Answer] & [Submit Answer] |   [Study Model Answer]      |
+--------------------------+------------------------------------------+-----------------------------+
```

### Step-by-Step Practice Workflow:
1. **Analyze the Prompt**: Review the technical context, incident symptoms, and evaluation criteria in Column 2.
2. **Inspect Technical Keywords**: Check Column 3 for industry-standard terminology expected in a high-scoring response (e.g., `cgroup`, `kubectl describe`, `graceful termination`).
3. **Draft Your Response**:
   - Type your technical response in English into the central editor.
   - Or click **Click to Speak** to articulate your answer vocally.
4. **Verify Length**: Responses must be between **10 characters** (minimum to form a valid thought) and **4,000 characters**.
5. **Submit for Scoring**:
   - Click the purple **Submit Answer** button.
   - Or press keyboard shortcut: `Ctrl + Enter` (Windows/Linux) or `Cmd + Enter` (macOS).

---

## 7. Submitting Answers & Interpreting AI Evaluation Reports

Upon submission, the evaluation engine scores your response across 3 dimensions:

### 7.1. Three-Pillar Scoring Rubric (1.0 to 10.0 scale)
- **Technical Accuracy (Weight: 50%)**: Evaluates whether commands, flags, architectural mechanics, and root-cause explanations are technically correct.
- **Clarity & STAR Structure (Weight: 30%)**: Evaluates whether your response follows a logical, methodical sequence (Situation, Problem, Investigation, Mitigation, Prevention).
- **English Grammar & Professional Tone (Weight: 20%)**: Evaluates syntactic precision, professional conciseness, engineering idioms, and passive/active voice balance.
- **Overall Score**:
  - `Developing (< 6.0)`: Needs further terminology reinforcement and structural discipline.
  - `Solid (6.0 - 7.9)`: Meets standard mid-level engineering interview expectations.
  - `Strong (8.0 - 10.0)`: Senior/Staff level articulation with exceptional clarity and depth.

### 7.2. Detailed Feedback Sections
- **Technical Feedback**: Specific highlights of concepts correctly explained alongside omitted diagnostic steps.
- **Grammar & Fluency Suggestions**: Concrete sentence rewrites showing how native engineering leads phrase the same thought.
- **Structural Coaching**: Recommendations on ordering triage steps chronologically.
- **Benchmark Model Answer**: A comprehensive 10/10 model answer written by senior engineering leaders. Click **Copy Answer** to copy to clipboard for study.
- **Follow-up Questions**: Realistic follow-up probing questions to prepare for deep-dive interview stages.

---

## 8. Candidate Assistance Tools: Technical Vocabulary & STAR Framework

### 8.1. 1-Click Vocabulary Insertion (Vocabulary Coach)
- In the right-hand **Rubric** panel, clicking any technical keyword (e.g., `CrashLoopBackOff`, `Exit Code 137`, `terminationGracePeriodSeconds`) automatically appends it into your active draft editor at the current cursor position.

### 8.2. STAR Framework Generator
- Clicking **Insert STAR Template** above the response editor prepopulates the standard 4-phase framework:
  - `Situation`: Production environment context and incident symptoms.
  - `Task`: Candidate's direct engineering responsibility under SLA.
  - `Action`: Diagnostic commands executed and configuration remedies applied.
  - `Result`: Measurable business outcome (downtime minimized, MTTR reduced).

### 8.3. Troubleshooting Chronology Helper
- Clicking **Insert Troubleshooting Steps** inserts an industry-standard opening template:
  > *"When diagnosing this issue in production, I take a structured chronological approach. First, I verify container and node events. Next, I inspect previous termination logs. Finally, I apply the targeted mitigation via our deployment manifest."*

### 8.4. 3D Flashcards Vault
- Navigate to **Flashcards** in the sidebar:
  - Click any card to flip between definition, architecture role, and real-world example.
  - Click the speaker icon for native audio pronunciation.
  - Click **Practice in Studio** to immediately transition to an interview scenario utilizing that concept.

---

## 9. Interactive Multi-Turn Interview Dialogue Engine

Beyond single-turn assessment, DevSpeak AI features a stateful **Multi-Turn Interview Engine**:
1. **Turn 0 (Initiation)**: The AI interviewer welcomes you and introduces the core architectural scenario.
2. **Turn 1 (Initial Triage)**: You submit your opening diagnostic plan. The AI validates your steps and poses a targeted follow-up question challenging an edge case (e.g., *"Good initial diagnosis. However, how would you ensure this doesn't impact other pods sharing the same node?"*).
3. **Turn 2 (Deep-Dive Defense)**: You defend your design choice or secondary mitigation.
4. **Turn 3 (Evaluation)**: The AI delivers a final holistic summary, marks the session `Completed`, and generates composite scores for the entire conversational chain.

---

## 10. Voice Practice Mode (Web Speech API) & Browser Compatibility

### 10.1. Using Voice Input
1. In the Studio workspace, locate the **Click to Speak** button (purple microphone icon) above the answer editor.
2. Click **Click to Speak**.
3. When prompted by your browser, select **Allow** for microphone permissions.
4. The icon pulses red with the label **Listening...**: Speak your technical answer clearly at a natural cadence.
5. Speech is transcribed in real-time directly into the editor.
6. Click **Stop Recording** when finished. You may edit the transcribed text before submitting.

### 10.2. Browser Security Requirements
- Web Speech API requires a secure context (**HTTPS** in production or **localhost** in development).
- Fully supported in **Google Chrome**, **Microsoft Edge**, and **Apple Safari**.
- If running on Firefox or unsupported platforms, an informative banner suggests keyboard entry.

---

## 11. Progress Tracking, Experience Points (XP) & Day Streaks

Authenticated users automatically earn progression rewards:
- **Base XP**: +50 XP per submitted and evaluated interview answer.
- **Merit Bonus**: +25 XP for responses achieving an Overall Score $\ge 8.0$.
- **Session Completion Bonus**: +30 XP for completing a multi-turn dialogue session.
- **Level Progression**: Every 500 accumulated XP unlocks a new rank level (Level 1 $\to$ Level 2 $\to$ Level 3...).
- **Daily Streak**: Increments for every unique calendar day you submit at least one interview exercise.

---

## 12. Bilingual Switching (English / Vietnamese)

DevSpeak AI features a complete bilingual interface:
- Click the **EN / VI** toggle in the top-right header:
  - **VI**: Navigation labels, dashboard headers, instructions, and metric tooltips switch to Vietnamese.
  - **EN**: Interface displays in 100% international English.
- **Technical Content Preservation**: Technical interview prompts, scoring rubrics, follow-up questions, and expert model answers remain in English across both modes to ensure authentic interview immersion.
- Your language preference persists across sessions via browser `localStorage`.

---

## 13. Troubleshooting Common Issues

### Issue 1: Header status indicator shows amber "Offline"
- **Cause**: Frontend cannot establish connection with the FastAPI backend `/readyz` endpoint.
- **Resolution**:
  1. Click the status badge to trigger an immediate probe retry.
  2. For local environments, ensure Docker containers or Kubernetes pods are running: `docker compose ps` or `kubectl get pods -n devspeak`.
  3. Ensure network firewalls do not block port `8000`.

### Issue 2: Microphone button indicates "Speech recognition is not supported"
- **Cause**: Active browser (e.g., Firefox) does not implement the Web Speech API standard.
- **Resolution**: Switch to Google Chrome, Microsoft Edge, or Safari for voice input, or utilize standard keyboard input.

### Issue 3: Microphone access denied error
- **Cause**: Browser microphone permissions were previously blocked for the domain.
- **Resolution**: Click the lock/tune icon in the browser address bar, reset **Microphone** permission to **Allow**, refresh (`F5`), and retry.

### Issue 4: "Submit Answer" button remains disabled
- **Cause**: The current draft is shorter than 10 characters or exceeds the 4,000-character boundary.
- **Resolution**: Review the live character counter beneath the textarea and expand your technical details.

---

## 14. Privacy Policy & Local-First Security Architecture

DevSpeak AI is architected with a strict **Security-First** and **Local-First** model:
- **Zero Plaintext Credentials**: Passwords are cryptographically salted and hashed using **Argon2id** (memory-hard algorithm resistant to GPU/ASIC brute-force).
- **Session Isolation**: Authentication tokens are signed via stateless JWTs; database records enforce strict user ownership checks.
- **Offline Mock Scoring Engine**: By default, the application runs using an offline deterministic Heuristic Mock AI provider. No candidate responses, transcripts, or personal data leave the cluster or workstation.
- **Zero Third-Party Model Storage**: When configured with Google Gemini (`AI_PROVIDER=gemini`), inputs are evaluated in-transit without retention or training usage.

---

## 15. Frequently Asked Questions (FAQ)

**Q1: Is DevSpeak AI completely free to use locally?**  
*Answer*: Yes. The platform operates 100% locally with zero external API dependencies or subscription costs when using the built-in Heuristic Mock provider.

**Q2: Does the platform evaluate individual phonetic pronunciation errors?**  
*Answer*: The current release focuses on speech-to-text transcription accuracy, technical vocabulary selection, grammatical syntax, and structural logic. Advanced phonetic waveform analysis is slated for a future milestone.

**Q3: Can I add custom interview questions to the platform?**  
*Answer*: The application ships with 26 standardized IT and DevOps scenarios. An administrative UI for custom question authoring is planned for the v1.2.0 release.

**Q4: How is the Overall Score calculated?**  
*Answer*: Overall score is a weighted composite: $50\%$ Technical Accuracy + $30\%$ Clarity & STAR Structure + $20\%$ English Grammar & Professional Tone.

---

## 16. Current Capabilities & Upcoming Roadmap

In the spirit of engineering transparency, current capabilities and upcoming milestones are documented below:

1. **Persistent History Storage**:
   - The PostgreSQL database persists all candidate submissions (`interview_attempts`) and multi-turn exchanges (`interview_messages`).
   - Summary statistics (Total completed, Streak, XP) are visualized on the Dashboard; a tabular session history audit screen is scheduled for v1.1.0.
2. **Multi-Turn Interview Chat Component**:
   - The multi-turn conversational API and Python SDK are fully implemented in the backend. An interactive multi-turn chat widget in the frontend is scheduled for v1.1.0.
3. **Speech Recognition on Firefox**:
   - Firefox users should utilize keyboard input until Mozilla ships standardized Web Speech API support.
