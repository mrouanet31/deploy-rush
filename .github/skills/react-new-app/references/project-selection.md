# Choisir le bon point de départ React

## Décision principale

Pour une nouvelle application ou un nouveau site, privilégier un framework React quand il faudra gérer routing, data loading, découpe de code, SSR/SSG, rendu statique ou déploiement production. Une SPA Vite reste adaptée pour widgets, backoffices internes simples, prototypes, applications embarquées dans une page existante ou contraintes où le full-stack framework serait excessif.

## Options usuelles

- Next.js App Router : full-stack React, Server Components, routes serveur/client, rendu hybride.
- React Router v7 framework mode : routing riche, standard Web APIs, Vite, options full-stack.
- Expo : applications natives et universelles.
- Vite React TypeScript : app client-only ou librairie UI sans besoin de rendu serveur.
- Intégration progressive : ajout de React sur une portion de page existante.

## Questions de cadrage

- Le SEO ou le time-to-content sont-ils importants ?
- Le projet a-t-il besoin de routes serveur, actions serveur, RSC, streaming ou pré-rendu ?
- L'équipe sait-elle maintenir le framework choisi ?
- Le projet doit-il rester exportable statiquement ?
- Les contraintes d’hébergement imposent-elles une SPA ou un runtime Node/Docker ?
