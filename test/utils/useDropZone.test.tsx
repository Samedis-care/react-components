import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook } from "@testing-library/react";
import useDropZone from "../../src/utils/useDropZone";

/** What a browser reports in dataTransfer.types for files dragged in from the desktop */
const FILE_DRAG = { dataTransfer: { types: ["Files"] } };
/** Selected text dragged within the page */
const TEXT_DRAG = { dataTransfer: { types: ["text/plain", "text/html"] } };
/** A link or an image dragged within the page */
const LINK_DRAG = {
	dataTransfer: { types: ["text/plain", "text/uri-list", "text/html"] },
};

const enter = (init: object) =>
	act(() => {
		fireEvent.dragEnter(document.body, init);
	});
const leave = (init: object) =>
	act(() => {
		fireEvent.dragLeave(document.body, init);
	});

describe("useDropZone", () => {
	it("[ISSUE-3489-ITEM-36] does not highlight while text or a link is dragged over the page", () => {
		const { result } = renderHook(() => useDropZone(vi.fn()));
		enter(TEXT_DRAG);
		expect(result.current.dragging).toBe(false);
		leave(TEXT_DRAG);
		enter(LINK_DRAG);
		expect(result.current.dragging).toBe(false);
		leave(LINK_DRAG);
		expect(result.current.dragging).toBe(false);
	});

	it("[ISSUE-3489-ITEM-36] does not highlight for a drag event without dataTransfer", () => {
		const { result } = renderHook(() => useDropZone(vi.fn()));
		enter({});
		expect(result.current.dragging).toBe(false);
	});

	it("[ISSUE-3489-ITEM-36] highlights while files are dragged over the page, until the last element is left", () => {
		const { result } = renderHook(() => useDropZone(vi.fn()));
		enter(FILE_DRAG);
		enter(FILE_DRAG);
		expect(result.current.dragging).toBe(true);
		leave(FILE_DRAG);
		expect(result.current.dragging).toBe(true);
		leave(FILE_DRAG);
		expect(result.current.dragging).toBe(false);
	});

	it("[ISSUE-3489-ITEM-36] a file drag after a cancelled text drag is highlighted and ends cleanly", () => {
		const { result } = renderHook(() => useDropZone(vi.fn()));
		enter(TEXT_DRAG);
		enter(TEXT_DRAG);
		leave(TEXT_DRAG);
		leave(TEXT_DRAG);
		enter(FILE_DRAG);
		expect(result.current.dragging).toBe(true);
		leave(FILE_DRAG);
		expect(result.current.dragging).toBe(false);
	});

	it("[ISSUE-3489-ITEM-36] never highlights without a drop handler", () => {
		const { result } = renderHook(() => useDropZone(undefined));
		enter(FILE_DRAG);
		expect(result.current.dragging).toBe(false);
	});
});
