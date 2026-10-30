---
name: react-server-rendering-rsc
description: Use when implementing or reviewing SSR, hydration, streaming server rendering, static prerendering, React Server Components, Server Functions, directives, client/server boundaries, and framework integration.
---

# SSR, static rendering et React Server Components

## Mission

Distinguer rendu client, SSR, static rendering et Server Components, puis placer correctement les frontières `'use client'` / `'use server'`.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `SSR`, `hydrateRoot`, `renderToPipeableStream`, `renderToReadableStream`, `prerender`, `RSC`, `use client`, `use server`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`rendering-modes.md`](references/rendering-modes.md)
- [`hydration.md`](references/hydration.md)
- [`streaming-ssr.md`](references/streaming-ssr.md)
- [`server-components.md`](references/server-components.md)
- [`directives-boundaries.md`](references/directives-boundaries.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`ssr/server-entry.tsx`](templates/ssr/server-entry.tsx)
- [`ssr/client-entry.tsx`](templates/ssr/client-entry.tsx)
- [`rsc/ServerComponent.tsx`](templates/rsc/ServerComponent.tsx)
- [`rsc/ClientIsland.tsx`](templates/rsc/ClientIsland.tsx)

## Exemples locaux

- [`hydration-mismatch-debug.md`](examples/hydration-mismatch-debug.md)
- [`rsc-boundary-design.md`](examples/rsc-boundary-design.md)

## Checklists locales

- [`ssr-rsc-review.md`](checklists/ssr-rsc-review.md)
- [`hydration-review.md`](checklists/hydration-review.md)

## Scripts locaux

- [`scan-client-server-boundaries.mjs`](scripts/scan-client-server-boundaries.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
