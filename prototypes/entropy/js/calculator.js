import { checkInput } from '../../../lib/input-check.js';
import { entropy } from '../../../lib/entropy-calculator.js';

function E(x) {
    if (x < 0 || x > 1.00001) throw new Error("The Binary Entropy function was tried to be calculated with an invalid x value input");

    // using an interval for the last value of x because the increment of data points (x values)
    // in graphFunction() becomes continuously more inaccurate, not reaching exactly 1
    if (x === 0 || x === 1 || (0.99999 <= x && x <= 1.00001)) {
        return 0;
    }
    return (-x) * Math.log2(x) - (1 - x) * Math.log2(1 - x);
}

// Returns array of points that represents E(x)
function graphFunction() {
    var pointNum = 1;

    const data = [];
    for (var x = 0; x <= pointNum + 0.001; x = x + 0.001) {
        var y = E(x);
        data.push([x, y])
    }
    return data;
}

function calcSum(inputElements) {
    var sum = 0;
    for (const element of inputElements) {
        sum += parseInt(element.value, 10);
    }

    document.getElementById('sum-classes').textContent = sum;

    // Show alert about all instance values being 0
    if (sum === 0) {
        $('#alert-sum-0').removeClass('d-none');
    } else {
        // If the alert is still being displayed, hide it now that there is at least one non-zero instance value
        $('#alert-sum-0').addClass('d-none');
    }

    return sum;
}

function calcProbs(inputElements, sum) {
    var pValues = [];
    for (var i = 0; i < inputElements.length; i++) {
        // To not divide by 0 if all instance values are 0
        var pValue = sum === 0 ? 0 : parseInt(inputElements[i].value, 10) / sum;
        pValues.push(pValue);
        document.getElementById('p' + (i + 1).toString()).textContent = pValue;
    }

    return pValues;
}

function drawPoint(data, tableEntropy) {
    // FInd the closest data point to the x-value of p(Class 1)
    var targetXvalue = tableEntropy.tBodies[0].rows[0].cells[1].textContent;
    var closest = data[0][0];
    var closestPoint = data[0];
    // Assume the first number is the closest
    var closestDiff = Math.abs(targetXvalue - closest);

    // Calculate the difference between the target and closest  
    for (const dataPoint of data) {
        var currentXvalue = dataPoint[0];
        var currentDiff = Math.abs(targetXvalue - currentXvalue);

        // Calculate the difference between the target and current number
        if (currentDiff < closestDiff) {
            // Update the closest number
            closestPoint = dataPoint;

            // Update the closest difference
            closestDiff = currentDiff;
        }

    }
    var points = [[closestPoint[0], closestPoint[1]], [closestPoint[0], 0]];

    return points;

}

function calcEntropy() {
    var table = document.getElementById('table-classes');
    var inputElements = table.getElementsByTagName('input');

    // Cancel calculation if the input is invalid
    if (checkInput(inputElements) === 1) {
        return;
    }

    // If any of the alerts are still being displayed, hide it now that there are no input errors anymore
    $('#alert-invalid-val').addClass('d-none');
    $('#alert-empty-input').addClass('d-none');

    // Calculate the sum of instances
    var sum = calcSum(inputElements);

    // Calculate the probabilities
    var pValues = calcProbs(inputElements, sum);

    var e = entropy(pValues);

    var output = document.getElementById('sum-entropy');
    output.textContent = e;

    var tableEntropy = document.getElementById('table-entropy');
    var tableClasses = document.getElementById('table-classes');
    var numberClasses = tableClasses.getElementsByTagName('tbody')[0].rows.length;
    if (numberClasses === 2) {
        var data = graphFunction();
        return drawPoint(data, tableEntropy);
    } else{
        return null;
    }
}

export { E, graphFunction, calcSum, calcProbs, entropy, calcEntropy, checkInput };