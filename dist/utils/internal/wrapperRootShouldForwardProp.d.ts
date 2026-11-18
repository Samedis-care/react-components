/**
 * `shouldForwardProp` of a theme slot `root` that is a MUI component wrapped
 * with `styled()`. MUI keeps `classes` off a root slot, but a wrapped MUI
 * component takes `classes` itself, so this passes it on, as MUI's own `Menu`
 * and `ListItemButton` do with the component they wrap. Like MUI, it keeps
 * `ownerState`, `theme`, `sx` and `as` back.
 * @param prop The prop's name
 * @returns Whether the prop reaches the wrapped component
 */
declare const wrapperRootShouldForwardProp: (prop: PropertyKey) => boolean;
export default wrapperRootShouldForwardProp;
