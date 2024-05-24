import React, { useCallback, useContext } from "react";
import { useFormContextLite } from "../Form";
import { BackActionButton } from "../DefaultFormPageButtons";
import useCCTranslations from "../../../utils/useCCTranslations";
import { IsInFormDialogContext } from "../FormDialog";
const FlowEngineBackButton = (props) => {
    const { customProps, submitting } = useFormContextLite();
    const custProps = customProps;
    const isInDialog = useContext(IsInFormDialogContext);
    const goBack = custProps?.goBack;
    const hasCustomCloseHandler = custProps?.hasCustomSubmitHandler;
    const { t } = useCCTranslations();
    const handleBack = useCallback(() => {
        if (goBack)
            goBack();
    }, [goBack]);
    return (React.createElement(React.Fragment, null, goBack && !(isInDialog && hasCustomCloseHandler) && (React.createElement(BackActionButton, { ...props, disabled: props.disabled || submitting, onClick: handleBack }, props.children ?? t("common.buttons.back")))));
};
export default React.memo(FlowEngineBackButton);
