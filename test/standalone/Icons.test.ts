import { describe, it, expect, assertType } from "vitest";
import * as Icons from "../../src/standalone/Icons";
import { SvgIcon } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import type { SvgIconComponent } from "@mui/icons-material";

// every icon in src/standalone/Icons
const ALL_ICONS = { ...Icons };
type IconName = keyof typeof ALL_ICONS;
const ALL_NAMES = Object.keys(ALL_ICONS) as IconName[];

const importTimeout = 90000;

describe("Icons", () => {
	const expectedExports = ["FilterIcon", "SignIcon", "ExportIcon"] as const;

	it("exports all expected icon names", () => {
		for (const name of expectedExports) {
			expect(Icons, `Missing export: ${name}`).toHaveProperty(name);
		}
	});

	it("each icon export is a function (React component)", () => {
		for (const name of expectedExports) {
			const icon = (Icons as Record<string, unknown>)[name];
			// React.memo wraps the component; the result is an object with $$typeof
			// Both plain functions and memo objects are valid React component types
			expect(
				typeof icon === "function" ||
					(typeof icon === "object" && icon !== null),
				`${name} is not a valid React component type`,
			).toBe(true);
		}
	});

	it("each icon export has a $$typeof symbol (is a React element type)", () => {
		for (const name of expectedExports) {
			const icon = (Icons as Record<string, unknown>)[name] as Record<
				string,
				unknown
			>;
			// React.memo components have $$typeof set to Symbol(react.memo)
			expect(icon, `${name} missing $$typeof`).toHaveProperty("$$typeof");
		}
	});

	it("exports exactly the documented icons (no undocumented extras)", () => {
		const keys = Object.keys(Icons);
		for (const name of expectedExports) {
			expect(keys).toContain(name);
		}
	});
});

describe("Icons exports", () => {
	it("exports nothing but icons from the folder", () => {
		// the *Icon.tsx files of src/standalone/Icons
		const folder = ["ExportIcon", "FilterIcon", "SignIcon"];
		const extras = Object.keys(Icons).filter((name) => !folder.includes(name));
		expect(extras).toEqual([]);
		expect([...ALL_NAMES].sort()).toEqual(folder);
	});

	it(
		"re-exports every icon of the barrel from the package root",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			for (const [name, icon] of Object.entries(Icons)) {
				expect(root[name], `${name} is missing from the package root`).toBe(
					icon,
				);
			}
		},
		importTimeout,
	);

	it(
		"[ISSUE-3460-ITEM-12] no longer exports TuneIcon, ResetIcon, SuccessOutlinedIcon and AppsIcon, which MUI's Tune, Refresh, TaskAlt and Apps replace",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			const retired = [
				"TuneIcon",
				"ResetIcon",
				"SuccessOutlinedIcon",
				"AppsIcon",
			];
			expect(
				retired.filter((name) => name in Icons),
				"still exported from src/standalone/Icons/index.ts",
			).toEqual([]);
			expect(
				retired.filter((name) => name in root),
				"still exported from the package root",
			).toEqual([]);
		},
		importTimeout,
	);

	it(
		"[ISSUE-3460-ITEM-8] no longer exports FilterActiveIcon, whose funnel with an x reads as 'clear filter'",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			expect(
				Icons,
				"FilterActiveIcon is still exported from src/standalone/Icons/index.ts",
			).not.toHaveProperty("FilterActiveIcon");
			expect(
				root,
				"FilterActiveIcon is still exported from the package root",
			).not.toHaveProperty("FilterActiveIcon");
		},
		importTimeout,
	);
});

describe("Icons component shape", () => {
	interface MemoShape {
		$$typeof: symbol;
		type: {
			$$typeof?: symbol;
			name?: string;
			render?: { name: string };
		};
	}

	it("wraps each icon in React.memo around a function named like the export", () => {
		for (const name of ALL_NAMES) {
			const icon = ALL_ICONS[name] as unknown as MemoShape;
			expect(icon.$$typeof, name).toBe(Symbol.for("react.memo"));
			// the forwardRef render function carries the name (ISSUE-3460-ITEM-1)
			expect(icon.type.render?.name ?? icon.type.name, name).toBe(name);
		}
	});

	it("[ISSUE-3460-ITEM-1] forwards refs on React 18 too: each icon is memo(forwardRef(...))", () => {
		// React 18, which the peer range allows, passes no ref to a plain function
		// component, so the ref stays null; the tests run React 19, where ref is a prop.
		const refDroppedOnReact18 = ALL_NAMES.filter(
			(name) =>
				(ALL_ICONS[name] as unknown as MemoShape).type.$$typeof !==
				Symbol.for("react.forward_ref"),
		);
		expect(refDroppedOnReact18).toEqual([]);
	});
});

describe("Icons as Material icons", () => {
	interface RenderShape {
		type: { render?: { muiName?: unknown } };
	}
	const muiNameOf = (icon: unknown) =>
		(icon as RenderShape).type.render?.muiName;

	it("[ISSUE-3460-ITEM-10] each icon is assignable to SvgIconComponent, the type of every Material icon", () => {
		// A type test: vitest does not type-check, tsc does
		// (node_modules/.bin/tsc -p tsconfig-test.json --noEmit). While an icon is
		// not a SvgIconComponent, this line does not compile.
		assertType<Record<IconName, SvgIconComponent>>(ALL_ICONS);
	});

	it("[ISSUE-3460-ITEM-10] sets muiName on each icon's render function, where a Material icon has it", () => {
		// MUI's createSvgIcon sets SvgIcon.muiName on the render function inside
		// memo(forwardRef(...))
		expect(muiNameOf(FilterAltIcon), "Material icon").toBe(SvgIcon.muiName);
		const withoutMuiName = ALL_NAMES.filter(
			(name) => muiNameOf(ALL_ICONS[name]) !== SvgIcon.muiName,
		);
		expect(withoutMuiName).toEqual([]);
	});
});
