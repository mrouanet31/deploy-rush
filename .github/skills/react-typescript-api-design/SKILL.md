---
name: react-typescript-api-design
description: Use when designing typed React APIs: props, component generics, discriminated unions, controlled components, custom hooks, context typing, children typing, refs, polymorphic components, and public component contracts.
---

# TypeScript et design d’API React

## Mission

Concevoir des APIs React typées qui guident l’usage sans complexifier inutilement les composants.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `React TypeScript`, `props type`, `generic component`, `discriminated union`, `polymorphic`, `children`, `ref typing`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`props-modeling.md`](references/props-modeling.md)
- [`children-and-slots.md`](references/children-and-slots.md)
- [`controlled-uncontrolled-types.md`](references/controlled-uncontrolled-types.md)
- [`hook-types.md`](references/hook-types.md)
- [`refs-polymorphism.md`](references/refs-polymorphism.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`types/component-props.tsx`](templates/types/component-props.tsx)
- [`types/discriminated-union-props.tsx`](templates/types/discriminated-union-props.tsx)
- [`types/use-typed-context.tsx`](templates/types/use-typed-context.tsx)
- [`types/polymorphic-component.tsx`](templates/types/polymorphic-component.tsx)

## Exemples locaux

- [`boolean-props-to-union.md`](examples/boolean-props-to-union.md)
- [`typed-context-pattern.md`](examples/typed-context-pattern.md)

## Checklists locales

- [`typescript-react-api-review.md`](checklists/typescript-react-api-review.md)
- [`public-component-contract.md`](checklists/public-component-contract.md)

## Scripts locaux

- [`scan-typescript-react-smells.mjs`](scripts/scan-typescript-react-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
