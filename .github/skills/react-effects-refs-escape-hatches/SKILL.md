---
name: react-effects-refs-escape-hatches
description: Use when integrating React with external systems, DOM APIs, timers, subscriptions, imperative APIs, refs, layout effects, insertion effects, and effect dependency troubleshooting.
---

# Effects, refs et échappatoires

## Mission

Utiliser les Effects et refs uniquement pour synchroniser React avec des systèmes externes, en évitant de transformer `useEffect` en mécanisme général de dérivation d’état.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `useEffect`, `useLayoutEffect`, `useRef`, `dependency array`, `cleanup`, `subscription`, `DOM imperative`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`effects-purpose.md`](references/effects-purpose.md)
- [`dependencies-and-cleanup.md`](references/dependencies-and-cleanup.md)
- [`refs-and-dom.md`](references/refs-and-dom.md)
- [`layout-vs-passive-effects.md`](references/layout-vs-passive-effects.md)
- [`effect-event-patterns.md`](references/effect-event-patterns.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`hooks/useEventListener.ts`](templates/hooks/useEventListener.ts)
- [`hooks/useInterval.ts`](templates/hooks/useInterval.ts)
- [`hooks/useResizeObserver.ts`](templates/hooks/useResizeObserver.ts)
- [`components/ImperativeFocus.tsx`](templates/components/ImperativeFocus.tsx)

## Exemples locaux

- [`remove-unnecessary-effect.md`](examples/remove-unnecessary-effect.md)
- [`subscription-cleanup.md`](examples/subscription-cleanup.md)

## Checklists locales

- [`effect-review.md`](checklists/effect-review.md)
- [`ref-review.md`](checklists/ref-review.md)

## Scripts locaux

- [`scan-effect-smells.mjs`](scripts/scan-effect-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
