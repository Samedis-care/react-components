import { beforeAll, describe, expect, it } from "vitest";
import React from "react";
import { createTheme } from "@mui/material";
import TypeColor from "../../src/backend-integration/Model/Types/TypeColor";
import ccI18n from "../../src/i18n";

// the type is abstract only because of render(): the validation under test
// lives entirely in the base class
class TestTypeColor extends TypeColor {
	render(): React.ReactElement {
		throw new Error("not used in this test");
	}
}

const type = new TestTypeColor();

const MESSAGE = "Please enter a valid color, such as #336699";

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});

/** The colors a theme palette reads, in each format a user may type or a server may store */
const COLORS = [
	"#336699",
	"#00788A",
	"#abc",
	"#ABC",
	"#abcd",
	"#336699cc",
	"rgb(8, 105, 179)",
	"rgb(8,105,179)",
	"rgb( 0 , 0 , 0 )",
	"rgb(255, 255, 255)",
	"rgb(12.5, 0, 255)",
	"rgb(8, 105, 179, 0.5)",
	"rgba(8, 105, 179, 0.5)",
	"rgba(8, 105, 179, .5)",
	"hsl(210, 50%, 40%)",
	"hsl(0, 0%, 100%)",
	"hsla(210, 50%, 40%, 1)",
];

/** Typos, and colors a browser knows but a theme palette does not read */
const NOT_COLORS = [
	"zzz",
	"abc",
	"336699",
	"red",
	"transparent",
	"#zzz",
	"#12",
	"#12345",
	"#1234567",
	"#336699 ",
	" #336699",
	"rgb(8 105 179)",
	"rgb(8, 105)",
	"rgb(8, 105, 179",
	"rgb (8, 105, 179)",
	"RGB(8, 105, 179)",
	"rgb(256, 0, 0)",
	"rgb(10%, 20%, 30%)",
	"rgba(8, 105, 179, 1.5)",
	"rgba(8, 105, 179, 50%)",
	"rgb(8, 105, 179, 0.5, 1)",
	"hsl(210, 50, 40)",
	"hsl(400, 50%, 40%)",
	"hsl(210, 150%, 40%)",
	"hsl(210deg, 50%, 40%)",
	"color(srgb 0.1 0.4 0.7)",
];

describe("TypeColor", () => {
	it.each(COLORS)(
		"[ISSUE-3485-ITEM-19] accepts %j, which a theme palette reads",
		(color) => {
			expect(type.validate(color)).toBeNull();
			// the palette takes it and derives its shades and contrast text from it
			const { primary } = createTheme({
				palette: { primary: { main: color } },
			}).palette;
			expect(primary.main).toBe(color);
			expect(`${primary.light} ${primary.dark}`).not.toMatch(/NaN/);
			expect(primary.contrastText).toMatch(/^(#fff|rgba\(0, 0, 0, 0\.87\))$/);
		},
	);

	it.each(NOT_COLORS)(
		"[ISSUE-3485-ITEM-19] flags %j as no color, with a message that shows the format",
		(text) => {
			expect(type.validate(text)).toBe(MESSAGE);
		},
	);

	it.each(["", null, undefined])(
		"[ISSUE-3485-ITEM-19] leaves %j, no color, to the field's own required check",
		(empty) => {
			expect(type.validate(empty as string)).toBeNull();
		},
	);
});
