import { afterEach, describe, expect, it } from "vitest";
import processImageB64 from "../../src/utils/processImageB64";
import ImageLoadError, {
	isImageLoadError,
} from "../../src/utils/ImageLoadError";

const OriginalImage = globalThis.Image;

/**
 * Replaces Image with a stub which always fails to load, the way the browser does for a format it
 * can't decode (HEIC, TIFF, ...) or a corrupt file.
 * @remarks jsdom never loads the src, so neither event fires on its own.
 */
const mockFailingImage = () => {
	class FailingImage extends EventTarget {
		width = 0;
		height = 0;
		#src = "";
		set src(value: string) {
			this.#src = value;
			// the browser dispatches a plain Event here, not an ErrorEvent: there is no .error on it
			setTimeout(() => this.dispatchEvent(new Event("error")), 0);
		}
		get src(): string {
			return this.#src;
		}
	}
	globalThis.Image = FailingImage as unknown as typeof Image;
};

afterEach(() => {
	globalThis.Image = OriginalImage;
});

describe("processImageB64", () => {
	it("rejects with an ImageLoadError if the browser can't decode the image", async () => {
		mockFailingImage();
		await expect(
			processImageB64("data:image/heic;base64,AAAA", "image/png"),
		).rejects.toBeInstanceOf(ImageLoadError);
	});

	it("rejects with an error carrying a message and a stack trace", async () => {
		mockFailingImage();
		// this is the actual regression: the rejection value used to be undefined, which left both the
		// user and the error tracker without anything to go on
		const error = await processImageB64(
			"data:image/heic;base64,AAAA",
			"image/png",
		).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBeTruthy();
		expect((error as Error).stack).toBeTruthy();
	});

	it("reports the mime type it failed to load", async () => {
		mockFailingImage();
		const error = await processImageB64(
			"data:image/heic;base64,AAAA",
			"image/png",
		).catch((e: unknown) => e);
		expect(isImageLoadError(error as Error)).toBe(true);
		expect((error as ImageLoadError).mimeType).toBe("image/heic");
		expect((error as Error).message).toContain("image/heic");
	});

	it("keeps mimeType null for a data uri without a mime type", async () => {
		mockFailingImage();
		const error = await processImageB64("data:", "image/png").catch(
			(e: unknown) => e,
		);
		expect((error as ImageLoadError).mimeType).toBe(null);
	});

	it("passes svg through without decoding it", async () => {
		mockFailingImage();
		const svg = "data:image/svg+xml;base64,AAAA";
		// no Image is involved, so the failing stub is never hit
		await expect(processImageB64(svg, "image/svg+xml")).resolves.toBe(svg);
	});
});

describe("isImageLoadError", () => {
	it("matches by name, so it works across bundle boundaries", () => {
		const foreign = new Error("nope");
		foreign.name = "CcImageLoadError";
		expect(isImageLoadError(foreign)).toBe(true);
	});

	it("doesn't match other errors", () => {
		expect(isImageLoadError(new Error("nope"))).toBe(false);
		expect(isImageLoadError(new TypeError("nope"))).toBe(false);
	});
});
