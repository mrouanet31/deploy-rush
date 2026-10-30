# Url And Script Safety

Skill : `react-security-reliability` — Sécurité et fiabilité React

## Objectif

Fournir au coding assistant une référence locale, concise et directement actionnable pour : Empêcher les failles côté UI et rendre l’application robuste face aux données non fiables, aux erreurs de rendu et aux intégrations externes.

## Décisions à prendre avant de coder

- Quel est le contexte : nouvelle app, code existant, bibliothèque, framework full-stack, SPA ou intégration progressive ?
- Quel est le contrat attendu : API de composant, comportement utilisateur, modèle d'état, rendu serveur/client, performance, accessibilité ou sécurité ?
- Quels fichiers doivent être modifiés et quels tests prouvent le changement ?
- Quelle partie relève de React lui-même et quelle partie relève du framework, du router, du cache ou du build tool ?

## Pratiques recommandées

- Préférer des composants purs, des props explicites et une composition lisible.
- Modéliser les états métier avant de distribuer `useState` partout.
- Éviter les Effects inutiles ; utiliser `useEffect` pour synchroniser avec un système externe.
- Valider les frontières client/serveur, surtout avec SSR, RSC, hydratation et directives.
- Ajouter des tests orientés comportements utilisateur plutôt que détails d'implémentation.
- Documenter les choix inhabituels dans une ADR courte.

## Anti-patterns à surveiller

- `useEffect` utilisé pour dériver un état calculable pendant le rendu.
- Props booléennes multiples qui créent des combinaisons invalides.
- Context global utilisé comme store universel sans sélection ni découpage.
- Composants qui font à la fois fetching, transformation métier, rendu, navigation et tracking.
- Memoization manuelle ajoutée sans mesure.
- Clés de listes basées sur index lorsque l'identité métier existe.

## Sortie attendue du coding assistant

- Proposition de structure ou patch clair.
- Code TypeScript/TSX prêt à intégrer.
- Tests ou commandes de validation.
- Risques résiduels et points à vérifier manuellement.
