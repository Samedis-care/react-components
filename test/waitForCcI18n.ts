import ccI18n from "../src/i18n";

/**
 * Resolves once the library's i18next instance has finished the init that `src/i18n.ts`
 * starts on import and has loaded the given namespaces in its language. Await it in
 * `beforeAll` before a test renders anything translated by that instance:
 * `useCCTranslations` suspends (renders nothing) until then.
 *
 * Never wait with a second `ccI18n.init()`: while the first init still loads (on a busy
 * machine), it resolves at once and swaps in an empty resource store, so the renders
 * suspend after all.
 * @param namespaces The namespaces to load, `"translation"` by default; e.g.
 * `["translation", "countries"]` for a test that also shows country names
 */
export const waitForCcI18n = async (
	namespaces: string | readonly string[] = "translation",
): Promise<void> => {
	if (!ccI18n.isInitialized) {
		await new Promise<void>((resolve) => {
			ccI18n.once("initialized", () => resolve());
		});
	}
	await ccI18n.loadNamespaces(namespaces);
};
