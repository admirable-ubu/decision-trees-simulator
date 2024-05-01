function calcRatio(tBodyRef, instanceVals) {
    var sum = 0;
    var rowSums = [];
    for (var i = 0; i < instanceVals.length; i++) {
        var currentVal = parseInt(instanceVals[i].value, 10);
        sum += currentVal;

        // Calculate the sum of the row's instance values
        if (i % 2) {
            rowSums.push(parseInt(instanceVals[i - 1].value, 10) + currentVal);
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
        var ratioCell = tBodyRef.rows[i].getElementsByTagName('td')[3];
        var ratioLabel = ratioCell.getElementsByTagName('label')[0];
        ratioLabel.textContent = ratio;
    }

    return [rowSums, ratioVals];
}

function calcEntropyCat(rowSums, tBodyRef, instanceVals) {
    // Get the Class values for each category
    var rowValues = [];
    for (var i = 0; i < instanceVals.length; i++) {
        if (i % 2) {
            var rowValue = [parseInt(instanceVals[i - 1].value, 10), parseInt(instanceVals[i].value, 10)];
            rowValues.push(rowValue);
        }
    }

    // Calculate the Entropy for each category
    var entropies = [];
    for (i = 0; i < rowSums.length; i++) {
        var entropy = 0;
        // Entropy is 0 if there are no instances belonging to one of the classes
        if (rowValues[i][0] !== 0 && rowValues[i][1] !== 0) {
            for (var j = 0; j < 2; j++) {
                entropy -= (rowValues[i][j] / rowSums[i]) * Math.log2(rowValues[i][j] / rowSums[i]);
            }
        }

        var entropyCell = tBodyRef.getElementsByTagName('tr')[i].getElementsByTagName('td')[4];
        var entropyLabel = entropyCell.getElementsByTagName('label')[0];
        entropyLabel.textContent = entropy;
        entropies.push(entropy);
    }
    return entropies;

}

function checkInput(instanceVals) {
    var invalidVal = false;
    var emptyInput = false;

    // Check if there are any negative values or empty inputs
    for (const instanceVal of instanceVals) {
        var value = instanceVal.value;
        if (value < 0 || isNaN(value) || value % 1 !== 0) invalidVal = true;
        if (value == "") emptyInput = true;
    }

    try {
        // If there are errors, display alerts and cancel the calculation
        if (invalidVal && emptyInput) throw ['#alert-invalid-val', '#alert-empty-input'];
        if (invalidVal) throw ['#alert-invalid-val'];
        if (emptyInput) throw ['#alert-empty-input'];

    } catch (errors) {
        // Display all alerts
        errors.forEach(error => {
            $(error).removeClass('d-none');
        });
        // If only one error is found, remove the alert for the other in case it occurred before and has now been fixed
        if (errors.length === 1) {
            if (errors[0] == '#alert-invalid-val') {
                $('#alert-empty-input').addClass('d-none');
            } else {
                $('#alert-invalid-val').addClass('d-none');
            }

        }
        // If the alert for all-0 values is still being displayed:
        // hide it now that it is not all-0 values anymore
        $('#alert-sum-0').addClass('d-none');
        return 1;
    }
    return 0;
}

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
    document.getElementById('ce').textContent = condEntropy;
}

if (typeof module === 'object') {
    module.exports = {calcRatio, calcEntropyCat, checkInput, calcCondEntropy};
}