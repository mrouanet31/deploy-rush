# Effets : usage correct

Un Effect sert à synchroniser un composant React avec un système externe : abonnement, API navigateur impérative, timer, connexion réseau, widget tiers, logging externe ou stockage hors React.

## Ne pas utiliser un Effect pour

- Calculer une valeur dérivée de props ou state.
- Réinitialiser de l'état qui pourrait être contrôlé par une key ou un reducer.
- Chaîner des mises à jour qui appartiennent à un handler d’événement.
- Copier systématiquement des props dans du state local.

## Structure recommandée

1. Identifier le système externe.
2. Déclarer toutes les dépendances réactives utilisées dans l'Effect.
3. Fournir une fonction cleanup si l'Effect crée une subscription, un timer, un listener ou une ressource.
4. Rendre l’Effect idempotent et robuste aux remounts de développement sous StrictMode.

## Exemple

```tsx
useEffect(() => {
  const controller = new AbortController();
  loadData({ signal: controller.signal });
  return () => controller.abort();
}, [loadData]);
```
