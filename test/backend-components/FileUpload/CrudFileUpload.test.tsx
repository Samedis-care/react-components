import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import type { GetDefaultThemeCallback } from "../../../src/framework/ThemeProvider";
import CrudFileUpload, {
	BackendFileMeta,
	CrudFileUploadProps,
} from "../../../src/backend-components/FileUpload/CrudFileUpload";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import LazyConnector from "../../../src/backend-integration/Connector/LazyConnector";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import Connector from "../../../src/backend-integration/Connector/Connector";
import type ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";

import type {
	FileData,
	FileMeta,
	FileUploadDispatch,
} from "../../../src/standalone/FileUpload/Generic";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

afterEach(cleanup);

const SERVER_FILES = [
	{
		id: "1",
		name: "document.pdf",
		type: "application/pdf",
		downloadLink: "#document",
	},
	{
		id: "2",
		name: "image.png",
		type: "image/png",
		downloadLink: "#image",
	},
];

const serialize = (data: FileData<File>): Record<string, unknown> => ({
	name: data.file.name,
	type: data.file.type,
	// what makes it an existing file to the standalone control, which only marks a file
	// for removal if it has one — a picked file it just drops
	downloadLink: `#${data.file.name}`,
});

const deserialize = (
	data: Record<string, unknown>,
): FileData<BackendFileMeta> => ({
	file: {
		name: data.name as string,
		type: data.type as string,
		downloadLink: data.downloadLink as string,
		id: data.id as string,
	},
	canBeUploaded: false,
	delete: false,
});

const pick = (name: string, type = "text/plain") =>
	new File(["content"], name, { type });

/**
 * What the control could not write, where a test can read it
 * @remarks DefaultErrorComponent pushes a dialog and renders nothing.
 */
const ErrorSink = (props: ErrorComponentProps) => (
	<span data-testid={"error"}>{props.error.message}</span>
);

/**
 * A backend which remembers what it was actually asked to do
 * @remarks The whole point of a LazyConnector is that a queued write has not happened
 *          yet, which the control's own state cannot show — only the backend can.
 */
class RecordingConnector extends MockConnector {
	public creates: Record<string, unknown>[] = [];
	public updates: Record<string, unknown>[] = [];
	public deletes: string[] = [];

	create(data: Record<string, unknown>) {
		this.creates.push(data);
		return super.create(data);
	}

	update(data: Record<string, unknown>) {
		this.updates.push(data);
		return super.update(data);
	}

	delete(id: string) {
		this.deletes.push(id);
		super.delete(id);
	}
}

/**
 * A backend which refuses the writes it is told to refuse
 * @remarks It records only what it did, so `creates` and `deletes` are what actually
 *          reached the server.
 */
class RejectingConnector extends RecordingConnector {
	public rejectCreates = new Set<string>();
	public rejectDeletes = new Set<string>();

	create(data: Record<string, unknown>) {
		const name = data.name as string;
		if (this.rejectCreates.has(name))
			throw new Error(`upload of ${name} refused`);
		return super.create(data);
	}

	delete(id: string) {
		if (this.rejectDeletes.has(id)) throw new Error(`delete of ${id} refused`);
		super.delete(id);
	}
}

/**
 * A backend whose uploads only finish when the test says so, to hold open the window in
 * which a picked file has been handed over but not yet heard back about
 */
class GatedConnector extends MockConnector {
	public creates = 0;
	private release: (() => void) | null = null;
	private readonly gate = new Promise<void>((resolve) => {
		this.release = resolve;
	});

	async create(data: Record<string, unknown>) {
		this.creates++;
		await this.gate;
		return super.create(data);
	}

	finish() {
		this.release?.();
	}
}

/** The names of the files the backend holds, in the order it lists them */
const onServer = async (connector: Connector) =>
	(await connector.index({ rows: Number.MAX_SAFE_INTEGER }))[0].map(
		(record) => record.name as string,
	);

const lazyOver = (connector: Connector) =>
	// fakeReads false is what a form uses for an existing record: reads go to the
	// backend, writes are queued
	new LazyConnector(connector as unknown as ApiConnector, false);

type Harness = ReturnType<typeof renderUpload>;

/** Renders the control with the given extra props, for an owner around it */
type RenderControl = (
	extra?: Partial<CrudFileUploadProps>,
) => React.ReactElement;

interface RenderOptions {
	/** An owner that renders the control itself, e.g. to re-render it or pass inline props */
	Owner?: React.ComponentType<{ upload: RenderControl }>;
	/** The Framework's theme */
	theme?: GetDefaultThemeCallback;
}

const renderUpload = (
	props: Partial<CrudFileUploadProps> & Pick<CrudFileUploadProps, "connector">,
	options: RenderOptions = {},
) => {
	const ref = React.createRef<FileUploadDispatch>();
	const { Owner, theme } = options;
	const upload: RenderControl = (extra) => (
		<CrudFileUpload
			ref={ref}
			errorComponent={ErrorSink}
			serialize={serialize}
			deserialize={deserialize}
			previewSize={24}
			label={"Attachments"}
			{...props}
			{...extra}
		/>
	);
	const tree = (extra?: Partial<CrudFileUploadProps>) => (
		<Framework defaultTheme={theme}>
			{Owner ? <Owner upload={upload} /> : upload(extra)}
		</Framework>
	);
	const { container, unmount, rerender } = render(tree());

	const labels = () =>
		// emotion folds the slot into one generated class ("css-hash-CcFile-label")
		Array.from(
			container.querySelectorAll<HTMLElement>('[class*="CcFile-label"]'),
		);
	const names = () => labels().map((label) => label.textContent ?? "");
	const labelOf = (name: string) => {
		const label = labels().find((label) => label.textContent === name);
		if (!label)
			throw new Error(`no file named ${name} in [${names().join(", ")}]`);
		return label;
	};
	/**
	 * The entry a file is rendered in: the widest ancestor that still holds only this
	 * one file, so that a lookup inside it cannot reach another file's buttons
	 */
	const rowOf = (name: string) => {
		let el: HTMLElement = labelOf(name);
		while (
			el.parentElement &&
			el.parentElement.querySelectorAll('[class*="CcFile-label"]').length === 1
		)
			el = el.parentElement;
		return el;
	};
	const iconOf = (name: string, testId: string) =>
		rowOf(name).querySelector(`[data-testid="${testId}"]`);
	const click = async (icon: Element | null, what: string) => {
		if (!icon) throw new Error(`no ${what} to click`);
		await act(async () => {
			fireEvent.click(icon);
			// let the change the click started reach the connector: the control applies
			// changes one after the other, so it takes a turn of the microtask queue
			await Promise.resolve();
		});
	};

	return {
		ref,
		container,
		unmount,
		/** Renders the same control again with these props changed */
		rerender: (extra: Partial<CrudFileUploadProps>) => rerender(tree(extra)),
		names,
		/** What the file is shown as, relative to the server: added, removed or nothing */
		changeOf: (name: string) => labelOf(name).getAttribute("data-cc-change"),
		/** What every file of that name is shown as, in list order */
		changesOf: (name: string) =>
			labels()
				.filter((label) => label.textContent === name)
				.map((label) => label.getAttribute("data-cc-change")),
		hasRestore: (name: string) => !!iconOf(name, "RestoreFromTrashIcon"),
		hasRemove: (name: string) => !!iconOf(name, "CancelOutlinedIcon"),
		remove: (name: string) =>
			click(iconOf(name, "CancelOutlinedIcon"), `remove button for ${name}`),
		restore: (name: string) =>
			click(iconOf(name, "RestoreFromTrashIcon"), `restore button for ${name}`),
		addFile: async (file: File) => {
			await act(async () => {
				await ref.current?.addFile(file);
			});
		},
		/** Lets a change the control is applying run to its end */
		settle: async () => {
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		},
		/** What the control reports it could not write, if anything */
		errorText: () =>
			container.querySelector('[data-testid="error"]')?.textContent ?? null,
		/** The dot the label carries while the field is marked as modified */
		dirtyMarker: () =>
			!!container.querySelector('[class*="CcDirtyMarker-root"]'),
	};
};

