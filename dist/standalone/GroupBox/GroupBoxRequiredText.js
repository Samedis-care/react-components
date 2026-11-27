import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * What a required frame says to assistive technology: a hidden "Required" in the
 * user's language, which the frame's `aria-describedby` names first. A component of
 * its own, so that only a required frame waits for the library's translations.
 * @param props The props
 */
const GroupBoxRequiredText = (props) => {
    const { t } = useCCTranslations();
    return (_jsx("span", { id: props.id, hidden: true, children: t("standalone.group-box.required") }));
};
export default React.memo(GroupBoxRequiredText);
