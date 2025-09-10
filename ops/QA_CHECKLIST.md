# Firebase OK Gate — Must Pass Before "OK"

## Functional
- [ ] Existing flows unchanged unless explicitly requested
- [ ] New behavior has tests (unit/emulator/e2e) or a clear test plan

## Security & Privacy
- [ ] Firestore/Storage Rules least-privilege; no `allow if true`
- [ ] App Check considered where appropriate
- [ ] No secrets/PII in code or logs

## Data & Indexes
- [ ] Backfill/shadow fields + rollback documented
- [ ] Required Firestore indexes listed (CLI/Console steps)

## Functions/Backend
- [ ] Auth/App Check on endpoints as needed
- [ ] Input validation; timeout/retry; redacted logs

## Hosting/Frontend
- [ ] Zero-downtime deploy path; routes/fallbacks defined

## Observability & Ops
- [ ] Logs/metrics described; incident/rollback plan present
- [ ] Cost notes (reads/writes/egress) for new paths

## Rule Compliance
- [ ] .idx/airules.md read & applied
- [ ] Response conforms to ops/RESPONSE_SCHEMA.json
- [ ] All rule_checklist items PASS or status=STOP
