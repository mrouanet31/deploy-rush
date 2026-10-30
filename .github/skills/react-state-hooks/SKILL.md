---
name: react-state-hooks
description: Use when implementing or reviewing React state, hooks, reducers, context, custom hooks, external stores, optimistic state, transitions, deferred values, and state model simplification.
---

# État, Hooks et logique UI

## Mission

Concevoir l’état React au bon endroit, avec des Hooks fiables, des reducers quand nécessaire et des transitions explicites pour les interactions non bloquantes.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `useState`, `useReducer`, `useContext`, `custom hook`, `useTransition`, `useOptimistic`, `useSyncExternalStore`, `state`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`state-placement.md`](references/state-placement.md)
- [`hook-design.md`](references/hook-design.md)
- [`reducer-context.md`](references/reducer-context.md)
- [`external-store.md`](references/external-store.md)
- [`concurrent-interactions.md`](references/concurrent-interactions.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`hooks/useAsyncAction.ts`](templates/hooks/useAsyncAction.ts)
- [`hooks/useControlledState.ts`](templates/hooks/useControlledState.ts)
- [`state/reducer-context.tsx`](templates/state/reducer-context.tsx)
- [`state/external-store.ts`](templates/state/external-store.ts)

## Exemples locaux

- [`state-snapshot-bug.md`](examples/state-snapshot-bug.md)
- [`reducer-refactor.md`](examples/reducer-refactor.md)

## Checklists locales

- [`hooks-rules-checklist.md`](checklists/hooks-rules-checklist.md)
- [`state-model-review.md`](checklists/state-model-review.md)

## Scripts locaux

- [`scan-hooks-antipatterns.mjs`](scripts/scan-hooks-antipatterns.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
