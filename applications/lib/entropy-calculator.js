/**
 * Calculates the entropy of a dataset
 * @param {*} pValues Array that contains the p(robability) value of each data point in the dataset 
 * @returns The entropy of the dataset
 */
export function entropy(pValues) {
    var entropy = 0;
    for (const pValue of pValues) {
        entropy -= pValue * Math.log2(pValue);
    }
    if (isNaN(entropy)) {
        entropy = 0;
    }
    return entropy;
}
