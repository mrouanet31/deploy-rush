---
name: react-testing-quality
description: Use when adding tests and quality gates for React components, hooks, routes, accessibility, user events, async flows, error boundaries, regression tests, and CI validation.
---

# Tests, qualité et CI React

## Mission

Tester le comportement utilisateur et les contrats React plutôt que les détails d’implémentation fragiles.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `test React`, `RTL`, `Vitest`, `Jest`, `user-event`, `accessibility test`, `hook test`, `CI`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`testing-principles.md`](references/testing-principles.md)
- [`component-tests.md`](references/component-tests.md)
- [`hook-tests.md`](references/hook-tests.md)
- [`a11y-tests.md`](references/a11y-tests.md)
- [`ci-quality-gates.md`](references/ci-quality-gates.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`tests/component.test.tsx`](templates/tests/component.test.tsx)
- [`tests/hook.test.tsx`](templates/tests/hook.test.tsx)
- [`tests/error-boundary.test.tsx`](templates/tests/error-boundary.test.tsx)
- [`ci/github-actions.yml`](templates/ci/github-actions.yml)

## Exemples locaux

- [`test-user-flow.md`](examples/test-user-flow.md)
- [`avoid-implementation-tests.md`](examples/avoid-implementation-tests.md)

## Checklists locales

- [`test-review.md`](checklists/test-review.md)
- [`ci-readiness.md`](checklists/ci-readiness.md)

## Scripts locaux

- [`scan-test-coverage-smells.mjs`](scripts/scan-test-coverage-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
