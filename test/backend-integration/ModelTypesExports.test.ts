import { describe, expect, expectTypeOf, it } from "vitest";
import type * as PackageRoot from "../../src";
import TypeNumber from "../../src/backend-integration/Model/Types/TypeNumber";
import TypeCurrency from "../../src/backend-integration/Model/Types/TypeCurrency";
import TypeLocalizedString from "../../src/backend-integration/Model/Types/TypeLocalizedString";
import type RendererEnumSelect from "../../src/backend-integration/Model/Types/Renderers/RendererEnumSelect";
import type {
	AdvancedEnumValue,
	RendererEnumSelectProps,
} from "../../src/backend-integration/Model/Types/Renderers/RendererEnumSelect";
import type RendererBackendSingleSelect from "../../src/backend-integration/Model/Types/Renderers/RendererBackendSingleSelect";
import type { RendererBackendSingleSelectProps } from "../../src/backend-integration/Model/Types/Renderers/RendererBackendSingleSelect";
import type { ModelUnknown } from "../../src/backend-integration";

// Type-level checks: tsc (tsconfig-test.json) fails on a type that is not exported. The runtime
// assertions check that the package root hands out the module's own classes.

describe("Model data types: the API apps build their own renderers on", () => {
	it("[TOOLING-MODEL-TYPES-ROOT-EXPORTS] exports the abstract number, currency and localized string types from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		const expected: Record<string, unknown> = {
			ModelDataTypeNumber: TypeNumber,
			ModelDataTypeCurrency: TypeCurrency,
			ModelDataTypeLocalizedString: TypeLocalizedString,
		};
		for (const [name, value] of Object.entries(expected)) {
			expect(root[name], `${name} is missing from the package root`).toBe(
				value,
			);
		}
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<typeof PackageRoot.ModelDataTypeNumber>().toEqualTypeOf<
			typeof TypeNumber
		>();
		expectTypeOf<typeof PackageRoot.ModelDataTypeCurrency>().toEqualTypeOf<
			typeof TypeCurrency
		>();
		expectTypeOf<
			typeof PackageRoot.ModelDataTypeLocalizedString
		>().toEqualTypeOf<typeof TypeLocalizedString>();
	}, 90000);

	it("[TOOLING-MODEL-TYPES-ROOT-EXPORTS] exports the params types of the enum select and backend single select renderers from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.RendererEnumSelectProps>().toEqualTypeOf<RendererEnumSelectProps>();
		expectTypeOf<PackageRoot.AdvancedEnumValue>().toEqualTypeOf<AdvancedEnumValue>();
		expectTypeOf<PackageRoot.AdvancedEnumValue<"a" | "b">>().toEqualTypeOf<
			AdvancedEnumValue<"a" | "b">
		>();
		expectTypeOf<
			PackageRoot.RendererBackendSingleSelectProps<ModelUnknown>
		>().toEqualTypeOf<RendererBackendSingleSelectProps<ModelUnknown>>();
		// the types the package root names are the ones the renderers take
		expectTypeOf<
			typeof PackageRoot.ModelDataTypeEnumSelectRenderer
		>().toEqualTypeOf<typeof RendererEnumSelect>();
		expectTypeOf<
			ConstructorParameters<typeof RendererEnumSelect<"a" | "b">>
		>().toEqualTypeOf<
			[
				values: PackageRoot.AdvancedEnumValue<"a" | "b">[],
				defaultValue: "a" | "b",
				props?: PackageRoot.RendererEnumSelectProps,
				numericMode?: boolean,
			]
		>();
		expectTypeOf<
			typeof PackageRoot.ModelDataTypeBackendSingleSelectRenderer
		>().toEqualTypeOf<typeof RendererBackendSingleSelect>();
		expectTypeOf<
			ConstructorParameters<typeof RendererBackendSingleSelect<ModelUnknown>>
		>().toEqualTypeOf<
			[props: PackageRoot.RendererBackendSingleSelectProps<ModelUnknown>]
		>();
	});
});
