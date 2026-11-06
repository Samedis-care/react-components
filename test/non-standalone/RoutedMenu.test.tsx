import React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme, List } from "@mui/material";
import { createMemoryHistory, History } from "history";
import MaterialMenuItem from "../../src/standalone/Portal/MenuItem/Material";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import RoutedMenu, {
	IRoutedMenuItemDefinition,
	IRoutedMenuProps,
	useRoutedMenuLogic,
} from "../../src/non-standalone/Portal/Menu";

beforeEach(() => {
	// useNavigate scrolls the window to the top; jsdom does not implement it
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

/** The entry button whose text is exactly `title` (also inside a collapsed group) */
const entry = (title: string) => {
	const found = screen
		.getAllByRole("button", { hidden: true })
		.filter((b) => b.textContent === title);
	if (found.length !== 1)
		throw new Error(`${found.length} entries titled "${title}"`);
	return found[0];
};
const middleClick = (el: HTMLElement, button = 1) =>
	fireEvent(el, new MouseEvent("auxclick", { bubbles: true, button }));

type MenuOverrides = Partial<Omit<IRoutedMenuProps, "definition">>;

/** Renders RoutedMenu inside a HistoryRouter of `history` */
const mountWith = <H extends History>(
	defs: IRoutedMenuItemDefinition[],
	history: H,
	props: MenuOverrides = {},
) => {
	const result = render(
		<ThemeProvider theme={theme}>
			<HistoryRouter history={history}>
				<RoutedMenu
					definition={defs}
					wrapper={Wrap}
					menuItem={MaterialMenuItem}
					{...props}
				/>
			</HistoryRouter>
		</ThemeProvider>,
	);
	return { history, ...result };
};

/** Renders RoutedMenu with a memory history that starts at `start` */
const mount = (
	defs: IRoutedMenuItemDefinition[],
	start: string,
	props: MenuOverrides = {},
) => mountWith(defs, createMemoryHistory({ initialEntries: [start] }), props);

const leaf = (
	title: string,
	route?: string,
	extra: Partial<IRoutedMenuItemDefinition> = {},
): IRoutedMenuItemDefinition => ({
	title,
	route,
	shouldRender: true,
	...extra,
});

// ---------------------------------------------------------------------------
// Bugs: these tests assert the expected behavior and fail until fixed
// ---------------------------------------------------------------------------

describe("RoutedMenu bugs", () => {
	it("[ISSUE-3479-ITEM-1] a right click on a routed entry does not open a tab", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		mount([leaf("Profile", "/profile"), leaf("Users", "/users")], "/profile");
		middleClick(entry("Users"), 2);
		expect(open).not.toHaveBeenCalled();
	});

	it("[ISSUE-3479-ITEM-1] useRoutedMenuLogic's entries react to the middle button only, also in a custom rendering", () => {
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		const onAuxClick = vi.fn();
		// an app's own menu: the converted handlers go onto its elements unfiltered
		const Custom = (props: { definition: IRoutedMenuItemDefinition[] }) => {
			const { definition } = useRoutedMenuLogic(props);
			return (
				<>
					{definition.map((def) => (
						<button
							key={def.title}
							type={"button"}
							onClick={def.onClick}
							onAuxClick={def.onAuxClick}
						>
							{def.title}
						</button>
					))}
				</>
			);
		};
		const history = createMemoryHistory({ initialEntries: ["/profile"] });
		render(
			<HistoryRouter history={history}>
				<Custom
					definition={[
						leaf("Profile", "/profile"),
						leaf("Users", "/users", { onAuxClick }),
					]}
				/>
			</HistoryRouter>,
		);
		// right, back and forward
		for (const button of [2, 3, 4]) middleClick(entry("Users"), button);
		expect(open).not.toHaveBeenCalled();
		expect(onAuxClick).not.toHaveBeenCalled();
		middleClick(entry("Users"));
		expect(open.mock.calls).toEqual([["/users"]]);
		expect(onAuxClick).toHaveBeenCalledTimes(1);
		expect(history.location.pathname).toBe("/profile");
	});
});
