import React, { useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { unstable_NormalPriority, unstable_scheduleCallback } from "scheduler";

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

// whether the effect of LateUpdate's update has run
const lateUpdate = { effectRan: false };

/**
 * Shows "updated" after a timer. React renders and commits that update in a task of its
 * scheduler, and runs the commit's effects in a later one.
 */
const LateUpdate = () => {
	const [updated, setUpdated] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setUpdated(true), 0);
		return () => clearTimeout(timer);
	}, []);
	useEffect(() => {
		if (updated) lateUpdate.effectRan = true;
	}, [updated]);
	return updated ? <span>updated</span> : null;
};

/** Keeps the thread busy for the given time, as the other work on a loaded machine does */
const keepBusy = (ms: number) => {
	const start = performance.now();
	while (performance.now() - start < ms) {
		// busy
	}
};

// whether the task the previous test queued in React's scheduler has run
const queuedTask = { ran: false };

// The tests run in order: the second checks what test/setup.ts did after the first, and the
// last one what it did after the one before.
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

	it("returns from findBy after the effects of the commit that met its condition, also on a busy machine", async () => {
		render(<LateUpdate />);
		// Runs right after React's task that commits the update, once the commit has met
		// findBy's condition: the 5 ms make Testing Library's own setTimeout(0) due before
		// React's next task, which runs the commit's effects.
		setTimeout(() => setImmediate(() => keepBusy(5)), 0);
		await screen.findByText("updated");
		expect(lateUpdate.effectRan).toBe(true);
	});

	it("queues a task in React's scheduler and ends", () => {
		// as React does for the effects of a commit made outside act()
		unstable_scheduleCallback(unstable_NormalPriority, () => {
			queuedTask.ran = true;
		});
		expect(queuedTask.ran).toBe(false);
	});

	it("runs the tasks a test queued in React's scheduler before the next test starts", () => {
		expect(queuedTask.ran).toBe(true);
	});
});
