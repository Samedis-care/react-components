# Contributing

## Adding new components

When adding new components please follow these principles and rules:

1. If possible separate your component into the different categories. Example:
   > You want to build a selection component with backend connection.
   > Split your component into a controlled view part (standalone component)
   > and build a component which controls your view part (backend component)
2. Adhere to the [React performance optimization guidelines](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation). In summary:

- Use functional components with `React.memo` or pure components, if you use a normal component make sure to define your own shouldComponentUpdate
- Avoid inline functions and objects and other things which result in `code === code` being false, e.g. `({}) === ({})` => false. If your function/object can be static make it a static variable. Otherwise: For functional components take a look at React.useCallback and React.useMemo. For class components use properties.
- If you want to know the details: [Read more about reconciliation](https://reactjs.org/docs/reconciliation.html)
- Have multiple small components instead of one large component. This will significantly aid performance if combined with the points above.
  Unoptimized code will not be merged.

3. Try to use functional components wherever possible, if you need references use pure class components instead.
4. Avoid using @ts-ignore. If you use it anyways please provide some reasoning in the comments.
5. If you build something that the user can see also build a story.
6. When building a story make sure to capture all events using Storybook's action add-on and make all properties controllable using the knobs add-on.
7. Always comment your code. Especially properties and state should be explained. All functions should be commented, describing function task, params and return value.
8. Don't forget to export your component in the index.ts of your component's parent folder. If you create folders make sure there is an index.ts if your want to export more than one component. Don't mix components and re-exporting indexes.
9. Avoid Anonymous components:

```tsx
// Bad:
export default React.memo((props: any) => "Text");
// Also bad:
const MemoComponent = React.memo((props: any) => "Text");
export default MemoComponent;
// Good:
const Component = (props: any) => "Text";
export default React.memo(Component);
```

10. If you think these principles shouldn't apply to your specific component please provide a reasonable explanation when submitting a pull request.

## Code Style

- The formatting is automatically set and corrected by prettier and enforced using git commit hooks.
- Do not store non-mutable/read-only data in the component state. Use static class properties or static functions instead.
- Use Material-UI Styles/Theme. Do not create global CSS styles. Avoid inline styles.
