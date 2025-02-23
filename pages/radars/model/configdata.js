function createOptionsFromEnum(enumObject) {
  return Object.keys(enumObject).map(key => ({
    value: key,
    label: enumObject[key]
  }));
}

export function getValueDistanceOptions() {
  
  const ValueDistance = {
    LEVEL1: 'Detected',
    LEVEL2: 'Assessing',
    LEVEL3: 'Assessed',
    LEVEL4: 'Responding',
    LEVEL5: 'Responded',
  };

  const ValueImpact = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High"
  };

  const ValueTolerance = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High"
  };

  const ValueCategory = {
    CATEGORY1: "Business",
    CATEGORY2: "Operating Model",
    CATEGORY3: "People and Knowledge",
    CATEGORY4: "Capabilities",
  };

  const ValueType = {
    RISK: "Risk",
    OPPORTUNITY: "Opportunity",
  };

  return {
    distanceOptions: createOptionsFromEnum(ValueDistance),
    impactOptions: createOptionsFromEnum(ValueImpact),
    toleranceOptions: createOptionsFromEnum(ValueTolerance),
    categoryOptions: createOptionsFromEnum(ValueCategory),
    typeOptions: createOptionsFromEnum(ValueType)
  };
}