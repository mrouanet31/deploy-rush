---
name: react-review-debug-migration
description: Use when auditing, debugging, upgrading, or migrating React codebases: React 18/19 issues, legacy APIs, class components, StrictMode findings, hook dependency bugs, hydration mismatches, framework migrations, and code review.
---

# Review, debug et migration React

## Mission

Diagnostiquer rapidement les problèmes React, moderniser le code existant et produire des reviews actionnables sans réécrire gratuitement l’application.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `debug React`, `migration React`, `upgrade`, `legacy`, `class component`, `StrictMode`, `hydration mismatch`, `code review`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`debug-playbook.md`](references/debug-playbook.md)
- [`migration-strategy.md`](references/migration-strategy.md)
- [`legacy-api-modernization.md`](references/legacy-api-modernization.md)
- [`strict-mode-findings.md`](references/strict-mode-findings.md)
- [`review-rubric.md`](references/review-rubric.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`review/react-review-report.md`](templates/review/react-review-report.md)
- [`migration/migration-plan.md`](templates/migration/migration-plan.md)
- [`debug/hydration-debug-log.md`](templates/debug/hydration-debug-log.md)
- [`debug/hook-bug-report.md`](templates/debug/hook-bug-report.md)

## Exemples locaux

- [`class-to-function-refactor.md`](examples/class-to-function-refactor.md)
- [`strict-mode-double-render.md`](examples/strict-mode-double-render.md)

## Checklists locales

- [`review-checklist.md`](checklists/review-checklist.md)
- [`migration-readiness.md`](checklists/migration-readiness.md)

## Scripts locaux

- [`scan-migration-smells.mjs`](scripts/scan-migration-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
