export class SelectClass {
  constructor(key, value, text) {
    this.key = key;
    this.value = value;
    this.text = text;
  }
}

export const clearSimilarArrayObjects = (
  /**@type Array */ arr,
  /**@type String */ key
) => {
  const currentData = {};
  arr.forEach((eachData) => {
    currentData[eachData[key]] = eachData;
  });

  const currentDataArray = Object.entries(currentData)?.map(
    ([key, value]) => value
  );

  return currentDataArray;
};
