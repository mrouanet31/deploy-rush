# A11Y Interaction Review

Skill : `react-forms-events-dom`

## Checklist de validation

- [ ] Le changement respecte le modèle React : composants purs, Hooks valides, rendu déterministe.
- [ ] Les responsabilités sont séparées : UI, état, données, side effects, intégrations externes.
- [ ] Les props et types TypeScript empêchent les états invalides évidents.
- [ ] Les états de chargement, d'erreur, vide et succès sont traités quand pertinents.
- [ ] Les interactions clavier/souris et l’accessibilité de base sont vérifiées.
- [ ] Le code n’introduit pas de données secrètes côté client.
- [ ] Les tests couvrent le comportement visible ou le contrat public.
- [ ] Le lint React Hooks passe sans désactivation injustifiée.
- [ ] Les risques SSR/hydratation sont contrôlés si l’app rend côté serveur.
- [ ] Les choix inhabituels sont explicités dans une note ou ADR.

## Signaux d'alerte

- `eslint-disable` autour des Hooks.
- Effets sans cleanup alors qu'il existe une subscription, un timer ou un listener.
- `dangerouslySetInnerHTML` sans source maîtrisée et sanitation.
- Composant de plus de 250 lignes sans découpage logique.
- Context provider qui force toute l'app à re-render.
- Tests qui inspectent l'état interne au lieu de l'UI ou du contrat.
