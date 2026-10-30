# React Compiler

React Compiler est un outil de build qui vise à optimiser automatiquement les composants et valeurs React. Son adoption doit rester mesurée et validée par lint/build/tests.

## Adoption recommandée

1. Corriger d’abord les violations des règles React et Hooks.
2. Activer les lints pertinents.
3. Tester sur un périmètre restreint.
4. Mesurer les comportements critiques avant/après.
5. Supprimer la memoization manuelle devenue inutile uniquement quand les tests et mesures le confirment.

## Directives

- Utiliser les directives de compilation uniquement quand le cas est clair.
- Ne pas masquer un code impur par de la memoization.
- Ne pas confondre optimisation de rendu et optimisation de bundle, réseau ou data fetching.
