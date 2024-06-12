const catColumnIndex = 0;

function createRemoveButton() {
    var removeButton = document.createElement("div");
    removeButton.classList.add("btn");
    removeButton.classList.add("btn-outline-danger");
    removeButton.setAttribute("id", "btnRemoveCategory");
    removeButton.textContent = "-";
    return removeButton;
}

function removeCategory() {
    var table = document.getElementById('table-cond-entropy');
    var tBodyRef = table.getElementsByTagName('tbody')[0];

    if (tBodyRef.rows.length === 2) throw new Error("No categories can be removed if there are only 2 left");

    
    document.querySelector('#btnRemoveCategory').removeEventListener('click', removeCategory);
    table.deleteRow(tBodyRef.rows.length);

    // add "Category remove button" to the now last row
    if (tBodyRef.rows.length >= 3) {
        var removeButton = createRemoveButton();

        var catCell = tBodyRef.rows[tBodyRef.rows.length - 1].cells[catColumnIndex]
        catCell.appendChild(removeButton);
        document.querySelector('#btnRemoveCategory').addEventListener('click', removeCategory);
    }
}

function addCategory() {
    var table = document.getElementById('table-cond-entropy');
    var tBodyRef = table.getElementsByTagName('tbody')[0];

    var catCount = +tBodyRef.rows[tBodyRef.rows.length - 1].cells[catColumnIndex].id[1] + 1;
    var newRow = tBodyRef.insertRow();
    var catCell = newRow.insertCell();
    var class1Cell = newRow.insertCell();
    var class2Cell = newRow.insertCell();
    var ratioCell = newRow.insertCell();
    var entropyCell = newRow.insertCell();

    // Category cell
    catCell.id = "c" + catCount;
    var catLabel = document.createElement("label");
    catLabel.classList.add("form-control-plaintext");
    catLabel.textContent = "Category " + +catCount + ":";
    catCell.appendChild(catLabel);

    var removeButton = createRemoveButton();
    catCell.appendChild(removeButton);
    catCell.classList.add("text-center");

    // Class 1 cell
    var class1Input = document.createElement("input");
    class1Input.setAttribute("value", "0");
    class1Input.setAttribute("type", "text");
    class1Input.classList.add("form-control");
    class1Cell.appendChild(class1Input);

    // Class 2 cell
    var class2Input = document.createElement("input");
    class2Input.setAttribute("value", "0");
    class2Input.setAttribute("type", "text");
    class2Input.classList.add("form-control");
    class2Cell.appendChild(class2Input);

    // Ratio cell
    var ratioLabel = document.createElement("label");
    ratioLabel.classList.add("form-control-plaintext");
    ratioLabel.textContent = "0.00";
    ratioCell.appendChild(ratioLabel);

    // Entropy cell
    var entropyLabel = document.createElement("label");
    entropyLabel.classList.add("form-control-plaintext");
    entropyLabel.textContent = "0.00";
    entropyCell.appendChild(entropyLabel);

    document.getElementById('ceCell').setAttribute("rowspan", catCount.toString());

    // remove "Category remove button" of previous input group so that there is only one
    if (tBodyRef.rows.length >= 4) {
        document.querySelector('#btnRemoveCategory').removeEventListener('click', removeCategory);
        var cell = tBodyRef.rows[tBodyRef.rows.length - 2].cells[catColumnIndex]
        var button = cell.getElementsByTagName("div")[0];
        cell.removeChild(button);
    }
    document.querySelector('#btnRemoveCategory').addEventListener('click', removeCategory);
}

export { addCategory, removeCategory }
export default addCategory;