---
name: react-security-reliability
description: Use when reviewing React security and reliability: XSS, dangerous HTML, URL handling, secrets, auth boundaries, error boundaries, input validation, hydration safety, external scripts, dependency risk, and failure modes.
---

# Sécurité et fiabilité React

## Mission

Empêcher les failles côté UI et rendre l’application robuste face aux données non fiables, aux erreurs de rendu et aux intégrations externes.

## Quand utiliser cette skill

Utilise cette skill quand la demande contient ou implique : `security React`, `XSS`, `dangerouslySetInnerHTML`, `error boundary`, `auth`, `secrets`, `input validation`, `reliability`.

## Mode opératoire rapide

1. Identifier le type de projet React : framework full-stack, SPA, intégration progressive, bibliothèque de composants, migration ou code existant.
2. Lire uniquement les références locales nécessaires à la tâche.
3. Adapter les templates au framework, aux conventions TypeScript et à l'organisation existante.
4. Produire une réponse orientée code : fichiers à modifier, commandes, tests, risques et points de validation.
5. Ne pas charger tout le pack. Charger uniquement les liens ci-dessous en fonction du besoin.

## Références locales

- [`xss-and-html.md`](references/xss-and-html.md)
- [`url-and-script-safety.md`](references/url-and-script-safety.md)
- [`auth-boundaries.md`](references/auth-boundaries.md)
- [`error-boundaries-reliability.md`](references/error-boundaries-reliability.md)
- [`dependency-risk.md`](references/dependency-risk.md)

- [`react-doc-map.md`](references/react-doc-map.md)

## Templates locaux

- [`security/SafeExternalLink.tsx`](templates/security/SafeExternalLink.tsx)
- [`security/ErrorBoundary.tsx`](templates/security/ErrorBoundary.tsx)
- [`security/sanitize-html.ts`](templates/security/sanitize-html.ts)
- [`security/auth-boundary.tsx`](templates/security/auth-boundary.tsx)

## Exemples locaux

- [`dangerous-html-review.md`](examples/dangerous-html-review.md)
- [`auth-boundary-leak.md`](examples/auth-boundary-leak.md)

## Checklists locales

- [`security-review.md`](checklists/security-review.md)
- [`reliability-review.md`](checklists/reliability-review.md)

## Scripts locaux

- [`scan-react-security-smells.mjs`](scripts/scan-react-security-smells.mjs)

## Règles transverses à respecter

- Traiter ce pack comme des skills de **coding assistant VS Code**. Ne jamais supposer que ces fichiers sont consommés par React au runtime.
- Préférer TypeScript strict, composants purs, props explicites, noms lisibles et tests proches des comportements utilisateur.
- Ne pas inventer une API React. Vérifier les imports réels depuis `react`, `react-dom/client`, `react-dom/server` ou le framework cible.
- Respecter les règles des Hooks : Hooks uniquement au niveau supérieur de composants ou de Hooks personnalisés, jamais dans conditions, boucles, callbacks arbitraires ou code module non-React.
- Distinguer clairement : logique de rendu, logique événementielle, synchronisation avec systèmes externes, données serveur, état client, état URL et cache applicatif.
- Charger les fichiers locaux référencés uniquement lorsque la tâche l’exige afin de préserver le contexte.
