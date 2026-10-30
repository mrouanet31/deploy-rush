---
name: react-performance-compiler
description: Use when optimizing React performance: render cost, memoization, React Compiler, Profiler, transitions, virtualization, bundle splitting, stable props, expensive lists, and perceived performance.
---

# Performance, React Compiler et profiling

## Mission

Mesurer avant d’optimiser, réduire le coût de rendu utilement et éviter la memoization manuelle non justifiée.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `performance React`, `memo`, `useMemo`, `useCallback`, `React Compiler`, `Profiler`, `bundle`, `virtualization`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`performance-method.md`](references/performance-method.md)
- [`memoization.md`](references/memoization.md)
- [`react-compiler.md`](references/react-compiler.md)
- [`profiler-devtools.md`](references/profiler-devtools.md)
- [`bundle-and-virtualization.md`](references/bundle-and-virtualization.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`performance/ProfilerMark.tsx`](templates/performance/ProfilerMark.tsx)
- [`performance/VirtualizedListBoundary.tsx`](templates/performance/VirtualizedListBoundary.tsx)
- [`performance/compiler.config.ts`](templates/performance/compiler.config.ts)
- [`performance/perf-budget.md`](templates/performance/perf-budget.md)

## Exemples locaux

- [`memoization-removal.md`](examples/memoization-removal.md)
- [`render-hotspot-analysis.md`](examples/render-hotspot-analysis.md)

## Checklists locales

- [`performance-review.md`](checklists/performance-review.md)
- [`compiler-adoption.md`](checklists/compiler-adoption.md)

## Scripts locaux

- [`scan-performance-smells.mjs`](scripts/scan-performance-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
