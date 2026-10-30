# React Server Components

Les Server Components permettent d’exécuter une partie de l'arbre React côté serveur ou pendant le build, sans envoyer leur code JavaScript au client. Ils sont généralement exposés via un framework compatible.

## Frontières

- Un composant serveur peut charger des données serveur et rendre du JSX.
- Un composant client est nécessaire dès qu'il faut de l'interactivité navigateur, des Hooks client ou des APIs DOM.
- La directive `'use client'` définit une frontière client dans les frameworks compatibles.
- La directive `'use server'` indique une fonction serveur dans les environnements compatibles.

## À vérifier

- Les props qui traversent la frontière doivent être sérialisables selon le framework.
- Ne pas importer de module serveur depuis un composant client.
- Ne pas exposer secrets, tokens, connexions DB ou code privilégié au bundle client.
- Documenter la frontière dans les composants partagés.
