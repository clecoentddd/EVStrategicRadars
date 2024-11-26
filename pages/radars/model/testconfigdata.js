export function getValueDistanceOptions2() {
  const ValueDistance = {
    SHORT: 'Short Distance',
    MEDIUM: 'Medium Distance',
    LONG: 'Long Distance'
  };

  const ValueImpact = {
    LOW: "Low Impact",
    MEDIUM: "Medium Impact",
    HIGH: "High Impact"
  };

  const ValueTolerance = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High"
  };

  const ValueCategory = {
    CAT1: "Business",
    CAT2: "Operating Model",
    CAT3: "People and Knowledge",
    CAT4: "Capabilities",
  };

  const ValueType = {
    PROBLEM: "Problem",
    OPPORTUNITY: "Opportunity",
  };

  return {
    distanceOptions: Object.values(ValueDistance),
    impactOptions: Object.values(ValueImpact),
    toleranceOptions: Object.values(ValueTolerance),
    categoryOptions: Object.values(ValueCategory),
    typeOptions: Object.values(ValueType)
  };
}