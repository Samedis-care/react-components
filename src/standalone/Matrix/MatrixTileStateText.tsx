import React from "react";
import { styled } from "@mui/material";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import visuallyHidden from "../../utils/internal/visuallyHidden";

/** The words, read out after the label and not shown */
const StateText = styled("span")(visuallyHidden);

/**
 * The tile never suspends: while the translations load, the entry says its
 * state in English, then re-renders.
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };

/**
 * What an entry's ring and fade show, in words, to follow its label:
 * ", highlighted", ", dimmed" or both.
 * @param t The library's translate function
 * @param highlighted Whether the entry is highlighted (MatrixTileItem.highlighted)
 * @param dimmed Whether the entry is dimmed (MatrixTileItem.dimmed)
 * @returns The words, each after a comma, or "" for neither
 */
export const tileStateText = (
	t: TFunction,
	highlighted: boolean | undefined,
	dimmed: boolean | undefined,
): string =>
	[
		highlighted &&
			t("standalone.matrix.tile-highlighted", { defaultValue: "highlighted" }),
		dimmed && t("standalone.matrix.tile-dimmed", { defaultValue: "dimmed" }),
	]
		.filter(Boolean)
		.map((word) => `, ${word}`)
		.join("");

export interface MatrixTileStateTextProps {
	/**
	 * Whether the entry is highlighted (MatrixTileItem.highlighted)
	 */
	highlighted?: boolean;
	/**
	 * Whether the entry is dimmed (MatrixTileItem.dimmed)
	 */
	dimmed?: boolean;
}

/**
 * Says what an entry's ring and fade show, after its label: visually hidden
 * text, part of the entry's name when it is a button and read with it when it
 * is not. Rendered only for an entry that is highlighted or dimmed, so a plain
 * entry does not subscribe to the translations.
 */
const MatrixTileStateText = (props: MatrixTileStateTextProps) => {
	const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
	return (
		<StateText>{tileStateText(t, props.highlighted, props.dimmed)}</StateText>
	);
};

export default React.memo(MatrixTileStateText);
