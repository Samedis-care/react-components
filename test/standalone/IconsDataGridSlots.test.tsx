import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
	DataGridColumnHeaderFilterActiveIcon,
	DataGridColumnHeaderFilterIcon,
} from "../../src/standalone/DataGrid/DataGrid";

// the DataGrid's column-header filter button shows the idle slot for a column
// without a filter value and the active slot for a filtered one
// (src/standalone/DataGrid/Content/ColumnHeaderContent.tsx)

const theme = createTheme();
const renderSvg = (ui: React.ReactElement) => {
	const { container } = render(
		<ThemeProvider theme={theme}>{ui}</ThemeProvider>,
	);
	return container.querySelector("svg") as SVGSVGElement;
};
const glyphOf = (svg: SVGSVGElement) => ({
	viewBox: svg.getAttribute("viewBox"),
	paths: Array.from(svg.querySelectorAll("path"), (path) =>
		path.getAttribute("d"),
	),
});

afterEach(() => {
	// auto-cleanup is off in this repo
	cleanup();
});

describe("DataGrid column-header filter icon slots", () => {
	it("[ISSUE-3460-ITEM-3] the idle slot draws MUI's outlined FilterAltOutlined at MUI's small size", () => {
		const slot = renderSvg(<DataGridColumnHeaderFilterIcon />);
		const icon = renderSvg(<FilterAltOutlinedIcon fontSize="small" />);
		expect(glyphOf(slot)).toEqual(glyphOf(icon));
		expect(getComputedStyle(slot).fontSize).toBe("20px");
		expect(getComputedStyle(slot).fontSize).toBe(
			getComputedStyle(icon).fontSize,
		);
	});

	it("[ISSUE-3460-ITEM-3] the active slot draws MUI's filled FilterAlt, not the idle funnel", () => {
		const slot = renderSvg(<DataGridColumnHeaderFilterActiveIcon />);
		const icon = renderSvg(<FilterAltIcon fontSize="small" />);
		const idle = renderSvg(<DataGridColumnHeaderFilterIcon />);
		expect(glyphOf(slot)).toEqual(glyphOf(icon));
		expect(glyphOf(slot)).not.toEqual(glyphOf(idle));
		expect(getComputedStyle(slot).fontSize).toBe("20px");
	});
});
