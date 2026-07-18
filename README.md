# ValiDossier — Automated Regulatory Ingestion Firewall & Audit Orchestrator

ValiDossier is a Proof-of-Concept (POC) enterprise application designed to enforce compliance, security, and integrity at the boundary of pharmaceutical marketing authorization (AMM) submissions. 

It provides an automated **Ingestion Firewall** (for submission package validation) paired with a **Regulatory Compliance Audit Copilot** (powered by Gemini models via the Google Antigravity Agent SDK) and a **Human-in-the-Loop (HITL)** clinical review override gate.

---

## 1. System Architecture

```
                      [ eCTD Dossier Files ]
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Ingestion Firewall   │  ◄── Naming & format constraints
                     └───────────┬───────────┘
                                 │
                         (If ACCEPTED)
                                 ▼
                     ┌───────────────────────┐
                     │   Staging SQLite DB   │
                     └───────────┬───────────┘
                                 │
                         (Audit Request)
                                 ▼
                     ┌───────────────────────┐
                     │   Antigravity Agent   │  ◄── Cross-references JORT laws
                     └───────────┬───────────┘      & Module 5 clinical trial tables
                                 │
                     ┌───────────┴───────────┐
                     │   Compliance Status   │
                     └─────┬───────────┬─────┘
                           │           │
                 (Deterministic)   (Clinical Mismatch)
                           ▼           ▼
                     ┌───────────┐   ┌────────────────────────┐
                     │ Auto-Heal │   │  HITL Review Intercept │
                     │  Advice   │   │  (Approve/Ban Signoff) │
                     └───────────┘   └────────────────────────┘
```

*   **Frontend:** React (Vite) styled with premium custom theme vars (Light/Dark support), custom SVG branding, drag-and-drop workspace triggers, and inline PDF previews via custom proxy headers.
*   **Backend:** FastAPI (Python) web server coordinating SQLite staging states and executing audit queries against native files (JORT decrees, eCTD structural conventions).
*   **Agent Core:** Integrates Google's `Antigravity` SDK using `LocalAgentConfig` to leverage Gemini's structured retrieval capabilities.

---

## 2. Dossier Testing Suite

The repository contains three pre-configured folders in the root directory to demonstrate different ingestion and audit pathways:

### 1. `correct_docs/` (Compliant Pathway)
Files satisfy all firewall checks and compliance rules:
*   `oxalip-cover-letter.pdf` addresses the current authority ("ANAM").
*   `oxalip-application-form.json` uses the current authority ("ANAM") and matches batch ID `"OXAL12-2024-TN"`.
*   `oxalip-clinical-summary.json` claims a dizziness incidence of `0.67%`.
*   `oxalip-safety-log.pdf` contains 1 event out of 150 patients ($0.67\%$, matching the summary).

### 2. `discrepant_docs/` (Audited / HITL Pathway)
Files pass the Ingestion Firewall but trigger errors and pipeline freeze:
*   `oxalip-cover-letter.pdf` addresses defunct legacy authority `DPM` (violates ANAM decree).
*   `oxalip-clinical-summary.json` claims a dizziness rate of `0.5%`.
*   `oxalip-safety-log.pdf` records 1 event out of 150 patients ($0.67\%$, creating a mathematical contradiction vs. the summary's `0.5%`). The system freezes the pipeline (`HITL_FROZEN`) and requests Aatef's clinical sign-off.

### 3. `error_docs/` (Firewall Blocked Pathway)
Files fail naming and safety conventions and are blocked immediately:
*   `oxalip cover-letter.pdf` contains a space.
*   `OXALIP-SAFETY-LOG.pdf` contains uppercase characters.
*   `oxalip-clinical-summary.json` is a 0-byte empty file.
*   `oxalip$safety$log.pdf` contains invalid characters (`$`).

---

## 3. Local Development Setup

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
*   A Gemini API Key (saved in your environment as `GEMINI_API_KEY`)

### Starting the Application
1.  Set up your environment variables:
    ```bash
    export GEMINI_API_KEY="your-api-key-here"
    export VITE_API_URL="http://localhost:3001"
    ```
2.  Launch the containers:
    ```bash
    docker-compose up --build
    ```
3.  Access the applications:
    *   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
    *   **Backend Gateway API:** [http://localhost:3001/api/health](http://localhost:3001/api/health)
