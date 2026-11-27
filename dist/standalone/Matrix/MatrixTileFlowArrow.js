import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { styled } from "@mui/material";
import { ArrowDownward, ArrowRightAlt } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import visuallyHidden from "../../utils/internal/visuallyHidden";
const FlowArrowVertical = styled(ArrowDownward)({ fontSize: 13 });
const FlowArrowHorizontal = styled(ArrowRightAlt)({ fontSize: 16 });
/** The arrow in words, read out and not shown */
const FlowArrowText = styled("span")(visuallyHidden);
/**
 * The tile never suspends: while the translations load, the arrow is read in
 * English, then re-renders.
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
/**
 * The arrow between an entry's label and its secondary label, and what it
 * means in words ("to"), so a screen reader says "F to ICU" where the tile
 * shows "F → ICU". The icon itself is hidden from assistive technology.
 */
const MatrixTileFlowArrow = (props) => {
    const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
    // The spaces stand outside the hidden word, where they separate it from
    // the labels in the name; between flex items they are not rendered.
    return (_jsxs(_Fragment, { children: [" ", _jsx(FlowArrowText, { children: t("standalone.matrix.tile-arrow", { defaultValue: "to" }) }), " ", props.horizontal ? _jsx(FlowArrowHorizontal, {}) : _jsx(FlowArrowVertical, {})] }));
};
export default React.memo(MatrixTileFlowArrow);
