import { describe, it, expect, afterEach, vi } from "vitest";
import React, { useContext, useEffect, useState } from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { BasicFormPageNestingContext } from "../../../src/backend-components/Form/BasicFormPage";

afterEach(cleanup);

/**
 * Simulates the parent side of BasicFormPage nesting:
 * provides setChildActive via context, hides footer when childActive is true.
 */
const ParentFormPage = ({ children }: { children?: React.ReactNode }) => {
	const [childActive, setChildActive] = useState(false);
	return (
		<BasicFormPageNestingContext.Provider value={setChildActive}>
			{!childActive && <div data-testid="parent-footer">Parent Buttons</div>}
			<div data-testid="parent-body">{children}</div>
		</BasicFormPageNestingContext.Provider>
	);
};

/**
 * Simulates the child side of BasicFormPage nesting:
 * signals the parent to hide its footer on mount, restores on unmount.
 */
const ChildFormPage = () => {
	const hideParent = useContext(BasicFormPageNestingContext);
	useEffect(() => {
		if (!hideParent) return;
		hideParent(true);
		return () => hideParent(false);
	}, [hideParent]);
	return <div data-testid="child-footer">Child Buttons</div>;
};

describe("BasicFormPageNestingContext", () => {
	it("parent footer is visible when no child is mounted", () => {
		render(<ParentFormPage />);
		expect(screen.getByTestId("parent-footer")).toBeInTheDocument();
	});

	it("parent footer is hidden when a child mounts", () => {
		render(
			<ParentFormPage>
				<ChildFormPage />
			</ParentFormPage>,
		);
		expect(screen.queryByTestId("parent-footer")).not.toBeInTheDocument();
		expect(screen.getByTestId("child-footer")).toBeInTheDocument();
	});

	it("parent footer is restored when the child unmounts", () => {
		const Wrapper = () => {
			const [showChild, setShowChild] = useState(true);
			return (
				<>
					<button data-testid="toggle" onClick={() => setShowChild((v) => !v)}>
						Toggle
					</button>
					<ParentFormPage>{showChild && <ChildFormPage />}</ParentFormPage>
				</>
			);
		};

		render(<Wrapper />);
		expect(screen.queryByTestId("parent-footer")).not.toBeInTheDocument();

		act(() => {
			screen.getByTestId("toggle").click();
		});
		expect(screen.getByTestId("parent-footer")).toBeInTheDocument();
		expect(screen.queryByTestId("child-footer")).not.toBeInTheDocument();
	});

	it("works without a parent context (no-op)", () => {
		render(<ChildFormPage />);
		expect(screen.getByTestId("child-footer")).toBeInTheDocument();
	});

	it("calls hideParent with correct values on mount and unmount", () => {
		const hideParent = vi.fn();
		const { unmount } = render(
			<BasicFormPageNestingContext.Provider value={hideParent}>
				<ChildFormPage />
			</BasicFormPageNestingContext.Provider>,
		);
		expect(hideParent).toHaveBeenCalledWith(true);

		unmount();
		expect(hideParent).toHaveBeenCalledWith(false);
	});
});
