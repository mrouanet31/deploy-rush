# XSS et HTML dynamique

React échappe les valeurs rendues dans JSX, mais ne protège pas contre tous les risques applicatifs : HTML injecté volontairement, URLs dangereuses, scripts tiers, secrets exposés côté client ou données non validées.

## Règles

- Éviter `dangerouslySetInnerHTML` par défaut.
- Si du HTML doit être rendu, limiter la source, sanitizer côté serveur ou dans une couche dédiée, et tester les payloads dangereux.
- Ne jamais mettre de secret dans le bundle client.
- Valider les URLs avant de les placer dans `href`, `src`, `formAction` ou redirections.
- Utiliser `rel="noreferrer"` ou politique équivalente pour les liens externes ouverts dans un nouvel onglet.
