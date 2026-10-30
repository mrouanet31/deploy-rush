# Reducer Refactor

## Situation

Le coding assistant doit appliquer la skill `react-state-hooks` à un projet React réel.

## Réponse attendue

1. Lire le code existant avant de proposer une structure générique.
2. Identifier le point de friction principal : API confuse, état mal placé, effect inutile, problème de rendu, frontière serveur/client, test manquant ou dette de migration.
3. Proposer un changement incrémental plutôt qu'une réécriture massive.
4. Fournir un patch ou des fichiers complets avec imports réels.
5. Ajouter au moins une validation : test, lint, typecheck, build ou scénario manuel.

## Exemple de formulation de patch

```text
- Extraire la logique métier dans `useFeatureModel()`.
- Transformer les props booléennes en union discriminée.
- Remplacer l'effect de dérivation par un calcul pendant le rendu.
- Ajouter un test utilisateur pour le cas succès et le cas erreur.
```

## Critère de réussite

Le résultat doit être plus simple à maintenir, plus facile à tester, et mieux aligné avec React qu'avant la modification.
