---
name: react-data-fetching-suspense
description: Use when designing data fetching, Suspense boundaries, loading states, error boundaries, cache handoff, transitions, optimistic UI, streaming-friendly UI, and client/server data responsibilities.
---

# Données, Suspense et expérience de chargement

## Mission

Concevoir le chargement de données et les états d’attente sans cascades inutiles, avec des frontières Suspense/Error adaptées et une expérience utilisateur stable.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `fetch data`, `Suspense`, `loading state`, `error boundary`, `cache`, `optimistic`, `use`, `transition`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`data-responsibility.md`](references/data-responsibility.md)
- [`suspense-boundaries.md`](references/suspense-boundaries.md)
- [`error-boundaries.md`](references/error-boundaries.md)
- [`optimistic-ui.md`](references/optimistic-ui.md)
- [`cache-and-frameworks.md`](references/cache-and-frameworks.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`components/AsyncBoundary.tsx`](templates/components/AsyncBoundary.tsx)
- [`components/ErrorBoundary.tsx`](templates/components/ErrorBoundary.tsx)
- [`hooks/useResource.ts`](templates/hooks/useResource.ts)
- [`patterns/optimistic-action.tsx`](templates/patterns/optimistic-action.tsx)

## Exemples locaux

- [`waterfall-to-parallel.md`](examples/waterfall-to-parallel.md)
- [`suspense-layout.md`](examples/suspense-layout.md)

## Checklists locales

- [`data-loading-review.md`](checklists/data-loading-review.md)
- [`suspense-review.md`](checklists/suspense-review.md)

## Scripts locaux

- [`scan-data-fetching-smells.mjs`](scripts/scan-data-fetching-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
