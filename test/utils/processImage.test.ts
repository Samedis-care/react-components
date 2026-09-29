import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	MockInstance,
	vi,
} from "vitest";
import processImage from "../../src/utils/processImage";
import ImageLoadError from "../../src/utils/ImageLoadError";

const OriginalImage = globalThis.Image;

/**
 * Replaces Image with a stub that loads (or fails to load) any src with the given size
 * @remarks jsdom never loads the src, so neither event fires on its own
 */
const mockImage = (width: number, height: number, fails = false) => {
	class StubImage extends EventTarget {
		width = width;
		height = height;
		set src(_value: string) {
			setTimeout(() => this.dispatchEvent(new Event(fails ? "error" : "load")));
		}
	}
	globalThis.Image = StubImage as unknown as typeof Image;
};

/**
 * Stands in for the canvas jsdom lacks: records its size, encodes to the asked type
 * @param encodes The type toBlob encodes to, null to fail
 */
const mockCanvas = (encodes?: string | null) => {
	const canvases: HTMLCanvasElement[] = [];
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
		function (this: HTMLCanvasElement) {
			canvases.push(this);
			return { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
		},
	);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
		(callback: BlobCallback, type?: string) => {
			const encodedType = encodes === undefined ? type : encodes;
			setTimeout(() =>
				callback(
					encodedType ? new Blob(["encoded"], { type: encodedType }) : null,
				),
			);
		},
	);
	return canvases;
};

let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

beforeEach(() => {
	vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:stub");
	revokeObjectURL = vi
		.spyOn(URL, "revokeObjectURL")
		.mockImplementation(() => undefined);
});

afterEach(() => {
	globalThis.Image = OriginalImage;
	vi.restoreAllMocks();
});

describe("processImage", () => {
	it("returns a File, renamed after the type it was converted to", async () => {
		mockImage(100, 50);
		mockCanvas();
		const file = new File(["heic"], "photo.heic", {
			type: "image/heic",
			lastModified: 1234,
		});

		const result = await processImage(file, "image/jpeg");

		expect(result).toBeInstanceOf(File);
		expect(result.name).toBe("photo.jpg");
		expect(result.type).toBe("image/jpeg");
		expect(result.lastModified).toBe(1234);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:stub");
	});

	it("keeps the name if the type stays", async () => {
		mockImage(100, 50);
		mockCanvas();
		const result = await processImage(
			new File(["png"], "photo.png", { type: "image/png" }),
			undefined,
			{ width: 10, height: 10, keepRatio: true },
		);
		expect(result.name).toBe("photo.png");
	});

	it("names the file after what the browser encoded, not what was asked for", async () => {
		mockImage(100, 50);
		mockCanvas("image/png");
		const result = await processImage(
			new File(["x"], "photo.jpg", { type: "image/jpeg" }),
			"image/avif",
		);
		expect(result.name).toBe("photo.png");
		expect(result.type).toBe("image/png");
	});

	it("returns a Blob for a Blob", async () => {
		mockImage(100, 50);
		mockCanvas();
		const result = await processImage(
			new Blob(["x"], { type: "image/png" }),
			"image/jpeg",
		);
		expect(result).not.toBeInstanceOf(File);
		expect(result.type).toBe("image/jpeg");
	});

	it("down-scales keeping the ratio", async () => {
		mockImage(4000, 2000);
		const canvases = mockCanvas();
		await processImage(new File(["x"], "a.png", { type: "image/png" }), "", {
			width: 1000,
			height: 1000,
			keepRatio: true,
		});
		expect([canvases[0].width, canvases[0].height]).toEqual([1000, 500]);
	});

	it("down-scales each side on its own without keeping the ratio", async () => {
		mockImage(3000, 200);
		const canvases = mockCanvas();
		await processImage(new File(["x"], "a.png", { type: "image/png" }), "", {
			width: 2500,
			height: 300,
			keepRatio: false,
		});
		// the height fits, so it stays: it is not stretched to the maximum
		expect([canvases[0].width, canvases[0].height]).toEqual([2500, 200]);
	});

	it("passes an SVG on as it is", async () => {
		const svg = new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" });
		await expect(processImage(svg, "image/png")).resolves.toBe(svg);
	});

	it("rejects with an ImageLoadError if the browser can't decode the image", async () => {
		mockImage(0, 0, true);
		mockCanvas();
		await expect(
			processImage(
				new File(["x"], "a.heic", { type: "image/heic" }),
				"image/png",
			),
		).rejects.toBeInstanceOf(ImageLoadError);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:stub");
	});

	it("rejects if the image can't be encoded", async () => {
		mockImage(10, 10);
		mockCanvas(null);
		await expect(
			processImage(
				new File(["x"], "a.png", { type: "image/png" }),
				"image/png",
			),
		).rejects.toThrow("Failed encoding the image");
	});
});
