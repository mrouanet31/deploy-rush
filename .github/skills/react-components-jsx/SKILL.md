---
name: react-components-jsx
description: Use when writing or reviewing React components, JSX, props, children, conditional rendering, lists, keys, purity, composition patterns, reusable UI primitives, and component API ergonomics.
---

# Composants, JSX et composition

## Mission

Produire des composants purs, explicites et composables, avec des APIs de props robustes et un JSX lisible.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `component`, `JSX`, `props`, `children`, `composition`, `conditional rendering`, `list keys`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`component-purity.md`](references/component-purity.md)
- [`jsx-props-children.md`](references/jsx-props-children.md)
- [`composition-patterns.md`](references/composition-patterns.md)
- [`lists-keys-rendering.md`](references/lists-keys-rendering.md)
- [`legacy-api-avoidance.md`](references/legacy-api-avoidance.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`components/Card.tsx`](templates/components/Card.tsx)
- [`components/EmptyState.tsx`](templates/components/EmptyState.tsx)
- [`components/CompoundTabs.tsx`](templates/components/CompoundTabs.tsx)
- [`components/PolymorphicButton.tsx`](templates/components/PolymorphicButton.tsx)

## Exemples locaux

- [`composition-over-configuration.md`](examples/composition-over-configuration.md)
- [`keys-and-identity.md`](examples/keys-and-identity.md)

## Checklists locales

- [`component-api-review.md`](checklists/component-api-review.md)
- [`jsx-quality.md`](checklists/jsx-quality.md)

## Scripts locaux

- [`scan-component-smells.mjs`](scripts/scan-component-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
