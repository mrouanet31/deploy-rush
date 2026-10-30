# Modéliser les props React en TypeScript

## Bonnes pratiques

- Favoriser des noms de props orientés domaine plutôt que détails d’implémentation.
- Remplacer les groupes de booléens incompatibles par des unions discriminées.
- Éviter `React.FC` si le typing implicite de `children` masque le contrat réel.
- Typage explicite de `children` : `ReactNode`, render prop, slot nommé ou absence de children.
- Exporter les types publics quand le composant est destiné à une bibliothèque.

## Exemple

```tsx
type AlertProps =
  | { status: 'success'; message: string; retry?: never }
  | { status: 'error'; message: string; retry: () => void };

export function Alert(props: AlertProps) {
  return <section role={props.status === 'error' ? 'alert' : 'status'}>{props.message}</section>;
}
```
