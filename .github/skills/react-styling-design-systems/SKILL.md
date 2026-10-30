---
name: react-styling-design-systems
description: Use when building or refactoring styling approaches, CSS modules, design tokens, component libraries, theming, variants, responsive UI, accessibility-driven components, and reusable design-system primitives.
---

# Styling, design system et UI réutilisable

## Mission

Créer une UI cohérente, accessible et maintenable, en séparant primitives, composants de domaine, tokens et styles applicatifs.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `styling`, `CSS`, `design system`, `tokens`, `theme`, `variants`, `component library`, `responsive`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`styling-strategy.md`](references/styling-strategy.md)
- [`design-tokens.md`](references/design-tokens.md)
- [`component-library.md`](references/component-library.md)
- [`variants-and-composition.md`](references/variants-and-composition.md)
- [`accessibility-ui.md`](references/accessibility-ui.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`design-system/Button.tsx`](templates/design-system/Button.tsx)
- [`design-system/Card.tsx`](templates/design-system/Card.tsx)
- [`design-system/tokens.css`](templates/design-system/tokens.css)
- [`design-system/theme.ts`](templates/design-system/theme.ts)

## Exemples locaux

- [`variant-api.md`](examples/variant-api.md)
- [`tokens-to-components.md`](examples/tokens-to-components.md)

## Checklists locales

- [`design-system-review.md`](checklists/design-system-review.md)
- [`visual-regression-readiness.md`](checklists/visual-regression-readiness.md)

## Scripts locaux

- [`scan-design-system-smells.mjs`](scripts/scan-design-system-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