const loaded = async (ui: Harness) => {
	await waitFor(() => expect(ui.names()).toContain("document.pdf"));
};

describe("CrudFileUpload", () => {
	describe("without a LazyConnector", () => {
		it("lists what the connector has, with nothing marked", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			expect(ui.names()).toEqual(["document.pdf", "image.png"]);
			expect(ui.changeOf("document.pdf")).toBe(null);
			expect(ui.hasRestore("document.pdf")).toBe(false);
		});

		it("uploads a picked file right away and lists it unmarked", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			// the two it started with, plus the picked one, each listed once
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			// it is on the server, so there is no pending change to show
			expect(connector.creates).toHaveLength(1);
			expect(ui.changeOf("notes.txt")).toBe(null);
		});

		it("deletes a removed file right away and drops it from the list", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.names()).toEqual(["image.png"]));
			// nothing to undo: the file is gone from the server
			expect(connector.deletes).toEqual(["1"]);
		});

		it("shows no marker for showDirtyState, since nothing is ever pending", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({
				connector,
				showDirtyState: true,
				onDirtyChange,
			});
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.names()).not.toContain("document.pdf"));

			expect(ui.dirtyMarker()).toBe(false);
			expect(onDirtyChange.mock.calls.flat()).not.toContain(true);
		});

		it("shows the marker when the application sets dirty itself", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector, dirty: true });
			await loaded(ui);

			expect(ui.dirtyMarker()).toBe(true);
		});
	});

	describe("with a LazyConnector", () => {
		it("queues a picked file and marks it as added", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			// the two it started with, plus the picked one, each listed once
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			// queued, not sent
			expect(backend.creates).toHaveLength(0);
			expect(lazy.isQueueEmpty()).toBe(false);
			await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
		});

		it("removing a queued upload cancels it and takes it off the list", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));

			await ui.remove("notes.txt");

			// nothing on the server to restore it from, so it leaves rather than being
			// shown as removed
			await waitFor(() => expect(ui.names()).not.toContain("notes.txt"));
			expect(lazy.isQueueEmpty()).toBe(true);
			expect(backend.creates).toHaveLength(0);
			expect(backend.deletes).toHaveLength(0);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("queues a removal, keeps the file listed and offers a restore", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			expect(ui.hasRestore("document.pdf")).toBe(true);
			expect(backend.deletes).toHaveLength(0);
			expect(lazy.getQueuedOperation("1")).toBe("delete");
		});

		it("restoring drops the queued delete", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

			await ui.restore("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe(null));
			expect(ui.hasRestore("document.pdf")).toBe(false);
			expect(lazy.isQueueEmpty()).toBe(true);
			expect(lazy.getQueuedOperation("1")).toBe(null);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("keeps the other removal when one of two is restored", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await ui.remove("image.png");
			await waitFor(() => expect(ui.changeOf("image.png")).toBe("removed"));

			await ui.restore("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe(null));
			expect(ui.changeOf("image.png")).toBe("removed");
			expect(lazy.getQueuedOperation("1")).toBe(null);
			expect(lazy.getQueuedOperation("2")).toBe("delete");
		});

		it("takes an upload and a removal at the same time", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			// the queued upload keeps its own mark, and nothing has left the list: the
			// removal is pending, not done
			expect(ui.changeOf("notes.txt")).toBe("added");
			expect(ui.names()).toHaveLength(3);
			expect(ui.names().filter((name) => name === "notes.txt")).toHaveLength(1);
		});

		describe("dirty state", () => {
			it("marks the field while changes are queued, when asked to", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const ui = renderUpload({
					connector: lazyOver(backend),
					showDirtyState: true,
				});
				await loaded(ui);
				expect(ui.dirtyMarker()).toBe(false);

				await ui.remove("document.pdf");
				await waitFor(() => expect(ui.dirtyMarker()).toBe(true));

				await ui.restore("document.pdf");
				await waitFor(() => expect(ui.dirtyMarker()).toBe(false));
			});

			it("reports pending changes even when they are not shown", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const onDirtyChange = vi.fn();
				const ui = renderUpload({
					connector: lazyOver(backend),
					onDirtyChange,
				});
				await loaded(ui);
				expect(onDirtyChange).toHaveBeenLastCalledWith(false);

				await ui.remove("document.pdf");

				await waitFor(() =>
					expect(onDirtyChange).toHaveBeenLastCalledWith(true),
				);
				// state, not display: the field itself stays unmarked...
				expect(ui.dirtyMarker()).toBe(false);
				// ...while the file still shows what is pending for it, which is the only
				// way to offer the restore
				expect(ui.changeOf("document.pdf")).toBe("removed");
			});

			it("lets an explicit dirty prop win over the queue", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const ui = renderUpload({
					connector: lazyOver(backend),
					showDirtyState: true,
					dirty: false,
				});
				await loaded(ui);

				await ui.remove("document.pdf");

				await waitFor(() =>
					expect(ui.changeOf("document.pdf")).toBe("removed"),
				);
				expect(ui.dirtyMarker()).toBe(false);
			});
		});

		it("reads its pending marks back off the connector after a remount", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.addFile(pick("notes.txt"));
			await waitFor(() => expect(first.changeOf("notes.txt")).toBe("added"));
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);

			first.unmount();
			const second = renderUpload({ connector: lazy });
			await loaded(second);

			// the queue outlives the control, so the marks do too — and so does the
			// file count: one existing, one queued upload, one queued removal
			expect(second.names()).toHaveLength(3);
			expect(second.changeOf("document.pdf")).toBe("removed");
			expect(second.hasRestore("document.pdf")).toBe(true);
			expect(second.changeOf("notes.txt")).toBe("added");
			expect(
				second.names().filter((name) => name === "notes.txt"),
			).toHaveLength(1);
			expect(
				second.names().filter((name) => name === "document.pdf"),
			).toHaveLength(1);
		});

		it("restores after a remount, against the connector rather than the copy it lost", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);

			first.unmount();
			const second = renderUpload({ connector: lazy });
			await loaded(second);
			await second.restore("document.pdf");

			await waitFor(() => expect(second.changeOf("document.pdf")).toBe(null));
			expect(lazy.isQueueEmpty()).toBe(true);
		});

		it("clears the marks and drops removed files once the queue is worked", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({
				connector: lazy,
				showDirtyState: true,
				onDirtyChange,
			});
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

			await act(async () => {
				await lazy.workQueue();
			});

			// what was pending has happened: the upload is a file like any other, and the
			// removed one is gone from the server, so it goes from the list as well
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe(null));
			expect(ui.names()).not.toContain("document.pdf");
			expect(ui.dirtyMarker()).toBe(false);
			expect(backend.creates).toHaveLength(1);
			expect(backend.deletes).toEqual(["1"]);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("does not send a delete twice when more files are removed after a submit", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await act(async () => {
				await lazy.workQueue();
			});
			await waitFor(() => expect(ui.names()).toEqual(["image.png"]));

			await ui.remove("image.png");
			await waitFor(() => expect(ui.changeOf("image.png")).toBe("removed"));
			await act(async () => {
				await lazy.workQueue();
			});

			// the first file left the list when it was written, so the second removal
			// cannot hand its id back and delete it against a backend that has forgotten it
			await waitFor(() => expect(ui.names()).toEqual([]));
			expect(backend.deletes).toEqual(["1", "2"]);
		});

		it("survives a remount after the submit without bringing the file back", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);
			await act(async () => {
				await lazy.workQueue();
			});

			first.unmount();
			const second = renderUpload({ connector: lazy });

			await waitFor(() => expect(second.names()).toEqual(["image.png"]));
			expect(lazy.getQueuedDeleteRecords()).toEqual([]);
		});
	});

	it("uploads a picked file once when another is removed while it is in flight", async () => {
		const connector = new GatedConnector(SERVER_FILES);
		const ui = renderUpload({ connector });
		await loaded(ui);

		// the upload starts and hangs
		let uploading: Promise<void> | undefined;
		await act(async () => {
			// deliberately not awaited: the upload is meant to still be in flight
			uploading = ui.ref.current?.addFile(pick("race.txt"));
			await Promise.resolve();
		});
		await waitFor(() => expect(ui.names()).toContain("race.txt"));

		// removing another file in the meantime hands the picked file back untouched
		await ui.remove("document.pdf");

		await act(async () => {
			connector.finish();
			await uploading;
		});

		await waitFor(() => expect(ui.names()).not.toContain("document.pdf"));
		// one upload, one row: the list cannot show a second copy on the server, so the
		// count has to come from the backend
		expect(ui.names().filter((name) => name === "race.txt")).toHaveLength(1);
		expect(connector.creates).toBe(1);
	});

	describe("picking a file with the name of one already listed", () => {
		it("deletes the stored file it replaces", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.addFile(pick("document.pdf", "application/pdf"));

			await waitFor(() => expect(connector.creates).toHaveLength(1));
			await waitFor(() => expect(connector.deletes).toEqual(["1"]));
			// the list is what the server has: the replacement, and no trace of the old one
			await waitFor(() =>
				expect(ui.names()).toEqual(["image.png", "document.pdf"]),
			);
			expect(await onServer(connector)).toEqual(["image.png", "document.pdf"]);
		});

		it("deletes an upload it replaces", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(connector.creates).toHaveLength(1));
			await ui.settle();

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(connector.creates).toHaveLength(2));
			await waitFor(() => expect(connector.deletes).toEqual(["3"]));
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			expect(await onServer(connector)).toEqual([
				"document.pdf",
				"image.png",
				"notes.txt",
			]);
		});

		it("queues the delete of the stored file it replaces, which stays listed as removed", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.addFile(pick("document.pdf", "application/pdf"));

			// the replacement is a removal and an upload, each pending and each shown
			await waitFor(() => expect(lazy.getQueuedOperation("1")).toBe("delete"));
			await waitFor(() =>
				expect(ui.changesOf("document.pdf")).toEqual(["removed", "added"]),
			);
			expect(ui.hasRestore("document.pdf")).toBe(true);
			expect(backend.creates).toHaveLength(0);
			expect(backend.deletes).toHaveLength(0);

			await act(async () => {
				await lazy.workQueue();
			});

			await waitFor(() =>
				expect(ui.names()).toEqual(["image.png", "document.pdf"]),
			);
			expect(ui.changeOf("document.pdf")).toBe(null);
			expect(backend.deletes).toEqual(["1"]);
			expect(await onServer(backend)).toEqual(["image.png", "document.pdf"]);
		});

		it("keeps both when the replaced file is restored", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);
			await ui.addFile(pick("document.pdf", "application/pdf"));
			await waitFor(() =>
				expect(ui.changesOf("document.pdf")).toEqual(["removed", "added"]),
			);

			// the first of the two is the one being replaced
			await ui.restore("document.pdf");

			await waitFor(() =>
				expect(ui.changesOf("document.pdf")).toEqual([null, "added"]),
			);
			await act(async () => {
				await lazy.workQueue();
			});

			expect(backend.deletes).toEqual([]);
			expect(await onServer(backend)).toEqual([
				"document.pdf",
				"image.png",
				"document.pdf",
			]);
		});

		it("cancels a queued upload it replaces", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const queued = vi.spyOn(lazy, "create");
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			const firstId = (
				queued.mock.results[0].value as [Record<string, unknown>, unknown]
			)[0].id as string;

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(queued).toHaveBeenCalledTimes(2));
			// nothing of the first is on the server, so it leaves without a trace
			await waitFor(() => expect(lazy.getQueuedOperation(firstId)).toBe(null));
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			expect(ui.changeOf("notes.txt")).toBe("added");

			await act(async () => {
				await lazy.workQueue();
			});

			expect(backend.creates).toHaveLength(1);
			expect(backend.deletes).toEqual([]);
			expect(await onServer(backend)).toEqual([
				"document.pdf",
				"image.png",
				"notes.txt",
			]);
		});

		it("keeps both with allowDuplicates, each its own record", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector, allowDuplicates: true });
			await loaded(ui);

			await ui.addFile(pick("document.pdf", "application/pdf"));

			await waitFor(() =>
				expect(ui.names()).toEqual([
					"document.pdf",
					"image.png",
					"document.pdf",
				]),
			);
			await ui.settle();
			expect(connector.updates).toEqual([]);
			expect(await onServer(connector)).toEqual([
				"document.pdf",
				"image.png",
				"document.pdf",
			]);

			// two rows are two records: removing one leaves the other on the server
			await ui.remove("document.pdf");

			await waitFor(() =>
				expect(ui.names()).toEqual(["image.png", "document.pdf"]),
			);
			expect(await onServer(connector)).toEqual(["image.png", "document.pdf"]);
		});
	});

	describe("dropping a file while its upload is in flight", () => {
		/** Picks a file, whose upload then hangs until the connector is told to finish */
		const startUpload = async (ui: Harness, name: string) => {
			await act(async () => {
				// not awaited: addFile settles once the file is listed, the upload later
				void ui.ref.current?.addFile(pick(name));
				await Promise.resolve();
			});
			await waitFor(() => expect(ui.names()).toContain(name));
		};
		const finishUploads = async (ui: Harness, connector: GatedConnector) => {
			act(() => connector.finish());
			await ui.settle();
		};

		it("deletes the upload once it lands when its file was removed", async () => {
			const connector = new GatedConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);
			await startUpload(ui, "race.txt");

			await ui.remove("race.txt");
			await finishUploads(ui, connector);

			// the control never listed the upload, but the server has it until told not to
			expect(ui.names()).toEqual(["document.pdf", "image.png"]);
			expect(await onServer(connector)).toEqual(["document.pdf", "image.png"]);
		});

		it("keeps one copy when its file was replaced by name", async () => {
			const connector = new GatedConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);
			await startUpload(ui, "race.txt");

			await startUpload(ui, "race.txt");
			await finishUploads(ui, connector);

			expect(ui.names()).toEqual(["document.pdf", "image.png", "race.txt"]);
			expect(await onServer(connector)).toEqual([
				"document.pdf",
				"image.png",
				"race.txt",
			]);
		});
	});

	describe("when the server refuses a write", () => {
		const namesCreated = (backend: RejectingConnector) =>
			backend.creates.map((data) => data.name as string);

		it("reports a refused upload and drops the file", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectCreates.add("bad.txt");
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.addFile(pick("bad.txt"));

			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			// the list is what the server has: a file it would not take is not in it,
			// and a file left in it would be uploaded again by the next change
			expect(namesCreated(connector)).toEqual([]);
			await waitFor(() =>
				expect(ui.names()).toEqual(["document.pdf", "image.png"]),
			);
		});

		it("does not upload a file twice when another upload in the same change is refused", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectCreates.add("bad.txt");
			const ui = renderUpload({ connector });
			await loaded(ui);

			// the refused file is still in the list the control is handed back, so the
			// next pick is sent together with it — and goes through although it does not
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			await ui.addFile(pick("good.txt"));
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("good.txt"),
			);

			await ui.addFile(pick("third.txt"));

			// a file the server already has must not be sent again because something
			// else in the same change was refused
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("third.txt"),
			);
			expect(
				namesCreated(connector).filter((name) => name === "good.txt"),
			).toHaveLength(1);
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"good.txt",
				"third.txt",
			]);
		});

		it("keeps a file the server refused to delete, listed once", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectDeletes.add("1");
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			// it is still on the server, so it is still in the list — once
			expect(connector.deletes).toEqual([]);
			expect(ui.names()).toEqual(["document.pdf", "image.png"]);
		});

		it("does not upload a file twice when the delete alongside it is refused", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectDeletes.add("1");
			const ui = renderUpload({ connector });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.errorText()).toContain("refused"));

			// the file is still marked for deletion, so this change carries the retry of
			// that delete as well as the upload
			await ui.addFile(pick("notes.txt"));
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("notes.txt"),
			);

			await ui.addFile(pick("second.txt"));

			await waitFor(() =>
				expect(namesCreated(connector)).toContain("second.txt"),
			);
			expect(
				namesCreated(connector).filter((name) => name === "notes.txt"),
			).toHaveLength(1);
			expect(ui.names().filter((name) => name === "notes.txt")).toHaveLength(1);
		});

		it("does not create a file twice when a later write in the same submit is refused", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectCreates.add("bad.txt");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy, showDirtyState: true });
			await loaded(ui);
			await ui.addFile(pick("good.txt"));
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));

			// the submit stops at the write the server refuses
			await act(async () => {
				await expect(lazy.workQueue()).rejects.toThrow("refused");
			});
			expect(namesCreated(backend)).toEqual(["good.txt"]);
			// what is left is still pending, and still marked as such
			expect(lazy.isQueueEmpty()).toBe(false);
			expect(ui.changeOf("bad.txt")).toBe("added");
			expect(ui.dirtyMarker()).toBe(true);

			// submitting again sends what is left, not what already went through
			backend.rejectCreates.clear();
			await act(async () => {
				await lazy.workQueue();
			});

			expect(namesCreated(backend)).toEqual(["good.txt", "bad.txt"]);
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe(null));
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"good.txt",
				"bad.txt",
			]);
		});

		it("lets the user correct a refused upload and submit again", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectCreates.add("bad.txt");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy, showDirtyState: true });
			await loaded(ui);
			await ui.addFile(pick("good.txt"));
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));

			await act(async () => {
				await expect(lazy.workQueue()).rejects.toThrow("refused");
			});

			// the submit stopped where it failed, and the control still shows what is
			// left for the user to put right
			expect(ui.changeOf("bad.txt")).toBe("added");
			expect(ui.dirtyMarker()).toBe(true);

			// which they do by dropping the file the server would not take
			await ui.remove("bad.txt");

			// nothing is pending any more: what went through is on the server and is
			// shown as an ordinary file, and the rest was never sent
			await waitFor(() => expect(ui.names()).not.toContain("bad.txt"));
			expect(lazy.isQueueEmpty()).toBe(true);
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe(null));
			expect(ui.dirtyMarker()).toBe(false);

			// so submitting again sends nothing at all
			const sentSoFar = namesCreated(backend);
			await act(async () => {
				await lazy.workQueue();
			});

			expect(namesCreated(backend)).toEqual(sentSoFar);
			expect(ui.names()).toEqual(["document.pdf", "image.png", "good.txt"]);
		});

		it("carries on with the submit when a delete is refused", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectDeletes.add("1");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));

			await act(async () => {
				await lazy.workQueue();
			});

			// a refused delete is not retried — the form is done with that record — and
			// does not stop the upload queued behind it, which happens once
			expect(namesCreated(backend)).toEqual(["notes.txt"]);
			expect(lazy.isQueueEmpty()).toBe(true);
			await waitFor(() =>
				expect(ui.names()).toEqual(["image.png", "notes.txt"]),
			);
		});
	});

	describe("additional files", () => {
		// an extra built by hand, which is all FileData<FileMeta> promises
		const PLAIN_EXTRA: FileData<FileMeta>[] = [
			{
				file: {
					name: "terms.txt",
					type: "text/plain",
					downloadLink: "#terms",
				},
				canBeUploaded: false,
				delete: false,
			},
		];
		// ...and one loaded from another model's backend and put through the same
		// deserializer, so it carries an id and is shaped exactly like one of ours.
		// FileData<BackendFileMeta> is assignable to FileData<FileMeta>, so nothing
		// warns about it.
		const BACKEND_EXTRA: FileData<BackendFileMeta>[] = [
			{
				file: {
					name: "manual.pdf",
					type: "application/pdf",
					downloadLink: "#manual",
					id: "99",
				},
				canBeUploaded: false,
				delete: false,
			},
		];

		it("leaves them alone when a real file changes", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: PLAIN_EXTRA,
			});
			await loaded(ui);
			expect(ui.names()).toContain("terms.txt");

			await ui.remove("document.pdf");

			// they belong to whoever passed them, so a change to the real files neither
			// drops nor duplicates them
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			expect(ui.names().filter((name) => name === "terms.txt")).toHaveLength(1);
		});

		it("keeps one that carries an id out of its own files", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: BACKEND_EXTRA,
			});
			await loaded(ui);
			expect(ui.names()).toEqual(["document.pdf", "image.png", "manual.pdf"]);

			await ui.addFile(pick("notes.txt"));

			// the control is handed back its own list with the extras in it, and has to
			// hand them back out again: an extra taken into state is listed twice, once
			// from each
			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"notes.txt",
				"manual.pdf",
			]);

			// ...and every further change folds the list into itself again
			await ui.addFile(pick("second.txt"));
			await waitFor(() => expect(ui.names()).toContain("second.txt"));
			expect(ui.names()).toHaveLength(5);
			expect(ui.names().filter((name) => name === "manual.pdf")).toHaveLength(
				1,
			);
		});

		it("is not replaced by a picked file of the same name", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector,
				additionalFiles: BACKEND_EXTRA,
			});
			await loaded(ui);

			await ui.addFile(pick("manual.pdf", "application/pdf"));

			// it is read-only and not this control's record: deleting id 99 would hit
			// whatever 99 is to this connector
			await waitFor(() => expect(connector.creates).toHaveLength(1));
			await ui.settle();
			expect(connector.deletes).toEqual([]);
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"manual.pdf",
				"manual.pdf",
			]);
		});

		it("offers no remove button for them", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: BACKEND_EXTRA,
			});
			await loaded(ui);

			// read-only, and not this control's records: removing one would send a
			// delete for id 99 against a backend where 99 is something else entirely
			expect(ui.hasRemove("manual.pdf")).toBe(false);
			expect(ui.hasRemove("document.pdf")).toBe(true);
		});
	});
});

