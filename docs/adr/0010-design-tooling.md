# 0010. Design tooling

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
The owner wants a design that looks hand-crafted for ARGIVA, not generic AI output. AI agents need tools that enforce design quality and check the rendered result.

## Options considered
Impeccable, Anthropic's frontend-design and theme-factory skills, the brand-guidelines skill, Playwright or browser screenshots, the shadcn MCP, the 21st.dev MCP and the Figma MCP.

## Decision
- **Use:**
  - Impeccable: the skill, its agents and a local post-edit detector hook. Telemetry stays on by the owner's choice.
  - Anthropic's frontend-design and theme-factory skills.
  - VS Code browser tools for screenshots.
  - The shadcn MCP, with every primitive restyled to ARGIVA's tokens.
- **Rejected:**
  - The 21st.dev MCP and the Figma MCP.
  - The brand-guidelines skill, because it applies Anthropic's own brand, not ARGIVA's.

## Consequences
- [PRODUCT.md](../../PRODUCT.md) and [DESIGN.md](../../DESIGN.md) at the repo root guide all design work.
- shadcn components are only a starting point; they must read `--argiva-*` variables and follow DESIGN.md.
