---
name: react-new-app
description: Use when creating, bootstrapping, or selecting the architecture for a new React application, including framework choice, Vite/client-only setup, TypeScript, linting, tests, folder structure, and initial production-ready scaffolding.
---

# Nouvelle application React

## Mission

Créer une application React moderne, maintenable et prête à évoluer, en choisissant explicitement entre framework full-stack recommandé, SPA/client-only, intégration progressive ou setup from-scratch.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `nouvelle app React`, `create React app`, `Vite`, `Next.js`, `React Router`, `Expo`, `scaffold`, `setup TypeScript`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`project-selection.md`](references/project-selection.md)
- [`framework-vs-spa.md`](references/framework-vs-spa.md)
- [`typescript-baseline.md`](references/typescript-baseline.md)
- [`folder-structure.md`](references/folder-structure.md)
- [`tooling-baseline.md`](references/tooling-baseline.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`vite-react-ts/package.json`](templates/vite-react-ts/package.json)
- [`vite-react-ts/src/App.tsx`](templates/vite-react-ts/src/App.tsx)
- [`vite-react-ts/src/main.tsx`](templates/vite-react-ts/src/main.tsx)
- [`vite-react-ts/tsconfig.json`](templates/vite-react-ts/tsconfig.json)
- [`vite-react-ts/vitest.setup.ts`](templates/vite-react-ts/vitest.setup.ts)

## Exemples locaux

- [`minimal-feature-slice.md`](examples/minimal-feature-slice.md)
- [`decision-record-new-app.md`](examples/decision-record-new-app.md)

## Checklists locales

- [`new-app-readiness.md`](checklists/new-app-readiness.md)
- [`initial-pr-checklist.md`](checklists/initial-pr-checklist.md)

## Scripts locaux

- [`check-react-project.mjs`](scripts/check-react-project.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