/**
 * A backend like a real one: it refuses to delete an id it does not hold (a 404), and it
 * records every attempt, refused or not, so that a test can see a write sent twice
 * @remarks MockConnector accepts any delete silently, which hides a repeated or a
 *          foreign one; it only stores the records here. Every gate holds the matching
 *          requests until it is released.
 */
class StrictConnector extends Connector {
	/** The names of every create attempt, refused or not */
	public createCalls: string[] = [];
	/** The ids of every delete attempt, refused or not */
	public deleteCalls: string[] = [];
	/** The params of every index call */
	public indexParams: unknown[] = [];
	public rejectCreates = new Set<string>();
	public rejectDeletes = new Set<string>();
	/** The message a refused create throws */
	public refusal = (name: string) => `upload of ${name} refused`;
	public indexGate: Promise<void> | null = null;
	public indexError: Error | null = null;
	public createGate: Promise<void> | null = null;
	public deleteGate: Promise<void> | null = null;
	private readonly records = new Set<string>();
	private readonly store: MockConnector;

	constructor(data: Record<string, unknown>[]) {
		super();
		this.store = new MockConnector(data);
		data.forEach((record) => this.records.add(record.id as string));
	}

	async index(params?: Parameters<MockConnector["index"]>[0]) {
		this.indexParams.push(params);
		if (this.indexGate) await this.indexGate;
		if (this.indexError) throw this.indexError;
		return this.store.index(params);
	}

