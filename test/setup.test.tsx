import React, { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// whether React has unmounted what the first test rendered
const firstRender = { unmounted: false };

/** Records its unmount in firstRender */
const UnmountProbe = () => {
	useEffect(
		() => () => {
			firstRender.unmounted = true;
		},
		[],
	);
	return <span>rendered by the first test</span>;
};

// The two tests run in order: the second checks what test/setup.ts did after the first.
describe("unit test setup", () => {
	it("leaves the unmounting of a render to the setup", () => {
		render(<UnmountProbe />);
		expect(screen.getByText("rendered by the first test")).toBeInTheDocument();
		expect(firstRender.unmounted).toBe(false);
	});

	it("unmounts and removes what a test rendered before the next test starts", () => {
		expect(firstRender.unmounted).toBe(true);
		expect(document.body).toBeEmptyDOMElement();
	});
});
