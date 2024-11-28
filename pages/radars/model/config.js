// configFunctions.js

const ValueDistance = {
    OPTION_1: 'Detected',
    OPTION_2: 'Assessing',
    OPTION_3: 'Assessed',
    OPTION_4: 'Responding',
    OPTION_5: 'Responded',
};

const ValueImpact = {
    OPTION_1: 'Low',
    OPTION_2: 'Medium',
    OPTION_3: 'High',
};

const ValueTolerance = {
    OPTION_1: 'Low',
    OPTION_2: 'Medium',
    OPTION_3: 'High',
};

const ValueCategory = {
    OPTION_1: 'Business',
    OPTION_2: 'Operating Model',
    OPTION_3: 'People & Knowledge',
    OPTION_4: 'Capabilities',
};

const ValueType = {
    OPTION_1: 'Problem',
    OPTION_2: 'Opportunity',
};

// Functions to access config data
const getValueDistanceOptions = () => Object.values(ValueDistance);
const getValueImpactOptions = () => Object.values(ValueImpact);
const getValueToleranceOptions = () => Object.values(ValueTolerance);
const getValueCategoryOptions = () => Object.values(ValueCategory);
const getValueTypeOptions = () => Object.values(ValueType);

module.exports = {
    getValueDistanceOptions,
    getValueImpactOptions,
    getValueToleranceOptions,
    getValueCategoryOptions,
    getValueTypeOptions,
};