	async create(data: Record<string, unknown>) {
		const name = data.name as string;
		this.createCalls.push(name);
		if (this.createGate) await this.createGate;
		if (this.rejectCreates.has(name)) throw new Error(this.refusal(name));
		const result = this.store.create(data);
		this.records.add(result[0].id as string);
		return result;
	}

	read(id: string) {
		return this.store.read(id);
	}

	update(data: Record<string, unknown>) {
		return this.store.update(data);
	}

	async delete(id: string) {
		this.deleteCalls.push(id);
		if (this.deleteGate) await this.deleteGate;
		if (this.rejectDeletes.has(id)) throw new Error(`delete of ${id} refused`);
		if (!this.records.has(id)) throw new Error(`404 record ${id} not found`);
		this.records.delete(id);
		this.store.delete(id);
	}
}

/** A promise the test resolves when it wants to */
const gate = () => {
	let release!: () => void;
	const promise = new Promise<void>((resolve) => {
		release = resolve;
	});
	return { promise, release };
};

/** Picks a file whose upload may hang, without waiting for it */
const startPick = async (ui: Harness, file: File) => {
	await act(async () => {
		// not awaited: addFile settles once the file is listed, the upload later
		void ui.ref.current?.addFile(file);
		await Promise.resolve();
	});
	await waitFor(() => expect(ui.names()).toContain(file.name));
};

