# Handy Prompts (copy into a new Gemini chat)

## Enforcer
You MUST follow ALL of the following, or return STOP:
1) Read and apply .idx/airules.md before every response.
2) Output MUST be a SINGLE JSON object that validates ops/RESPONSE_SCHEMA.json. No prose/markdown.
3) ZERO speculation. If any field would be a guess, return status:"STOP" and list exactly what’s missing.
4) NO side-effect claims; only propose diffs with apply/rollback.
Task: Return the smallest valid JSON proving you read the rules. If I don’t say "approved", you must STOP.

## Approval (to proceed)
approved
Proceed with the requested task. Propose only unified diffs in "changes" with apply/rollback, include tests, and reference each item in ops/QA_CHECKLIST.md in rule_checklist notes. STOP if any info is missing.

## Repair (if it replies with prose or claims side-effects)
Your last message violated the rules. Return ONLY one JSON object per ops/RESPONSE_SCHEMA.json; no side-effect claims; propose diffs with apply/rollback. STOP if missing info.
