import React from "react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme, Link } from "@mui/material";
import i18next, { Resource } from "i18next";
import { Trans } from "react-i18next";
import HowToBox from "../../src/standalone/HowToBox";
import translatedStrings from "../../src/utils/translatedStrings";
import GroupBox from "../../src/standalone/GroupBox";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

// HowToBox suspends until the components-care "translation" namespace is
// loaded, and a suspended first render leaves the container empty whatever the
// props are, so every "renders nothing" assertion would pass vacuously.
beforeAll(async () => {
	await waitForCcI18n();
	expect(ccI18n.hasLoadedNamespace("translation")).toBe(true);
});

const theme = createTheme();

const renderHowToBox = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

const withTheme = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const itemTexts = (scope: HTMLElement = document.body) =>
	within(scope)
		.queryAllByRole("listitem")
		.map((li) => li.textContent);

const fieldsetOf = (container: HTMLElement) => {
	const fieldset = container.querySelector("fieldset");
	if (!fieldset) throw new Error("no fieldset rendered");
	return fieldset;
};

const makeAppI18n = async (resources: Resource) => {
	const inst = i18next.createInstance();
	await inst.init({ lng: "en", resources, initAsync: false });
	return inst;
};

describe("HowToBox", () => {
	it("renders nothing when labels is undefined", () => {
		const { container } = renderHowToBox(<HowToBox labels={undefined} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders a single string label as a list item", async () => {
		renderHowToBox(<HowToBox labels="Single step" />);
		expect(await screen.findByText("Single step")).toBeInTheDocument();
	});

	it("renders an array of strings as separate list items", async () => {
		renderHowToBox(
			<HowToBox labels={["Step one", "Step two", "Step three"]} />,
		);
		expect(await screen.findByText("Step one")).toBeInTheDocument();
		expect(await screen.findByText("Step two")).toBeInTheDocument();
		expect(await screen.findByText("Step three")).toBeInTheDocument();
	});

	it("renders the custom titleLabel", async () => {
		renderHowToBox(<HowToBox titleLabel="Instructions" labels={["Do this"]} />);
		expect(await screen.findByText("Instructions")).toBeInTheDocument();
	});

	it("renders ReactNode items inside the list", async () => {
		renderHowToBox(
			<HowToBox
				labels={[
					<span key="1" data-testid="node-item">
						Rich item
					</span>,
				]}
			/>,
		);
		expect(await screen.findByTestId("node-item")).toBeInTheDocument();
	});

	describe("bugs", () => {
		it("[ISSUE-3463-ITEM-2] renders nothing for an empty labels array", () => {
			const { container, rerender } = renderHowToBox(
				<HowToBox labels={["x"]} />,
			);
			expect(fieldsetOf(container)).toBeInTheDocument();
			rerender(withTheme(<HowToBox labels={[]} />));
			expect(container).toBeEmptyDOMElement();
		});

		it("[ISSUE-3463-ITEM-3] skips array entries that render nothing", () => {
			renderHowToBox(
				<HowToBox
					titleLabel="T"
					labels={["first", "", null, false, undefined, "last"]}
				/>,
			);
			expect(itemTexts()).toEqual(["first", "last"]);
		});

		it("[ISSUE-3463-ITEM-3] keeps 0 as an entry and skips true, as React renders them", () => {
			const { rerender } = renderHowToBox(
				<HowToBox labels={["a", 0, true, "b"]} />,
			);
			expect(itemTexts()).toEqual(["a", "0", "b"]);
			rerender(withTheme(<HowToBox labels={0} />));
			expect(itemTexts()).toEqual(["0"]);
		});

		it("[ISSUE-3463-ITEM-3] renders nothing when no entry renders anything", () => {
			const { container, rerender } = renderHowToBox(
				<HowToBox labels={["x"]} />,
			);
			expect(fieldsetOf(container)).toBeInTheDocument();
			rerender(
				withTheme(<HowToBox labels={["", null, false, undefined, true]} />),
			);
			expect(container).toBeEmptyDOMElement();
			rerender(withTheme(<HowToBox labels={true} />));
			expect(container).toBeEmptyDOMElement();
		});

		it("[ISSUE-3463-ITEM-6] types function styleOverrides and variant props functions without an ownerState, which no slot receives", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						styleOverrides: {
							// @ts-expect-error HowToBox's slots get no ownerState; style by props with variants
							li: ({ ownerState }) => ({
								color: ownerState ? "red" : "blue",
							}),
						},
						variants: [
							{
								// @ts-expect-error a variant's props function gets HowToBox's props directly
								props: ({ ownerState }) => !!ownerState,
								style: { color: "red" },
							},
						],
					},
				},
			});
			expect(themed.components?.CcHowToBox?.styleOverrides?.li).toEqual(
				expect.any(Function),
			);
		});

		it("[ISSUE-3463-ITEM-6] renders with function styleOverrides of the theme for every slot", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						styleOverrides: {
							root: ({ theme: t }) => ({ padding: t.spacing(2) }),
							ul: ({ theme: t }) => ({ paddingLeft: t.spacing(3) }),
							li: ({ theme: t }) => ({ marginTop: t.spacing(1) }),
						},
					},
				},
			});
			const { container } = renderHowToBox(
				<HowToBox titleLabel="T" labels={["a", "b"]} />,
				themed,
			);
			const list = container.querySelector("ul");
			if (!list) throw new Error("no list rendered");
			expect(getComputedStyle(fieldsetOf(container)).paddingTop).toBe("16px");
			expect(getComputedStyle(list).paddingLeft).toBe("24px");
			const items = Array.from(container.querySelectorAll("li"));
			expect(items).toHaveLength(2);
			for (const item of items)
				expect(getComputedStyle(item).marginTop).toBe("8px");
		});

		it("[ISSUE-3463-ITEM-6] applies theme variants keyed on titleLabel", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						variants: [
							{ props: { titleLabel: "V" }, style: { outlineStyle: "dotted" } },
						],
					},
				},
			});
			const { container } = renderHowToBox(
				<>
					<HowToBox titleLabel="V" labels={["a"]} />
					<HowToBox titleLabel="W" labels={["b"]} />
				</>,
				themed,
			);
			const [matching, other] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			expect(getComputedStyle(other).outlineStyle).not.toBe("dotted");
			expect(getComputedStyle(matching).outlineStyle).toBe("dotted");
		});

		it("[ISSUE-3463-ITEM-6] calls a variant's props function with titleLabel and labels after the theme's default props, and styles the entries through a nested selector over styleOverrides.li", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						defaultProps: { titleLabel: "Default" },
						styleOverrides: { li: { color: "rgb(0, 0, 255)" } },
						variants: [
							{
								props: ({ titleLabel }) => titleLabel === "Default",
								style: { "& li": { color: "rgb(255, 0, 0)" } },
							},
							{
								props: ({ labels }) =>
									Array.isArray(labels) && labels.length > 1,
								style: { outlineStyle: "dotted" },
							},
						],
					},
				},
			});
			const { container } = renderHowToBox(
				<>
					<HowToBox labels={["a", "b"]} />
					<HowToBox titleLabel="Own" labels="c" />
				</>,
				themed,
			);
			const [byDefault, own] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			expect(byDefault.querySelector("legend")).toHaveTextContent("Default");
			expect(getComputedStyle(byDefault).outlineStyle).toBe("dotted");
			expect(getComputedStyle(own).outlineStyle).not.toBe("dotted");
			const [a, b] = Array.from(byDefault.querySelectorAll("li"));
			expect(getComputedStyle(a).color).toBe("rgb(255, 0, 0)");
			expect(getComputedStyle(b).color).toBe("rgb(255, 0, 0)");
			const c = own.querySelector("li");
			if (!c) throw new Error("no list item rendered");
			expect(getComputedStyle(c).color).toBe("rgb(0, 0, 255)");
		});

		it("[ISSUE-3463-ITEM-6] keeps titleLabel and labels off the frame's DOM", () => {
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			const { container } = renderHowToBox(
				<HowToBox titleLabel="T" labels={["a"]} />,
			);
			const fieldset = fieldsetOf(container);
			expect(fieldset).not.toHaveAttribute("titlelabel");
			expect(fieldset).not.toHaveAttribute("titleLabel");
			expect(fieldset).not.toHaveAttribute("labels");
			expect(consoleError).not.toHaveBeenCalled();
		});

		it("[ISSUE-3463-ITEM-8] lets a control be described by the steps and an untitled box be named", () => {
			renderHowToBox(
				<>
					<HowToBox
						labels={["Download the template", "Upload it below"]}
						id="howto"
					/>
					<button aria-describedby="howto-list">Upload</button>
					<HowToBox
						titleLabel=""
						labels={["Check the result"]}
						aria-label="Import instructions"
					/>
				</>,
			);
			expect(
				screen.getByRole("button", { name: "Upload" }),
			).toHaveAccessibleDescription(/Download the template.*Upload it below/);
			expect(
				screen.getByRole("group", { name: "Import instructions" }),
			).toBeInTheDocument();
		});

		it("[ISSUE-3463-ITEM-8] sets the id and other HTML attributes on the frame and the derived id on the list, which a box without an id leaves out", () => {
			const { container } = renderHowToBox(
				<>
					<HowToBox
						id="howto"
						labels={["Download the template"]}
						aria-describedby="hint"
						data-testid="box"
						style={{ outlineStyle: "dotted" }}
					/>
					<button aria-describedby="howto">To the frame</button>
					<HowToBox labels={["No id"]} />
				</>,
			);
			const [frame, plain] = Array.from(container.querySelectorAll("fieldset"));
			expect(frame).toHaveAttribute("id", "howto");
			expect(frame).toHaveAttribute("aria-describedby", "hint");
			expect(frame).toHaveAttribute("data-testid", "box");
			expect(frame.style.outlineStyle).toBe("dotted");
			expect(within(frame).getByRole("list")).toHaveAttribute(
				"id",
				"howto-list",
			);
			// the frame's own text alternative is its title, not its entries
			expect(
				screen.getByRole("button", { name: "To the frame" }),
			).toHaveAccessibleDescription("How it works");
			expect(plain).not.toHaveAttribute("id");
			expect(within(plain).getByRole("list")).not.toHaveAttribute("id");
		});

		it("[ISSUE-3463-ITEM-8] applies sx to the frame after the theme's styleOverrides and gives a ref the fieldset", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						styleOverrides: {
							root: { outlineStyle: "dashed", outlineWidth: "3px" },
						},
					},
				},
			});
			const ref = React.createRef<HTMLFieldSetElement>();
			const { container } = renderHowToBox(
				<HowToBox ref={ref} sx={{ outlineStyle: "dotted" }} labels={["a"]} />,
				themed,
			);
			const fieldset = fieldsetOf(container);
			expect(ref.current).toBe(fieldset);
			expect(getComputedStyle(fieldset).outlineStyle).toBe("dotted");
			expect(getComputedStyle(fieldset).outlineWidth).toBe("3px");
			expect(fieldset).not.toHaveAttribute("sx");
		});

		it("[ISSUE-3463-ITEM-9] shows no title for every value that hides GroupBox's label, and the default only for undefined", () => {
			const noTitle = [null, "", false] as const;
			for (const titleLabel of noTitle) {
				const { container } = renderHowToBox(
					<>
						<GroupBox label={titleLabel}>x</GroupBox>
						<HowToBox titleLabel={titleLabel} labels={["a"]} />
					</>,
				);
				const [groupBox, howToBox] = Array.from(
					container.querySelectorAll("fieldset"),
				);
				expect(
					groupBox.querySelector("legend"),
					JSON.stringify(titleLabel),
				).toBeNull();
				expect(
					howToBox.querySelector("legend"),
					JSON.stringify(titleLabel),
				).toBeNull();
				expect(howToBox, JSON.stringify(titleLabel)).toHaveAccessibleName("");
				cleanup();
			}
			const { container } = renderHowToBox(
				<HowToBox titleLabel={undefined} labels={["a"]} />,
			);
			expect(container.querySelector("legend")).toHaveTextContent(
				"How it works",
			);
			expect(screen.getByRole("group")).toHaveAccessibleName("How it works");
		});

		it("[ISSUE-3463-ITEM-9] lets a theme's defaultProps.titleLabel replace the default title, which null still hides", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: { defaultProps: { titleLabel: "Theme title" } },
				},
			});
			const { container } = renderHowToBox(
				<>
					<HowToBox labels={["a"]} />
					<HowToBox titleLabel={null} labels={["b"]} />
				</>,
				themed,
			);
			const [themedBox, untitled] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			expect(themedBox).toHaveAccessibleName("Theme title");
			expect(untitled.querySelector("legend")).toBeNull();
			expect(untitled).toHaveAccessibleName("");
		});

		it("[ISSUE-3463-ITEM-10] styles the title with the theme's styleOverrides.legend over CcGroupBox's legend overrides, which keep styling other GroupBoxes and what the HowToBox override leaves out", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: {
							legend: {
								fontSize: "12px",
								letterSpacing: "1px",
								color: "rgb(1, 2, 3)",
							},
						},
					},
					CcHowToBox: {
						styleOverrides: {
							legend: ({ theme: t }) => ({
								fontSize: "13px",
								fontWeight: t.typography.fontWeightMedium,
								color: "rgb(4, 5, 6)",
							}),
						},
					},
				},
			});
			const { container } = renderHowToBox(
				<>
					<GroupBox label="Files">x</GroupBox>
					<HowToBox labels={["a"]} />
				</>,
				themed,
			);
			const [field, howTo] = Array.from(container.querySelectorAll("legend"));
			expect(howTo).toHaveTextContent("How it works");
			expect(getComputedStyle(field).fontSize).toBe("12px");
			expect(getComputedStyle(field).color).toBe("rgb(1, 2, 3)");
			expect(getComputedStyle(field).fontWeight).not.toBe("500");
			expect(getComputedStyle(howTo).fontSize).toBe("13px");
			expect(getComputedStyle(howTo).fontWeight).toBe("500");
			expect(getComputedStyle(howTo).color).toBe("rgb(4, 5, 6)");
			expect(getComputedStyle(howTo).letterSpacing).toBe("1px");
		});

		it("[ISSUE-3463-ITEM-10] adds classes.legend to the title, and without it leaves the title the classes of CcGroupBox's defaultProps", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						defaultProps: { classes: { legend: "theme-legend" } },
					},
				},
			});
			const { container, rerender } = renderHowToBox(
				<>
					<HowToBox labels={["a"]} classes={{ legend: "own-legend" }} />
					<HowToBox labels={["b"]} classes={{ li: "own-li" }} />
				</>,
				themed,
			);
			const [own, plain] = Array.from(container.querySelectorAll("legend"));
			expect(own).toHaveClass("own-legend");
			expect(plain).toHaveClass("theme-legend");
			expect(plain).not.toHaveClass("own-legend");
			expect(container.querySelector("li.own-li")).toHaveTextContent("b");
			// a class that changes after mount replaces the old one; without one
			// the theme's classes come back
			rerender(
				withTheme(
					<>
						<HowToBox labels={["a"]} classes={{ legend: "next-legend" }} />
						<HowToBox labels={["b"]} classes={{ li: "own-li" }} />
					</>,
					themed,
				),
			);
			expect(container.querySelector("legend")).toBe(own);
			expect(own).toHaveClass("next-legend");
			expect(own).not.toHaveClass("own-legend");
			rerender(
				withTheme(
					<>
						<HowToBox labels={["a"]} />
						<HowToBox labels={["b"]} classes={{ li: "own-li" }} />
					</>,
					themed,
				),
			);
			expect(container.querySelector("legend")).toBe(own);
			expect(own).toHaveClass("theme-legend");
			expect(own).not.toHaveClass("next-legend");
		});

		it("[ISSUE-3463-ITEM-11] numbers the entries in an ordered list with ordered, keeps the list's id and classes, and bullets them without it", () => {
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			const { container, rerender } = renderHowToBox(
				<HowToBox
					id="steps"
					ordered
					labels={["Download the template", "Upload it below"]}
					classes={{ ul: "own-list", li: "own-entry" }}
				/>,
			);
			const fieldset = fieldsetOf(container);
			const list = within(fieldset).getByRole("list");
			expect(list.tagName).toBe("OL");
			expect(list).toHaveAttribute("id", "steps-list");
			expect(list).toHaveClass("own-list");
			expect(
				within(list)
					.getAllByRole("listitem")
					.map((item) => item.className.includes("own-entry")),
			).toEqual([true, true]);
			expect(fieldset).not.toHaveAttribute("ordered");
			expect(consoleError).not.toHaveBeenCalled();
			// the prop takes effect after mount, both ways
			rerender(
				withTheme(
					<HowToBox
						id="steps"
						labels={["Download the template", "Upload it below"]}
					/>,
				),
			);
			expect(within(fieldset).getByRole("list").tagName).toBe("UL");
			rerender(
				withTheme(
					<HowToBox
						id="steps"
						ordered
						labels={["Download the template", "Upload it below"]}
					/>,
				),
			);
			expect(within(fieldset).getByRole("list").tagName).toBe("OL");
		});

		it("[ISSUE-3463-ITEM-11] lets a theme number every box with defaultProps.ordered, which ordered={false} turns off, and match ordered in its variants", () => {
			const themed = createTheme({
				components: {
					CcHowToBox: {
						defaultProps: { ordered: true },
						variants: [
							{ props: { ordered: true }, style: { outlineStyle: "dotted" } },
							{ props: { ordered: false }, style: { outlineStyle: "dashed" } },
						],
					},
				},
			});
			const { container } = renderHowToBox(
				<>
					<HowToBox labels={["a", "b"]} />
					<HowToBox ordered={false} labels={["c", "d"]} />
				</>,
				themed,
			);
			const [numbered, bulleted] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			expect(within(numbered).getByRole("list").tagName).toBe("OL");
			expect(getComputedStyle(numbered).outlineStyle).toBe("dotted");
			expect(within(bulleted).getByRole("list").tagName).toBe("UL");
			expect(getComputedStyle(bulleted).outlineStyle).toBe("dashed");
			// without the theme default, an omitted ordered matches ordered: false
			cleanup();
			const plainTheme = createTheme({
				components: {
					CcHowToBox: {
						variants: [
							{ props: { ordered: false }, style: { outlineStyle: "dashed" } },
						],
					},
				},
			});
			const { container: plain } = renderHowToBox(
				<HowToBox labels={["a", "b"]} />,
				plainTheme,
			);
			expect(getComputedStyle(fieldsetOf(plain)).outlineStyle).toBe("dashed");
		});

		it("[ISSUE-3463-ITEM-11] gives the list of a single entry the class CcHowToBox-singleEntry, also when the other entries are skipped, and keeps it a one-item list", () => {
			const { container, rerender } = renderHowToBox(
				<HowToBox id="tip" labels="This is a single helpful hint." />,
			);
			const list = within(fieldsetOf(container)).getByRole("list");
			expect(list).toHaveClass("CcHowToBox-singleEntry");
			expect(list).toHaveAttribute("id", "tip-list");
			expect(within(list).getAllByRole("listitem")).toHaveLength(1);
			rerender(
				withTheme(
					<HowToBox id="tip" ordered labels={[null, "Only step", ""]} />,
				),
			);
			expect(within(fieldsetOf(container)).getByRole("list")).toHaveClass(
				"CcHowToBox-singleEntry",
			);
			// a second entry after mount takes the class away
			rerender(
				withTheme(<HowToBox id="tip" ordered labels={["First", "Second"]} />),
			);
			expect(within(fieldsetOf(container)).getByRole("list")).not.toHaveClass(
				"CcHowToBox-singleEntry",
			);
		});

		it("[ISSUE-3463-ITEM-12] shows a rich entry with markup next to the entries of a translated array, interpolated with the values passed to t", async () => {
			const app = await makeAppI18n({
				en: {
					translation: {
						link: "Download the <dl>template</dl>",
						help: ["Fill in at most {{count}} rows", "Upload the file below"],
					},
				},
			});
			renderHowToBox(
				<HowToBox
					labels={[
						<Trans
							key="link"
							i18n={app}
							t={app.t}
							i18nKey="link"
							components={{ dl: <Link href="/template.xlsx" /> }}
						/>,
						...translatedStrings(
							app.t("help", { returnObjects: true, count: 500 }),
						),
					]}
				/>,
			);
			const box = screen.getByRole("group", { name: "How it works" });
			expect(itemTexts(box)).toEqual([
				"Download the template",
				"Fill in at most 500 rows",
				"Upload the file below",
			]);
			expect(
				within(box).getByRole("link", { name: "template" }),
			).toHaveAttribute("href", "/template.xlsx");
		});
	});
});