/** Picks several files through the file input, as one selection */
const pickFiles = async (ui: Harness, files: File[]) => {
	const input =
		ui.container.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) throw new Error("no file input");
	await act(async () => {
		fireEvent.change(input, { target: { files } });
		await Promise.resolve();
	});
};

describe("CrudFileUpload: bugs", () => {
	it("[ISSUE-3511-ITEM-1] a same-name replacement the server refuses leaves the original stored (direct connector)", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		connector.rejectCreates.add("document.pdf");
		const ui = renderUpload({ connector });
		await loaded(ui);

		await ui.addFile(pick("document.pdf", "application/pdf"));
		await ui.settle();

		await waitFor(() => expect(ui.errorText()).toContain("refused"));
		expect(await onServer(connector)).toEqual(["document.pdf", "image.png"]);
		expect(ui.names()).toEqual(["document.pdf", "image.png"]);
	});

	it("[ISSUE-3511-ITEM-1] a same-name replacement refused at the save leaves the original stored (LazyConnector)", async () => {
		const backend = new StrictConnector(SERVER_FILES);
		backend.rejectCreates.add("document.pdf");
		const lazy = lazyOver(backend);
		const ui = renderUpload({ connector: lazy });
		await loaded(ui);
		await ui.addFile(pick("document.pdf", "application/pdf"));
		await waitFor(() =>
			expect(ui.changesOf("document.pdf")).toEqual(["removed", "added"]),
		);

		await act(async () => {
			await expect(lazy.workQueue()).rejects.toThrow("refused");
		});

		// the replaced file may only go once its replacement is stored
		expect(await onServer(backend)).toEqual(["document.pdf", "image.png"]);
	});

	it("[ISSUE-3511-ITEM-1] the original of a refused replacement is listed unmarked, and the next change keeps it", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		connector.rejectCreates.add("document.pdf");
		const ui = renderUpload({ connector });
		await loaded(ui);
		await ui.addFile(pick("document.pdf", "application/pdf"));
		await waitFor(() => expect(ui.errorText()).toContain("refused"));

		// a stored file like before, not a removal waiting for the next change
		await waitFor(() => expect(ui.changesOf("document.pdf")).toEqual([null]));

		await ui.addFile(pick("notes.txt"));
		await waitFor(() => expect(ui.names()).toContain("notes.txt"));

		expect(connector.deleteCalls).toEqual([]);
		expect(await onServer(connector)).toEqual([
			"document.pdf",
			"image.png",
			"notes.txt",
		]);
	});

	it("[ISSUE-3511-ITEM-1] the file a pick replaces is deleted only once the pick is stored (direct connector)", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const upload = gate();
		connector.createGate = upload.promise;
		const ui = renderUpload({ connector });
		await loaded(ui);

		await startPick(ui, pick("document.pdf", "application/pdf"));
		await waitFor(() =>
			expect(connector.createCalls).toEqual(["document.pdf"]),
		);
		await ui.settle();
		expect(connector.deleteCalls).toEqual([]);

		act(() => upload.release());

		await waitFor(() => expect(connector.deleteCalls).toEqual(["1"]));
		await waitFor(() =>
			expect(ui.names()).toEqual(["image.png", "document.pdf"]),
		);
		expect(await onServer(connector)).toEqual(["image.png", "document.pdf"]);
	});

	it("[ISSUE-3511-ITEM-2] a file whose removal is queued frees its maxFiles slot", async () => {
		const lazy = lazyOver(new StrictConnector(SERVER_FILES));
		const ui = renderUpload({ connector: lazy, maxFiles: 2 });
		await loaded(ui);
		await ui.remove("document.pdf");
		await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

		await ui.addFile(pick("replacement.pdf", "application/pdf"));
		await ui.settle();

		expect(ui.errorText()).toBe(null);
		expect(ui.names()).toContain("replacement.pdf");
	});

	it("[ISSUE-3511-ITEM-2] onChange reports a queued removal with delete set, as FileUpload's contract says", async () => {
		const onChange = vi.fn();
		const lazy = lazyOver(new StrictConnector(SERVER_FILES));
		const ui = renderUpload({ connector: lazy, onChange });
		await loaded(ui);

		await ui.remove("document.pdf");
		await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

		// "the files that exist after saving are the entries without delete"
		const last = onChange.mock.calls.at(-1)![0] as FileData<BackendFileMeta>[];
		expect(
			last.filter((file) => !file.delete).map((file) => file.file.name),
		).toEqual(["image.png"]);
	});

	it("[ISSUE-3511-ITEM-2] a later change does not queue a queued removal again", async () => {
		const backend = new StrictConnector(SERVER_FILES);
		const lazy = lazyOver(backend);
		const ui = renderUpload({ connector: lazy });
		await loaded(ui);
		// one selection replacing both: their deletes are queued as one request
		await pickFiles(ui, [
			pick("document.pdf", "application/pdf"),
			pick("image.png", "image/png"),
		]);
		await waitFor(() =>
			expect(ui.changesOf("image.png")).toEqual(["removed", "added"]),
		);

		// the next change hands both back still marked for deletion
		await ui.addFile(pick("notes.txt"));
		await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
		await act(async () => {
			await lazy.workQueue();
		});

		expect(backend.deleteCalls).toEqual(["1", "2"]);
		expect(await onServer(backend)).toEqual([
			"document.pdf",
			"image.png",
			"notes.txt",
		]);
	});

	it("[ISSUE-3511-ITEM-2] a queued removal read back after a remount is reported with delete set", async () => {
		const lazy = lazyOver(new StrictConnector(SERVER_FILES));
		const first = renderUpload({ connector: lazy });
		await loaded(first);
		await first.remove("document.pdf");
		await waitFor(() => expect(lazy.getQueuedOperation("1")).toBe("delete"));
		first.unmount();

		const onChange = vi.fn();
		const ui = renderUpload({ connector: lazy, onChange });
		await loaded(ui);
		await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

		const last = onChange.mock.calls.at(-1)![0] as FileData<BackendFileMeta>[];
		expect(
			last.filter((file) => !file.delete).map((file) => file.file.name),
		).toEqual(["image.png"]);
	});

	it("[ISSUE-3511-ITEM-3] a change made while a delete is in flight does not send that delete again", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const ui = renderUpload({ connector });
		await loaded(ui);
		const deleting = gate();
		connector.deleteGate = deleting.promise;

		await ui.remove("document.pdf");
		await ui.remove("image.png");
		await act(async () => {
			deleting.release();
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		await ui.settle();

		expect(connector.deleteCalls).toEqual(["1", "2"]);
		expect(ui.errorText()).toBe(null);
		expect(ui.names()).toEqual([]);
	});

	it("[ISSUE-3511-ITEM-3] a deleteMultiple refused for one id drops the files whose delete went through", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		connector.rejectDeletes.add("1");
		const ui = renderUpload({ connector });
		await loaded(ui);
		await ui.remove("document.pdf");
		await waitFor(() => expect(ui.errorText()).toContain("refused"));

		// the change carries the retry of 1 (refused again) and the delete of 2 (done)
		await ui.remove("image.png");
		await ui.settle();

		expect(await onServer(connector)).toEqual(["document.pdf"]);
		expect(ui.names()).toEqual(["document.pdf"]);
		expect(ui.changeOf("document.pdf")).toBe("removed");
	});

	it("[ISSUE-3511-ITEM-3] a restore during an in-flight delete leaves the list and the server in agreement", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const ui = renderUpload({ connector });
		await loaded(ui);
		const deleting = gate();
		connector.deleteGate = deleting.promise;

		await ui.remove("document.pdf");
		// either no restore is offered while the delete runs, or using it works
		if (ui.hasRestore("document.pdf")) await ui.restore("document.pdf");
		await act(async () => {
			deleting.release();
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		await ui.settle();

		expect(ui.names()).toEqual(await onServer(connector));
	});

	it("[ISSUE-3511-ITEM-4] after a submit that failed partway, the marks follow what is still queued", async () => {
		const backend = new StrictConnector(SERVER_FILES);
		backend.rejectCreates.add("bad.txt");
		const lazy = lazyOver(backend);
		const ui = renderUpload({ connector: lazy });
		await loaded(ui);
		await ui.remove("document.pdf");
		await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
		await ui.addFile(pick("good.txt"));
		await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
		await ui.addFile(pick("bad.txt"));
		await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));

		await act(async () => {
			await expect(lazy.workQueue()).rejects.toThrow("refused");
		});
		await ui.settle();

		// the delete and good.txt were sent, bad.txt is still queued
		expect(await onServer(backend)).toEqual(["image.png", "good.txt"]);
		expect(ui.names()).not.toContain("document.pdf");
		expect(ui.changeOf("good.txt")).toBe(null);
		expect(ui.changeOf("bad.txt")).toBe("added");
	});

	it("[ISSUE-3511-ITEM-4] removing a queued upload never reports it as stored", async () => {
		const onChange = vi.fn();
		const lazy = lazyOver(new StrictConnector(SERVER_FILES));
		const ui = renderUpload({ connector: lazy, onChange });
		await loaded(ui);
		await ui.addFile(pick("notes.txt"));
		await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
		onChange.mockClear();

		await ui.remove("notes.txt");
		await waitFor(() => expect(ui.names()).not.toContain("notes.txt"));
		await ui.settle();

		// its upload was cancelled, not sent, so no list may show it as on the server
		const reported = onChange.mock.calls.flatMap(
			([files]) => files as FileData<BackendFileMeta>[],
		);
		expect(
			reported.filter(
				(file) => file.file.name === "notes.txt" && !file.changeState,
			),
		).toEqual([]);
	});

	it("[ISSUE-3511-ITEM-4] removing an upload a submit sent before it failed queues its delete", async () => {
		const backend = new StrictConnector(SERVER_FILES);
		backend.rejectCreates.add("bad.txt");
		const lazy = lazyOver(backend);
		const ui = renderUpload({ connector: lazy });
		await loaded(ui);
		await ui.addFile(pick("good.txt"));
		await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
		await ui.addFile(pick("bad.txt"));
		await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));
		await act(async () => {
			await expect(lazy.workQueue()).rejects.toThrow("refused");
		});
		await waitFor(() => expect(ui.changeOf("good.txt")).toBe(null));

		await ui.remove("good.txt");

		// it is on the server, so its removal is pending like any other
		await waitFor(() => expect(ui.changeOf("good.txt")).toBe("removed"));
		expect(ui.hasRestore("good.txt")).toBe(true);
		backend.rejectCreates.clear();
		await act(async () => {
			await lazy.workQueue();
		});
		expect(await onServer(backend)).toEqual([
			"document.pdf",
			"image.png",
			"bad.txt",
		]);
	});

	it("[ISSUE-3511-ITEM-5] an inline additionalFiles array neither hides nor deletes a file still uploading", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const uploading = gate();
		connector.createGate = uploading.promise;
		let rerenderOwner!: () => void;
		const Owner = ({ upload }: { upload: RenderControl }) => {
			const [, setCount] = React.useState(0);
			rerenderOwner = () => setCount((count) => count + 1);
			// a new, equal array on every render, as an inline prop is
			return upload({
				additionalFiles: [
					{
						file: { name: "terms.txt", type: "text/plain", downloadLink: "#t" },
					},
				],
			});
		};
		const ui = renderUpload({ connector }, { Owner });
		await loaded(ui);
		await startPick(ui, pick("race.txt"));

		act(() => rerenderOwner());
		await ui.remove("document.pdf");
		await act(async () => {
			uploading.release();
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		await ui.settle();

		expect(await onServer(connector)).toEqual(["image.png", "race.txt"]);
		expect(ui.names()).toEqual(["image.png", "race.txt", "terms.txt"]);
	});

	it("[ISSUE-3511-ITEM-5] additional files that arrive while a file is uploading neither hide nor delete it", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const uploading = gate();
		connector.createGate = uploading.promise;
		let loadExtras!: () => void;
		const Owner = ({ upload }: { upload: RenderControl }) => {
			const [extras, setExtras] = React.useState<FileData<FileMeta>[]>([]);
			loadExtras = () =>
				setExtras([
					{
						file: { name: "terms.txt", type: "text/plain", downloadLink: "#t" },
					},
				]);
			return upload({ additionalFiles: extras });
		};
		const ui = renderUpload({ connector }, { Owner });
		await loaded(ui);
		await startPick(ui, pick("race.txt"));

		// the owner's extras finish loading
		act(() => loadExtras());
		await waitFor(() => expect(ui.names()).toContain("terms.txt"));
		expect(ui.names()).toContain("race.txt");
		await ui.remove("document.pdf");
		await act(async () => {
			uploading.release();
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		await ui.settle();

		expect(await onServer(connector)).toEqual(["image.png", "race.txt"]);
		expect(ui.names()).toEqual(["image.png", "race.txt", "terms.txt"]);
	});

	it("[ISSUE-3511-ITEM-6] connector null renders a read-only control with the additional files", async () => {
		const ui = renderUpload({
			connector: null,
			additionalFiles: [
				{ file: { name: "terms.txt", type: "text/plain", downloadLink: "#t" } },
			],
		});

		await waitFor(() => expect(ui.names()).toEqual(["terms.txt"]));
		expect(screen.queryByRole("progressbar")).toBe(null);
		expect(ui.container.querySelector('input[type="file"]')).toBe(null);
	});

	it("[ISSUE-3511-ITEM-6] a connector passed after null is loaded", async () => {
		const ui = renderUpload({ connector: null });
		await waitFor(() => expect(screen.queryByRole("progressbar")).toBe(null));
		expect(ui.container.querySelector('input[type="file"]')).toBe(null);

		ui.rerender({ connector: new StrictConnector(SERVER_FILES) });

		await waitFor(() =>
			expect(ui.names()).toEqual(["document.pdf", "image.png"]),
		);
		expect(ui.container.querySelector('input[type="file"]')).not.toBe(null);
	});

	it("[ISSUE-3511-ITEM-7] an additional file marked for deletion is not deleted through this control's connector", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const ui = renderUpload({
			connector,
			additionalFiles: [
				{
					// another control's entry, removed there; id 2 means image.png here
					file: {
						name: "foreign.pdf",
						type: "application/pdf",
						downloadLink: "#f",
						id: "2",
					} as FileMeta,
					delete: true,
				},
			],
		});
		await loaded(ui);

		await ui.addFile(pick("notes.txt"));
		await ui.settle();

		expect(connector.deleteCalls).toEqual([]);
		expect(await onServer(connector)).toEqual([
			"document.pdf",
			"image.png",
			"notes.txt",
		]);
	});

	it("[ISSUE-3511-ITEM-7] an additional file marked as a pick is neither uploaded here nor listed twice", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		const ui = renderUpload({
			connector,
			additionalFiles: [
				// another control's pick, which that control uploads
				{ file: pick("foreign.txt"), canBeUploaded: true },
			],
		});
		await loaded(ui);

		await ui.addFile(pick("notes.txt"));
		await waitFor(() => expect(ui.names()).toContain("notes.txt"));
		await ui.settle();

		expect(connector.createCalls).toEqual(["notes.txt"]);
		expect(ui.names().filter((name) => name === "foreign.txt")).toHaveLength(1);
	});

	it("[ISSUE-3511-ITEM-8] a theme default of readOnly for CcFileUpload applies", async () => {
		const ui = renderUpload(
			{ connector: new StrictConnector(SERVER_FILES) },
			{
				theme: () => ({
					components: { CcFileUpload: { defaultProps: { readOnly: true } } },
				}),
			},
		);
		await loaded(ui);

		expect(ui.container.querySelector('input[type="file"]')).toBe(null);
		expect(ui.hasRemove("document.pdf")).toBe(false);
	});

	it("[ISSUE-3511-ITEM-8] an explicit readOnly false wins over the theme default", async () => {
		const ui = renderUpload(
			{ connector: new StrictConnector(SERVER_FILES), readOnly: false },
			{
				theme: () => ({
					components: { CcFileUpload: { defaultProps: { readOnly: true } } },
				}),
			},
		);
		await loaded(ui);

		expect(ui.container.querySelector('input[type="file"]')).not.toBe(null);
		expect(ui.hasRemove("document.pdf")).toBe(true);
	});

	it("[ISSUE-3511-ITEM-9] a later connector changes neither the list nor where writes go", async () => {
		const first = new StrictConnector(SERVER_FILES);
		const second = new StrictConnector([
			{ id: "1", name: "other.txt", type: "text/plain", downloadLink: "#o" },
		]);
		const ui = renderUpload({ connector: first });
		await loaded(ui);

		ui.rerender({ connector: second });
		await ui.settle();
		await ui.remove("document.pdf");
		await ui.settle();

		expect(ui.names()).toEqual(["image.png"]);
		expect(first.deleteCalls).toEqual(["1"]);
		expect(second.deleteCalls).toEqual([]);
		expect(second.indexParams).toEqual([]);
	});

	it("[ISSUE-3511-ITEM-9] a key per record shows another record's files", async () => {
		const first = new StrictConnector(SERVER_FILES);
		const second = new StrictConnector([
			{ id: "1", name: "other.txt", type: "text/plain", downloadLink: "#o" },
		]);
		let showSecond!: () => void;
		const Owner = ({ upload }: { upload: RenderControl }) => {
			const [record, setRecord] = React.useState({ id: "A", connector: first });
			showSecond = () => setRecord({ id: "B", connector: second });
			return (
				<React.Fragment key={record.id}>
					{upload({ connector: record.connector })}
				</React.Fragment>
			);
		};
		const ui = renderUpload({ connector: first }, { Owner });
		await loaded(ui);

		act(() => showSecond());

		await waitFor(() => expect(ui.names()).toEqual(["other.txt"]));
	});

	it("[ISSUE-3511-ITEM-10] onChange never reports an empty list for a field that has files", async () => {
		const onChange = vi.fn();
		const ui = renderUpload({
			connector: new StrictConnector(SERVER_FILES),
			onChange,
		});
		await loaded(ui);
		await waitFor(() => expect(onChange).toHaveBeenCalled());

		expect(
			onChange.mock.calls.map(([files]) => (files as FileData[]).length),
		).not.toContain(0);
	});

	it("[ISSUE-3511-ITEM-10] onChange is not called again when only the handler changes", async () => {
		const calls: number[] = [];
		let rerenderOwner!: () => void;
		const Owner = ({ upload }: { upload: RenderControl }) => {
			const [, setCount] = React.useState(0);
			rerenderOwner = () => setCount((count) => count + 1);
			// inline, so a new function on every render
			return upload({ onChange: (files) => calls.push(files.length) });
		};
		const ui = renderUpload(
			{ connector: new StrictConnector(SERVER_FILES) },
			{ Owner },
		);
		await loaded(ui);
		await waitFor(() => expect(calls).toContain(2));
		const before = calls.length;

		act(() => rerenderOwner());
		act(() => rerenderOwner());

		expect(calls).toHaveLength(before);
	});

	it("[ISSUE-3511-ITEM-10] a change reports to the handler passed last", async () => {
		const first = vi.fn();
		const second = vi.fn();
		const ui = renderUpload({
			connector: new StrictConnector(SERVER_FILES),
			onChange: first,
		});
		await loaded(ui);
		await waitFor(() => expect(first).toHaveBeenCalled());
		ui.rerender({ onChange: second });
		first.mockClear();

		await ui.addFile(pick("notes.txt"));
		await waitFor(() => expect(ui.names()).toContain("notes.txt"));

		expect(first).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(
				(second.mock.calls.at(-1)![0] as FileData[]).map(
					(file) => file.file.name,
				),
			).toEqual(["document.pdf", "image.png", "notes.txt"]),
		);
	});

	it("[ISSUE-3511-ITEM-10] a failed load reports nothing", async () => {
		const connector = new StrictConnector(SERVER_FILES);
		connector.indexError = new Error("index refused");
		const onChange = vi.fn();
		const ui = renderUpload({ connector, onChange });

		await waitFor(() =>
			expect(ui.container.textContent).toContain("index refused"),
		);
		await ui.settle();

		expect(onChange).not.toHaveBeenCalled();
	});
});
