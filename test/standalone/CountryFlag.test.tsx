import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import React, { createRef, Suspense } from "react";
import { act, cleanup, render, renderHook } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import ccI18n from "../../src/i18n";
import CountryFlags from "../../src/standalone/CountryFlags";
// the tier index the package root re-exports (src/index.ts: export * from it)
import { CountryFlag, useCountryOptions } from "../../src/standalone";

beforeAll(async () => {
	await ccI18n.changeLanguage("en-US");
	await ccI18n.loadNamespaces(["translation", "countries"]);
	await ccI18n.loadLanguages(["de"]);
});
afterAll(async () => {
	await ccI18n.changeLanguage("en-US");
});
afterEach(cleanup);

describe("CountryFlag", () => {
	it("[ISSUE-3466-ITEM-8] shows the country's flag as a decorative image by default", () => {
		const { container, queryByRole } = render(<CountryFlag code="JP" />);
		const img = container.querySelector("img");
		expect(img).toHaveAttribute("src", CountryFlags.JP);
		expect(img).toHaveAttribute("alt", "");
		expect(queryByRole("img")).toBeNull();
	});

	it("[ISSUE-3466-ITEM-8] a named flag is an image named after the country in components-care's language", async () => {
		const { findByRole } = render(
			<Suspense fallback="loading">
				<CountryFlag code="DE" named />
			</Suspense>,
		);
		const img = await findByRole("img", { name: "Germany" });
		expect(img).toHaveAttribute("src", CountryFlags.DE);
		await act(() => ccI18n.changeLanguage("de-DE"));
		expect(await findByRole("img", { name: "Deutschland" })).toBe(img);
		await act(() => ccI18n.changeLanguage("en-US"));
	});

	it("[ISSUE-3466-ITEM-8] a code without a flag leaves the box empty", () => {
		for (const code of ["XX", "de", "constructor", ""]) {
			const { container } = render(<CountryFlag code={code} named />);
			expect(container.childElementCount).toBe(1);
			expect(container.firstElementChild?.tagName).toBe("SPAN");
			expect(container.querySelector("img")).toBeNull();
			cleanup();
		}
	});

	it("[ISSUE-3466-ITEM-8] the box is a span that takes the ref, className, classes and HTML attributes", () => {
		const ref = createRef<HTMLSpanElement>();
		const { container } = render(
			<CountryFlag
				code="JP"
				ref={ref}
				className="mine"
				classes={{ root: "root-class", image: "image-class" }}
				title="Japan"
				data-code="JP"
			/>,
		);
		const box = container.firstElementChild as HTMLElement;
		expect(ref.current).toBe(box);
		expect(box.tagName).toBe("SPAN");
		expect(box).toHaveClass("mine", "root-class");
		expect(box).toHaveAttribute("title", "Japan");
		expect(box).toHaveAttribute("data-code", "JP");
		// the component's own props stay off the DOM
		expect(box).not.toHaveAttribute("code");
		expect(box.querySelector("img")).toHaveClass("image-class");
	});

	it("[ISSUE-3466-ITEM-8] size sets the flag's height: a number in px, a string as it is", () => {
		const { container, rerender } = render(
			<CountryFlag code="JP" size={30} style={{ margin: 4 }} />,
		);
		const box = container.firstElementChild as HTMLElement;
		expect(box.style.getPropertyValue("--cc-country-flag-size")).toBe("30px");
		expect(box.style.margin).toBe("4px");
		rerender(<CountryFlag code="JP" size="1em" />);
		expect(box.style.getPropertyValue("--cc-country-flag-size")).toBe("1em");
		rerender(<CountryFlag code="JP" />);
		expect(box.style.getPropertyValue("--cc-country-flag-size")).toBe("");
	});
});

describe("CountryFlag in a theme", () => {
	it("[ISSUE-3466-ITEM-8] takes the theme's defaultProps, styleOverrides per slot and variants that match its props", () => {
		const themed = createTheme({
			components: {
				CcCountryFlag: {
					defaultProps: { size: 20 },
					styleOverrides: {
						root: { backgroundColor: "rgb(1, 2, 3)" },
						image: { outlineColor: "rgb(4, 5, 6)" },
					},
					variants: [
						{ props: { code: "NP" }, style: { color: "rgb(7, 8, 9)" } },
						{
							props: { named: true },
							style: { borderTopColor: "rgb(10, 11, 12)" },
						},
					],
				},
			},
		});
		const { container, rerender } = render(
			<ThemeProvider theme={themed}>
				<CountryFlag code="JP" />
			</ThemeProvider>,
		);
		const box = container.firstElementChild as HTMLElement;
		expect(box.style.getPropertyValue("--cc-country-flag-size")).toBe("20px");
		expect(getComputedStyle(box).backgroundColor).toBe("rgb(1, 2, 3)");
		expect(
			getComputedStyle(box.querySelector("img") as HTMLElement).outlineColor,
		).toBe("rgb(4, 5, 6)");
		expect(getComputedStyle(box).color).not.toBe("rgb(7, 8, 9)");
		expect(getComputedStyle(box).borderTopColor).not.toBe("rgb(10, 11, 12)");

		rerender(
			<ThemeProvider theme={themed}>
				<Suspense fallback="loading">
					<CountryFlag code="NP" named />
				</Suspense>
			</ThemeProvider>,
		);
		const npBox = container.firstElementChild as HTMLElement;
		expect(getComputedStyle(npBox).color).toBe("rgb(7, 8, 9)");
		expect(getComputedStyle(npBox).borderTopColor).toBe("rgb(10, 11, 12)");
		// the props variants match on stay off the DOM
		expect(npBox.getAttributeNames().sort()).toEqual(["class", "style"]);
	});
});

describe("useCountryOptions", () => {
	it("[ISSUE-3466-ITEM-8] gives each country a decorative CountryFlag as its icon", () => {
		const { result } = renderHook(() => useCountryOptions());
		const misfits = result.current.filter(
			(option) =>
				option.icon.type !== CountryFlag ||
				(option.icon.props as { code?: string }).code !== option.value ||
				(option.icon.props as { named?: boolean }).named,
		);
		expect(misfits).toEqual([]);
		const japan = result.current.find((option) => option.value === "JP");
		const { container } = render(<>{japan?.icon}</>);
		expect(container.querySelector("img")).toHaveAttribute(
			"src",
			CountryFlags.JP,
		);
		expect(container.querySelector("img")).toHaveAttribute("alt", "");
	});
});
