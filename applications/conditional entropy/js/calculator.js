import { checkInput } from '../../lib/input-check.js';
import { entropy } from '../../lib/entropy-calculator.js';

const parseIntBase = 10;
const ratioColumnIndex = 3;

/**
 * Calculates the sums and ratios for each category
 * @param {*} tBodyRef The HTML table body element
 * @param {*} inputElements A HTMLCollection containing the HTML input elements that contain the input values
 * @returns An array containing the sums and ratios of each category
 */
function calcRatio(tBodyRef, inputElements) {
    var sum = 0;
    var rowSums = [];
    for (var i = 0; i < inputElements.length; i++) {
        var currentVal = parseInt(inputElements[i].value, parseIntBase);
        sum += currentVal;

        // Calculate the sum of the row's instance values
        if (i % 2) {
            rowSums.push(parseInt(inputElements[i - 1].value, parseIntBase) + currentVal);
        }
    }

    // Show alert about all instance values being 0
    if (sum === 0) {
        $('#alert-sum-0').removeClass('d-none');
    } else {
        // If the alert is still being displayed, hide it now that there is at least one non-zero instance value
        $('#alert-sum-0').addClass('d-none');
    }

    var rowCount = tBodyRef.rows.length;
    var ratioVals = []
    for (i = 0; i < rowCount; i++) {
        // To not divide by 0 if all instance values are 0
        var ratio = sum === 0 ? 0 : rowSums[i] / sum;
        ratioVals.push(ratio);
        var ratioCell = tBodyRef.rows[i].getElementsByTagName('td')[ratioColumnIndex];
        var ratioLabel = ratioCell.getElementsByTagName('label')[0];
        ratioLabel.textContent = ratio.toFixed(2);
    }

    return [rowSums, ratioVals];
}

/**
 * Calculates the entropy for each category
 * @param {*} rowSums An array containing each category's cumulative sum of instances
 * @param {*} tBodyRef The HTML table body element
 * @param {*} instanceVals A HTMLCollection containing the HTML input elements that contain the input values
 * @returns An array containing the entropy of each category
 */
function calcEntropyCat(rowSums, tBodyRef, instanceVals) {
    // Get the Class values for each category
    var rowValues = [];
    for (var i = 0; i < instanceVals.length; i++) {
        if (i % 2) {
            var rowValue = [parseInt(instanceVals[i - 1].value, parseIntBase), parseInt(instanceVals[i].value, parseIntBase)];
            rowValues.push(rowValue);
        }
    }

    // Calculate the Entropy for each category
    var entropies = [];
    for (i = 0; i < rowSums.length; i++) {
        var e = 0;
        // Entropy is 0 if there are no instances belonging to one of the classes
        if (rowValues[i][0] !== 0 && rowValues[i][1] !== 0) {
            var pValues = [rowValues[i][0] / rowSums[i], rowValues[i][1] / rowSums[i]];
            e = entropy(pValues);
        }

        var entropyCell = tBodyRef.getElementsByTagName('tr')[i].getElementsByTagName('td')[4];
        var entropyLabel = entropyCell.getElementsByTagName('label')[0];
        entropyLabel.textContent = e.toFixed(2);
        entropies.push(e);
    }
    return entropies;

}

/**
 * Calculates the conditional entropy for the whole dataset/all given input values
 * @returns Return to cancel the calculation if any input is invalid
 */
function calcCondEntropy() {
    // Calculate ratios and Entropies for each category first
    var table = document.getElementById('table-cond-entropy');
    var tBodyRef = table.getElementsByTagName('tbody')[0];
    var instanceVals = table.getElementsByTagName('input');

    // Cancel calculation if the input is invalid
    if (checkInput(instanceVals) === 1) {
        return;
    }

    // If any of the alerts are still being displayed, hide it now that there are no input errors anymore
    $('#alert-invalid-val').addClass('d-none');
    $('#alert-empty-input').addClass('d-none');

    var rowSumsRatios = calcRatio(tBodyRef, instanceVals);
    var rowSums = rowSumsRatios[0];
    var ratioVals = rowSumsRatios[1];
    var entropies = calcEntropyCat(rowSums, tBodyRef, instanceVals);

    var condEntropy = 0;
    for (var i = 0; i < entropies.length; i++) {
        condEntropy += ratioVals[i] * entropies[i];
    }
    document.getElementById('ce').textContent = condEntropy.toFixed(2);
}

export { calcRatio, calcEntropyCat, calcCondEntropy };
export default calcCondEntropy;