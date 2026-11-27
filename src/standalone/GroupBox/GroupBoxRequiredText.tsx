import React from "react";
import useCCTranslations from "../../utils/useCCTranslations";

/**
 * Props of {@link GroupBoxRequiredText}
 */
export interface GroupBoxRequiredTextProps {
	/**
	 * The id the frame's `aria-describedby` points at
	 */
	id: string;
}

/**
 * What a required frame says to assistive technology: a hidden "Required" in the
 * user's language, which the frame's `aria-describedby` names first. A component of
 * its own, so that only a required frame waits for the library's translations.
 * @param props The props
 */
const GroupBoxRequiredText = (props: GroupBoxRequiredTextProps) => {
	const { t } = useCCTranslations();
	return (
		<span id={props.id} hidden>
			{t("standalone.group-box.required")}
		</span>
	);
};

export default React.memo(GroupBoxRequiredText);
