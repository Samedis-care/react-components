import { afterEach, beforeAll, describe, expect, it } from "vitest";
import React from "react";
import path from "node:path";
import ts from "typescript";
import { cleanup, render } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * The pickers' props types as an app sees them: through the library's
 * declaration files, in a program that never imports MUI's AdapterMoment
 * itself. MUI types every date of a picker as `PickerValidDate`, which is
 * `any` until an adapter's declarations are loaded; the library's own
 * programs load AdapterMoment's elsewhere, so they cannot show what an app
 * gets. Each picker's declaration file is emitted from its source and an
 * app-like file is compiled against it.
 */

const root = path.resolve(__dirname, "../..") + "/";
const pickersDir = root + "src/standalone/LocalizedDateTimePickers/";
const pickers = [
	"LocalizedKeyboardDatePicker",
	"LocalizedDatePicker",
	"LocalizedDateTimePicker",
] as const;
type PickerName = (typeof pickers)[number];

const libraryOptions = (): ts.CompilerOptions => {
	const config = ts.getParsedCommandLineOfConfigFile(
		root + "tsconfig.json",
		{},
		{
			...ts.sys,
			onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
				throw new Error(
					ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
				);
			},
		},
	);
	if (!config) throw new Error("tsconfig.json not found");
	return config.options;
};

/** The declaration file of each picker, as the library ships it */
const emitPickerDeclarations = (
	options: ts.CompilerOptions,
): Map<PickerName, string> => {
	const program = ts.createProgram({
		rootNames: pickers.map((name) => pickersDir + name + ".tsx"),
		options: {
			...options,
			noEmit: false,
			declaration: true,
			emitDeclarationOnly: true,
		},
	});
	const declarations = new Map<PickerName, string>();
	for (const name of pickers) {
		let text: string | undefined;
		// written to memory only
		program.emit(
			program.getSourceFile(pickersDir + name + ".tsx"),
			(_fileName, data) => {
				text = data;
			},
			undefined,
			true,
		);
		if (text === undefined) throw new Error(`no declarations for ${name}`);
		declarations.set(name, text);
	}
	return declarations;
};

/** An app's file using one picker, compiled against the picker's declarations */
const appFile = (name: PickerName, kind: "value" | "ref") =>
	root + `test/standalone/__app_${name}_${kind}__.tsx`;

const appSources = (name: PickerName) => ({
	value: `import React from "react";
import moment, { type Moment } from "moment";
import Picker from "../../src/standalone/LocalizedDateTimePickers/${name}";

export const accepted = [
	<Picker key="moment" value={moment()} minDate={moment()} onChange={(value: Moment | null) => value} />,
	<Picker key="null" value={null} onChange={(value) => value?.format("L")} />,
];

export const rejected = [
	// @ts-expect-error a Date is not a Moment
	<Picker key="date" value={new Date()} />,
	// @ts-expect-error a string is not a Moment
	<Picker key="string" value="2026-01-01" />,
	// @ts-expect-error minDate is a Moment too
	<Picker key="minDate" minDate={new Date()} />,
	// @ts-expect-error onChange gets a Moment or null, which has no getTime
	<Picker key="onChange" onChange={(value) => value?.getTime()} />,
	// @ts-expect-error onChange gets a Moment or null, not a Date
	<Picker key="onChangeDate" onChange={(value: Date | null) => value} />,
];
`,
	ref: `import React from "react";
import Picker from "../../src/standalone/LocalizedDateTimePickers/${name}";

export const objectRef = <Picker ref={React.createRef<HTMLDivElement>()} />;
export const callbackRef = (
	<Picker ref={(node: HTMLDivElement | null) => node?.focus()} />
);
`,
});

let diagnostics: Map<string, string[]>;

beforeAll(() => {
	const options = libraryOptions();
	const declarations = emitPickerDeclarations(options);
	const virtualFiles = new Map<string, string>();
	const hiddenFiles = new Set<string>();
	for (const name of pickers) {
		// the declaration file takes the place of the source, as in the package
		virtualFiles.set(pickersDir + name + ".d.ts", declarations.get(name)!);
		hiddenFiles.add(pickersDir + name + ".tsx");
		const sources = appSources(name);
		virtualFiles.set(appFile(name, "value"), sources.value);
		virtualFiles.set(appFile(name, "ref"), sources.ref);
	}
	const appOptions: ts.CompilerOptions = {
		...options,
		noEmit: true,
		declaration: false,
	};
	const host = ts.createCompilerHost(appOptions);
	const fileExists = host.fileExists.bind(host);
	const readFile = host.readFile.bind(host);
	const getSourceFile = host.getSourceFile.bind(host);
	// the programs below share the files they read from disk
	const parsed = new Map<string, ts.SourceFile | undefined>();
	host.fileExists = (fileName) =>
		virtualFiles.has(fileName) ||
		(!hiddenFiles.has(fileName) && fileExists(fileName));
	host.readFile = (fileName) =>
		virtualFiles.get(fileName) ??
		(hiddenFiles.has(fileName) ? undefined : readFile(fileName));
	host.getSourceFile = (fileName, languageVersion, ...rest) => {
		const text = virtualFiles.get(fileName);
		if (text !== undefined)
			return ts.createSourceFile(fileName, text, languageVersion, true);
		if (!parsed.has(fileName))
			parsed.set(fileName, getSourceFile(fileName, languageVersion, ...rest));
		return parsed.get(fileName);
	};
	diagnostics = new Map();
	// one program per picker, so each picker's own declarations are what types
	// its dates, as in an app that imports only that picker
	for (const name of pickers) {
		const appFiles = [appFile(name, "value"), appFile(name, "ref")];
		const program = ts.createProgram({
			rootNames: appFiles,
			options: appOptions,
			host,
		});
		for (const fileName of appFiles) {
			const sourceFile = program.getSourceFile(fileName)!;
			diagnostics.set(
				fileName,
				[
					...program.getSyntacticDiagnostics(sourceFile),
					...program.getSemanticDiagnostics(sourceFile),
				].map((diagnostic) => {
					const { line } = sourceFile.getLineAndCharacterOfPosition(
						diagnostic.start ?? 0,
					);
					return `line ${line + 1}: ${ts.flattenDiagnosticMessageText(
						diagnostic.messageText,
						" ",
					)}`;
				}),
			);
		}
	}
}, 120000);

describe.each(pickers)(
	"%s, in an app that does not import AdapterMoment",
	(name) => {
		it("[ISSUE-3474-ITEM-10] types the value, its limits and what onChange gets as a Moment or null", () => {
			expect(diagnostics.get(appFile(name, "value"))).toEqual([]);
		});

		it("[ISSUE-3474-ITEM-10] types the ref as the field's root div", () => {
			expect(diagnostics.get(appFile(name, "ref"))).toEqual([]);
		});
	},
);

const theme = createTheme();

afterEach(() => {
	cleanup();
});

describe.each([
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const)("%s", (_name, Picker) => {
	it("[ISSUE-3474-ITEM-10] hands the ref the field's root div", () => {
		const ref = React.createRef<HTMLDivElement>();
		const { container } = render(
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Picker label={"Due"} value={moment("2026-08-01")} ref={ref} />
				</LocalizationProvider>
			</ThemeProvider>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toBe(
			container.querySelector(".MuiPickersTextField-root"),
		);
	});
});
