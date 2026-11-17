import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";

// The flag images a test file has imported. An app's bundler puts a flag into
// the code of every module that imports it statically: with the apps' webpack
// (`type: "asset"`) as a data URI.
const imported = vi.hoisted(() => new Set<string>());
vi.mock("../../src/assets/img/countries/DE.svg", () => {
	imported.add("DE");
	return { default: "data:image/svg+xml,DE" };
});
vi.mock("../../src/assets/img/countries/JP.svg", () => {
	imported.add("JP");
	return { default: "data:image/svg+xml,JP" };
});

afterEach(cleanup);

// the tests run in order: the flags load once per file
describe("loading the flags", () => {
	it("[ISSUE-3466-ITEM-5] importing the library imports no flag", async () => {
		await import("../../src");
		expect([...imported]).toEqual([]);
	});

	it("[ISSUE-3466-ITEM-5] the first CountryFlag loads the flags and shows its flag once they have loaded", async () => {
		const { CountryFlag } = await import("../../src");
		const { container } = render(<CountryFlag code="DE" />);
		await waitFor(() =>
			expect(container.querySelector("img")).toHaveAttribute(
				"src",
				"data:image/svg+xml,DE",
			),
		);
		expect([...imported].sort()).toEqual(["DE", "JP"]);
	});

	it("[ISSUE-3466-ITEM-5] once the flags have loaded, a CountryFlag shows its flag in its first render", async () => {
		const { CountryFlag } = await import("../../src");
		const { container } = render(<CountryFlag code="JP" />);
		expect(container.querySelector("img")).toHaveAttribute(
			"src",
			"data:image/svg+xml,JP",
		);
	});
});

describe("a failed load", () => {
	// a fresh library whose flags chunk fails to load until `offline` is false
	const offline = { current: true };
	const freshLibrary = async () => {
		vi.resetModules();
		vi.doMock(
			"../../src/standalone/CountryFlags/flags",
			async (importOriginal) => {
				if (offline.current) throw new Error("offline");
				return importOriginal();
			},
		);
		return await import("../../src/standalone");
	};
	afterEach(() => {
		vi.doUnmock("../../src/standalone/CountryFlags/flags");
		vi.restoreAllMocks();
	});

	it("[ISSUE-3466-ITEM-5] loadCountryFlags rejects, and the next call loads the flags", async () => {
		offline.current = true;
		const { loadCountryFlags } = await freshLibrary();
		await expect(loadCountryFlags()).rejects.toBeInstanceOf(Error);
		offline.current = false;
		const flags = await loadCountryFlags();
		expect(flags.DE).toBe("data:image/svg+xml,DE");
		expect(await loadCountryFlags()).toBe(flags);
	});

	it("[ISSUE-3466-ITEM-5] CountryFlags leave their boxes empty and report it once; the next CountryFlag tries again", async () => {
		offline.current = true;
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const { CountryFlag } = await freshLibrary();
		const first = render(
			<>
				<CountryFlag code="DE" />
				<CountryFlag code="JP" />
			</>,
		);
		await waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				"[Components-Care] [CountryFlag] The flags failed to load:",
				expect.any(Error),
			),
		);
		expect(error).toHaveBeenCalledTimes(1);
		expect(first.container.querySelectorAll("span")).toHaveLength(2);
		expect(first.container.querySelector("img")).toBeNull();
		first.unmount();

		offline.current = false;
		const second = render(<CountryFlag code="JP" />);
		await waitFor(() =>
			expect(second.container.querySelector("img")).toHaveAttribute(
				"src",
				"data:image/svg+xml,JP",
			),
		);
		expect(error).toHaveBeenCalledTimes(1);
	});
});
