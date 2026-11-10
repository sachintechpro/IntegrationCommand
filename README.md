<div align="center">

# IntegrationCommand

### Enterprise Integration & Technical Program Delivery Simulator

**Investigate API failures. Coordinate remediation. Validate release readiness.**

**[Live application](https://integrationcommand.onrender.com/)** · [Architecture](#integration-landscape) · [How to use](#how-to-use) · [Release governance](#release-governance) · [Deployment](#deploy-to-render)

</div>

---

## Overview

IntegrationCommand is an interactive, fictional enterprise integration delivery exercise. It models the decisions required to coordinate system owners, external vendors, cross-platform API contracts, integration validation, operational risk, and a go/no-go release recommendation.

> **Scenario disclaimer:** All organizations, systems, defects, budget estimates, delivery assumptions, and risk scores are invented for this demonstration. The simulator is not connected to production systems and does not perform real API calls, identity authentication, or actual release approval.

## Business scenario

An insurer is launching a customer self-service release. The delivery program connects a customer portal with identity, API gateway, policy administration, billing, payments, claims, and notification services. Six cross-system defects have emerged ahead of the release window.

## Integration landscape

| Customer capability | Integration boundary | Issue |
|---|---|---|
| Customer authentication | Portal → Identity Provider | Token audience mismatch |
| Policy lookup | API Gateway → Policy Administration | Breaking API contract |
| Billing balance | API Gateway → Billing | Peak-time timeouts |
| Premium payment | Billing → Payment Processor | Duplicate-payment retries |
| Claim status | API Gateway → Claims | Stale asynchronous status |
| Notifications | Event Service → Portal | Duplicate event handling |

Critical flows are authentication, policy lookup, and premium payments. Security and validation requirements are scenario-specific and illustrative.

## How to use

1. Open the delivery workbench and review six integration incidents and their root causes.
2. Choose **Open**, **Mitigate**, or **Fix** for each issue. Mitigation can reduce modeled exposure but cannot make an integration verified.
3. For a fixed issue, record its required test evidence—contract tests, SIT, security, performance, and/or UAT, depending on the integration.
4. Confirm the accountable vendor or owner has accepted the remediation and handoff.
5. Record your delivery decision rationale and any escalation notes.
6. Adjust the remaining capacity, funding, and release schedule to see the consequences.
7. Review the computed readiness assessment and export the decision brief or JSON scenario.

To achieve a **GO** in the default scenario, complete remediation and all required evidence and acceptance for all six integration boundaries. This requires 23 modeled person-days, $101,000 of modeled cost, and six modeled weeks, which fit the default allowances of 24 days, $115,000, and seven weeks.

## Release governance

- **Verified:** A permanent fix was selected, all required test evidence is recorded, and vendor acceptance is confirmed.
- **RED:** Critical integration unverified or delivery capacity, budget, or modeled schedule exceeded.
- **AMBER:** No RED condition, but one or more noncritical integrations remain unverified.
- **GREEN:** All integrations verified, and resource/schedule constraints respected.
- **GO:** Only when GREEN and all six integrations are verified. The simulated GO is eligibility for approval, **not** authorization for production deployment.
- **Waiver:** A request can be documented but never overrides the release gates in this scenario.

**Estimated duration:** `ceil(total planned person-days / 5) + 1` weeks, representing five modeled person-days of effective remediation work per week and one regression week. This simplification is not a real critical-path or vendor-lead-time schedule.

**Residual risk:** Scenario severity × likelihood, reduced heuristically when a mitigation or remediation is selected. These are comparative values, not empirically calibrated probability estimates.

## Technology

- `IntegrationCommand/engine.mjs`: Pure, deterministic simulation, validation, risk assessment, release gates.
- `IntegrationCommand/app.mjs`: Browser-side interaction, live dashboard updates, scenario exports.
- `IntegrationCommand/index.html`, `styles.css`: Accessible, responsive user interface.
- `IntegrationCommand/server.py`: Zero-dependency Python HTTP server.
- `IntegrationCommand/tests/engine.test.mjs`: Node test suite including all 729 possible combinations of incident response choices.
- `.github/workflows/test.yml`: Automated GitHub Actions checks.

## Run locally

```bash
cd IntegrationCommand
python server.py
```

Open `http://localhost:10000`.

Run tests from the repository root with Node.js 22+:

```bash
node --test IntegrationCommand/tests/*.test.mjs
```

## Deploy to Render

Create a new public GitHub repository named `integrationcommand` and upload the contents of the ZIP, **retaining the top-level `IntegrationCommand` folder** and `.github` directory.

Create a Render Web Service linked to that repository:

| Setting | Value |
|---|---|
| Language | Python 3 |
| Branch | `main` |
| Root Directory | `IntegrationCommand` |
| Build command | `echo "No dependencies"` |
| Start command | `python server.py` |
| Instance | Free |

Render assigns the service URL. Update the GitHub About section and the README live link if your generated URL differs.

## Scope boundaries

This simulator does not model real network endpoints, persisted issue tracking, multiple teams' concurrent resource calendars, production telemetry, external vendor SLAs, encryption validation, actual security certification, or approval workflow audit evidence. The provided data is intentionally fictional and transparent.

---

**IntegrationCommand** · Cross-system delivery, vendor coordination, integration quality and release governance.
