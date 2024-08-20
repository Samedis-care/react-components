const advancedEnumValueToBaseSelectorData = (data) => {
    const { getLabel, ...other } = data;
    return {
        label: getLabel(),
        ...other,
    };
};
export default advancedEnumValueToBaseSelectorData;
