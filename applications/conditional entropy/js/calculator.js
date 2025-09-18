import { checkInput } from '../../lib/input-check.js';
import { entropy } from '../../lib/entropy-calculator.js';

/**
 * Calculates the sums and ratios for each category
 * @param {*} tBodyRef The HTML table body element
 * @param {*} inputElements A HTMLCollection containing the HTML input elements that contain the input values
 * @returns An array containing the sums and ratios of each category
 */
function calcRatio(tBodyRef, inputElements) {
  let total = 0;
  const rowSums = [];
  for (let i = 0; i < inputElements.length; i++) {
    const v = parseInt(inputElements[i].value, 10) || 0;
    total += v;
    // Calculate the sum of the row's instance values
    if (i % 2) rowSums.push((parseInt(inputElements[i - 1].value, 10) || 0) + v);
  }

  // Show alert about all instance values being 0
  if (total === 0) {
    $('#alert-sum-0').removeClass('d-none');
  } else {
    // If the alert is still being displayed, hide it now that there is at least one non-zero instance value
    $('#alert-sum-0').addClass('d-none');
  }

  // Ratio values
  const ratioVals = [];
  for (let i = 0; i < tBodyRef.rows.length; i++) {
    const row = tBodyRef.rows[i];
    const inputs = row.querySelectorAll('input');
    if (inputs.length < 2) {            // void row
      continue;
    }

    // To not divide by 0 if all instance values are 0
    const rowSum = rowSums[i] || 0;
    const ratio = total === 0 ? 0 : rowSum / total;
    ratioVals.push(ratio);

    // Show the value next to the last class column
    const ratioCell = inputs[1].closest('td')?.nextElementSibling;
    const ratioLabel = ratioCell?.querySelector('label');
    if (ratioLabel) ratioLabel.textContent = ratio.toFixed(2);
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
  /// Get the Class values for each category
  const rowValues = [];
  for (let i = 0; i < instanceVals.length; i++) {
    if (i % 2) {
      rowValues.push([
        parseInt(instanceVals[i - 1].value, 10) || 0,
        parseInt(instanceVals[i].value, 10) || 0
      ]);
    }
  }

  // Calculate the Entropy for each category
  const entropies = [];
  for (let i = 0; i < rowSums.length; i++) {
    let e = 0;
    const a = rowValues[i]?.[0] || 0;
    const b = rowValues[i]?.[1] || 0;
    const s = rowSums[i] || 0;

    if (a !== 0 && b !== 0 && s !== 0) {
      e = entropy([a / s, b / s]);
    }
    entropies.push(e);

    // Show the value next to the Ratio cell
    const row = tBodyRef.rows[i];
    const inputs = row?.querySelectorAll('input') || [];
    const entropyCell = inputs[1]?.closest('td')?.nextElementSibling?.nextElementSibling;
    const entropyLabel = entropyCell?.querySelector('label');
    if (entropyLabel) entropyLabel.textContent = e.toFixed(2);
  }

  return entropies;
}

/**
 * Calculates the conditional entropy for the whole dataset/all given input values
 * @returns Return to cancel the calculation if any input is invalid
 */
function calcCondEntropy() {
  // Calculate ratios and Entropies for each category first
  const table = document.getElementById('table-cond-entropy');
  const tBodyRef = table.getElementsByTagName('tbody')[0];
  const instanceVals = table.getElementsByTagName('input');

  // Cancel calculation if the input is invalid
  if (checkInput(instanceVals) === 1) return;
  $('#alert-invalid-val').addClass('d-none');
  $('#alert-empty-input').addClass('d-none');

  // If any of the alerts are still being displayed, hide it now that there are no input errors anymore
    $('#alert-invalid-val').addClass('d-none');
    $('#alert-empty-input').addClass('d-none');

  const [rowSums, ratioVals] = calcRatio(tBodyRef, instanceVals);
  const entropies = calcEntropyCat(rowSums, tBodyRef, instanceVals);

  let condEntropy = 0;
  for (let i = 0; i < entropies.length; i++) {
    condEntropy += (ratioVals[i] || 0) * (entropies[i] || 0);
  }
  document.getElementById('ce').textContent = condEntropy.toFixed(2);
}

export { calcRatio, calcEntropyCat, calcCondEntropy };
export default calcCondEntropy;