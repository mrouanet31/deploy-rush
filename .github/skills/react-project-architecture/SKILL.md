---
name: react-project-architecture
description: Use when designing or refactoring React project architecture: feature slices, component boundaries, state placement, shared UI, routing boundaries, server/client separation, dependency direction, and scalable folder organization.
---

# Architecture de projet React

## Mission

Structurer un projet React afin que les composants, hooks, features, data access, shared UI et couches d’intégration restent compréhensibles et testables.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `architecture React`, `refactor structure`, `feature slice`, `shared components`, `folder`, `separation concerns`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`architecture-principles.md`](references/architecture-principles.md)
- [`feature-slice-model.md`](references/feature-slice-model.md)
- [`component-boundaries.md`](references/component-boundaries.md)
- [`dependency-rules.md`](references/dependency-rules.md)
- [`state-placement.md`](references/state-placement.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`feature-slice/FeatureView.tsx`](templates/feature-slice/FeatureView.tsx)
- [`feature-slice/useFeatureModel.ts`](templates/feature-slice/useFeatureModel.ts)
- [`feature-slice/index.ts`](templates/feature-slice/index.ts)
- [`adr/react-architecture-adr.md`](templates/adr/react-architecture-adr.md)

## Exemples locaux

- [`bad-to-good-foldering.md`](examples/bad-to-good-foldering.md)
- [`component-boundary-review.md`](examples/component-boundary-review.md)

## Checklists locales

- [`architecture-review.md`](checklists/architecture-review.md)
- [`dependency-direction.md`](checklists/dependency-direction.md)

## Scripts locaux

- [`scan-architecture-smells.mjs`](scripts/scan-architecture-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
