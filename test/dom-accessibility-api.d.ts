// dom-accessibility-api ships its types, but its package `exports` hide them from
// TypeScript's bundler/node resolution, so the test config cannot see them (TS7016).
// The tests use only these two functions.
declare module "dom-accessibility-api" {
	export function computeAccessibleName(root: Element): string;
	export function computeAccessibleDescription(root: Element): string;
}
