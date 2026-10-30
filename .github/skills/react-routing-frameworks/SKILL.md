---
name: react-routing-frameworks
description: Use when choosing or integrating React frameworks and routers: Next.js App Router, React Router v7, Remix-style routing, Expo, Vite SPA, route-level data, layouts, code splitting, and progressive migration.
---

# Frameworks, routing et intégration applicative

## Mission

Choisir le bon cadre d’application React et organiser routing, layouts, data loading et rendu sans enfermer inutilement le projet.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `routing`, `React Router`, `Next.js`, `App Router`, `Remix`, `Expo`, `Vite SPA`, `framework choice`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`framework-choice.md`](references/framework-choice.md)
- [`routing-boundaries.md`](references/routing-boundaries.md)
- [`layouts-and-data.md`](references/layouts-and-data.md)
- [`spa-vs-fullstack.md`](references/spa-vs-fullstack.md)
- [`progressive-adoption.md`](references/progressive-adoption.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`react-router/routes.tsx`](templates/react-router/routes.tsx)
- [`next-app-router/page.tsx`](templates/next-app-router/page.tsx)
- [`vite-spa/router.tsx`](templates/vite-spa/router.tsx)
- [`adr/framework-choice-adr.md`](templates/adr/framework-choice-adr.md)

## Exemples locaux

- [`routing-decision-matrix.md`](examples/routing-decision-matrix.md)
- [`route-boundary-refactor.md`](examples/route-boundary-refactor.md)

## Checklists locales

- [`framework-selection.md`](checklists/framework-selection.md)
- [`routing-review.md`](checklists/routing-review.md)

## Scripts locaux

- [`scan-routing-smells.mjs`](scripts/scan-routing-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
