import { describe, expect, it } from "vitest";
import CrudFileUpload from "../../src/backend-components/FileUpload/CrudFileUpload";
import DefaultFormPage from "../../src/backend-components/Form/DefaultFormPage";
import DefaultFormPageButtons from "../../src/backend-components/Form/DefaultFormPageButtons";

/**
 * A module cycle here does not fail loudly at the cycle: it fails wherever a styled()
 * call runs against a partially initialised module, as
 * `Cannot read properties of undefined (reading '__emotion_styles')` at import time.
 * These modules used to be unimportable outside a bundler for exactly that reason —
 * DefaultFormPageButtons pulled the standalone barrel back in and styled ActionButton
 * before ActionButton's own module had finished.
 */
describe("backend component modules import without a cycle", () => {
	it("CrudFileUpload", () => {
		expect(CrudFileUpload).toBeDefined();
	});

	it("DefaultFormPage and its buttons", () => {
		expect(DefaultFormPage).toBeDefined();
		expect(DefaultFormPageButtons).toBeDefined();
	});
});
