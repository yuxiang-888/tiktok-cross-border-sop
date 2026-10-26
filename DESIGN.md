# Cross-Border SOP Fieldguide — Design Notes

## Overview

The site is a practical field guide and browser-local execution workbench for Chinese-speaking cross-border ecommerce operators. It combines the upstream seven-agent toolkit with a dedicated United States TikTok Shop track. It should feel like a dispatch board built from working papers: clear routes, visible source labels, compact reference details, and enough room to complete a product brief or read a long prompt.

The signature is a visible eligibility gate before the TikTok Shop route, followed by an eight-stop operating line. The gate records a real platform access constraint; the route encodes the sequence from seller eligibility and SKU approval through content, fulfillment, and measured iteration. The workbench turns those stops into a left-hand stage rail and a right-hand working paper with progress, source links, and a clear local-save state. The upstream seven-agent route remains available as a separate general-purpose track.

## Colors

- `--ink`: `#132D2A` — dispatch board, masthead, and primary text on paper.
- `--paper`: `#F2EFE6` — document canvas.
- `--card`: `#FFFEFA` — reading surfaces.
- `--route`: `#D7673F` — active route and focused actions.
- `--signal`: `#F2C14E` — markers and route numbers.
- `--muted`: `#69736A` — metadata and supporting text.

## Typography

- Display: `Bahnschrift Condensed`, `Arial Narrow`, then Chinese sans fallbacks; use for route labels and large titles.
- Reading: `Segoe UI`, `PingFang SC`, `Microsoft YaHei`, sans-serif; use for Chinese prose and controls.
- Utility: `Consolas`, `SFMono-Regular`, monospace; use for source paths, stage numbers, and metadata.

## Layout

Use a wide editorial masthead followed by the U.S. TikTok Shop eligibility gate and execution route, then the upstream seven-agent route. The library becomes a two-column index and reader on desktop, then a single-column search and document reader on mobile. Keep source, market, and policy verification labels close to the relevant content.

## Shapes

Favor square paper cards, thin dividers, clipped waybill labels, and restrained 4–8px radii. Avoid floating glass panels and oversized soft shadows.

## Components

- Route stop: numbered semantic button with a descriptive label and a clear active state.
- Library item: source path, content type, title, and match context.
- Reader: sanitized Markdown, readable line length, code blocks, tables, and explicit source actions.
- Search: local full-text search over the bundled source library with clear and empty states.
- Workbench stage: a labeled operating step, linked SOP, outcome checklist, and contextual tool that preserves the paper-card visual language.
- Local workspace status: plainly says data is stored in this browser only; export and clear controls stay visible near the product context.
- Readiness calculation: outputs are estimates derived only from operator-entered values, with missing inputs and excluded costs stated beside the result.
- Script draft: generated from operator-supplied facts only, labeled as a draft requiring review; no generated claim is presented as approved copy.

## Do's and Don'ts

- Keep attribution to the upstream MIT repository visible and distinguish upstream documents from the project's TikTok Shop materials.
- Present maintained compliance guidance; do not bundle or link a PDF identified by the upstream README as unedited internal material.
- Date-stamp TikTok Shop policy snapshots and make clear that live Seller Center requirements take precedence.
- Treat seller eligibility as a stop/go gate; never imply that every China-based operator qualifies for a U.S. shop.
- Keep example data labeled as examples and never invent customer proof or platform guarantees.
- Keep interaction labels explicit and all controls keyboard reachable.
- Do not imply TikTok account connectivity, automated publishing, live policy checks, or AI-service calls that the static site does not perform.
