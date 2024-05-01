function createRemoveButton() {
    var removeButton = document.createElement("div");
    removeButton.classList.add("btn");
    removeButton.classList.add("btn-outline-danger");
    removeButton.setAttribute("onclick", "removeClass()");
    removeButton.textContent = "-";
    return removeButton;
}

function addClass() {
    var tableClasses = document.getElementById('table-classes');
    var tableEntropy = document.getElementById('table-entropy');
    var tBodyRefClasses = tableClasses.getElementsByTagName('tbody')[0];
    var tBodyRefEntropy = tableEntropy.getElementsByTagName('tbody')[0];

    // Display info alert for calculating the Entropy with more than 2 classes
    // (change it here so that it's only called when the rows length goes from 2 to 3)
    if (tBodyRefClasses.rows.length === 2) {
        $('#alert-3-plus-classes').removeClass('d-none');
    }

    // Classes table
    // add border under class cell of the current last row
    tBodyRefClasses.rows[tBodyRefClasses.rows.length - 1].cells[0].setAttribute("style", "border-bottom: visible");

    var cCount = +tBodyRefClasses.rows[tBodyRefClasses.rows.length - 1].cells[1].id[1] + 1;
    var newRow = tBodyRefClasses.insertRow();
    var cCell = newRow.insertCell();
    var cValueCell = newRow.insertCell();

    // Class cell
    var newLabel = document.createElement("label");
    newLabel.classList.add("form-control-plaintext");
    newLabel.textContent = "Class " + +cCount + ":";
    cCell.appendChild(newLabel);
    cCell.setAttribute("style", "border-bottom: hidden");

    // Value (Number of instances) cell
    cValueCell.id = "c" + cCount;
    var inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");

    var newInput = document.createElement("input");
    newInput.setAttribute("value", "0");
    newInput.setAttribute("style", "width:100px");
    newInput.setAttribute("type", "text");
    newInput.classList.add("form-control");
    inputGroup.appendChild(newInput);

    var removeButton = createRemoveButton();
    inputGroup.appendChild(removeButton);

    cValueCell.appendChild(inputGroup);

    // remove "Class remove button" of previous input group so that there is only one
    if (tBodyRefClasses.rows.length >= 4) {
        var cell = tBodyRefClasses.rows[tBodyRefClasses.rows.length - 2].cells[1]
        var inputG = cell.getElementsByTagName("div")[0];
        var input = inputG.getElementsByTagName("input")[0];
        var button = inputG.getElementsByTagName("div")[0];
        inputG.removeChild(button);
        cell.removeChild(inputG);
        cell.appendChild(input);
    }

    // Entropy table
    var pCount = +tBodyRefEntropy.rows[tBodyRefEntropy.rows.length - 1].cells[1].id[1] + 1;
    var newRowE = tBodyRefEntropy.insertRow();
    var pCell = newRowE.insertCell();
    var valueCell = newRowE.insertCell();

    // Probability cell
    pCell.textContent = "p(Class " + +pCount + "):";

    // Value cell
    valueCell.textContent = 0;
    valueCell.id = "p" + pCount;
}

function removeClass() {
    var tableClasses = document.getElementById('table-classes');
    var tableEntropy = document.getElementById('table-entropy');
    var tBodyRefClasses = tableClasses.tBodies[0]
    var numClassesBefore = tBodyRefClasses.rows.length;

    if (numClassesBefore === 2) throw new Error("No classes can be removed if there are only 2 left");

    tableClasses.deleteRow(numClassesBefore);
    tableEntropy.deleteRow(numClassesBefore - 1);

    var numClassesAfter = tBodyRefClasses.rows.length;

    // remove border under class cell of the new last row
    tBodyRefClasses.rows[numClassesAfter - 1].cells[0].setAttribute("style", "border-bottom: hidden");

    // add "Class remove button" to the now last row
    if (numClassesAfter >= 3) {
        var inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group");

        var cell = tBodyRefClasses.rows[numClassesAfter - 1].cells[1]
        var input = cell.getElementsByTagName("input")[0];
        cell.removeChild(input);
        inputGroup.appendChild(input);

        var removeButton = createRemoveButton();
        inputGroup.appendChild(removeButton);

        cell.appendChild(inputGroup);
    }

    // Display info alert for calculating the Entropy with more than 2 classes
    // (change it here so that it's only called when the rows length goes from 2 to 3)
    if (numClassesAfter === 2) {
        $('#alert-3-plus-classes').addClass('d-none');
    }
}

if (typeof module === 'object') {
    module.exports = {addClass, removeClass};
}