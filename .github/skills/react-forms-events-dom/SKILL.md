---
name: react-forms-events-dom
description: Use when building forms, controlled/uncontrolled inputs, event handlers, browser DOM components, portals, accessibility semantics, progressive enhancement, and React DOM integration.
---

# Forms, événements et DOM React

## Mission

Construire des formulaires et interactions DOM fiables, accessibles et compatibles avec le modèle React DOM.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `form`, `input`, `textarea`, `select`, `event`, `controlled`, `uncontrolled`, `portal`, `accessibility`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`forms-controlled-uncontrolled.md`](references/forms-controlled-uncontrolled.md)
- [`event-handlers.md`](references/event-handlers.md)
- [`dom-components.md`](references/dom-components.md)
- [`accessibility-baseline.md`](references/accessibility-baseline.md)
- [`portals-and-layering.md`](references/portals-and-layering.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`forms/ControlledForm.tsx`](templates/forms/ControlledForm.tsx)
- [`forms/UncontrolledForm.tsx`](templates/forms/UncontrolledForm.tsx)
- [`forms/ValidatedField.tsx`](templates/forms/ValidatedField.tsx)
- [`dom/PortalLayer.tsx`](templates/dom/PortalLayer.tsx)

## Exemples locaux

- [`form-state-patterns.md`](examples/form-state-patterns.md)
- [`modal-portal-a11y.md`](examples/modal-portal-a11y.md)

## Checklists locales

- [`forms-review.md`](checklists/forms-review.md)
- [`a11y-interaction-review.md`](checklists/a11y-interaction-review.md)

## Scripts locaux

- [`scan-form-smells.mjs`](scripts/scan-form-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
