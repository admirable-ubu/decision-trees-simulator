export function checkInput(instanceVals) {
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

