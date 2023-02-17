Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// mock scrollTo, not implemented by JSdom
// eslint-disable-next-line @typescript-eslint/no-empty-function
Element.prototype.scrollTo = () => {};

const MakeItAModule = "";
export default MakeItAModule;
