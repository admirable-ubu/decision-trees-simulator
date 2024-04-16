function calcRatio(tBodyRef, instanceVals){

    var sum = 0;
    rowSums = [];
    for (var i = 0; i < instanceVals.length; i++) {
        sum += parseInt(instanceVals[i].value);
        if(i % 2){
            rowSums.push(parseInt(instanceVals[i-1].value) + parseInt(instanceVals[i].value));
        }
    }

    ratioVals = [];
    rowCount = tBodyRef.rows.length;
    for (var i = 0; i < rowCount; i++) {
        ratio = rowSums[i] / sum;
        ratioVals.push(ratio);
        ratioCell = tBodyRef.getElementsByTagName('tr')[i].getElementsByTagName('td')[3];
        ratioLabel = ratioCell.getElementsByTagName('label')[0];
        ratioLabel.innerHTML = ratio;
    }
    return [rowSums, ratioVals];
}

function calcEntropyCat(rowSums, tBodyRef, instanceVals){
    // Get the Class values for each category
    rowValues = [];
    for (var i = 0; i < instanceVals.length; i++) {
        if(i % 2){
            rowValue = [parseInt(instanceVals[i-1].value), parseInt(instanceVals[i].value)];
            rowValues.push(rowValue);
        }
    }

    // Calculate the Entropy for each category
    var entropies = [];
    for (var i = 0; i < rowSums.length; i++) {
        entropy = 0;
        // Entropy is 0 if there are no instances belonging to one of the classes
        if (rowValues[i][0] != 0 && rowValues[i][1] != 0){
            for (var j = 0; j < 2; j++) {
                entropy -= (rowValues[i][j] / rowSums[i]) * Math.log2(rowValues[i][j] / rowSums[i]);
            }
        }

        entropyCell = tBodyRef.getElementsByTagName('tr')[i].getElementsByTagName('td')[4];
        entropyLabel = entropyCell.getElementsByTagName('label')[0];
        entropyLabel.innerHTML = entropy;
        entropies.push(entropy);
    }
    return entropies;

}

function calcCondEntropy(tableNr){
    // Calculate ratios and Entropies for each category first
    if (tableNr == 1){
        var table = document.getElementById('table-cond-entropy-1');
    } else{
        var table = document.getElementById('table-cond-entropy-2');
    }
    
    var tBodyRef = table.getElementsByTagName('tbody')[0];
    var instanceVals = table.getElementsByTagName('input');
    var rowSumsRatios = calcRatio(tBodyRef, instanceVals);
    var rowSums = rowSumsRatios[0];
    var ratioVals = rowSumsRatios[1];
    var entropies = calcEntropyCat(rowSums, tBodyRef, instanceVals);

    condEntropy = 0;
    for (var i = 0; i < entropies.length; i++) {
        condEntropy += ratioVals[i] * entropies[i];
    }
    if(tableNr == 1){
        document.getElementById('ce1').innerHTML = condEntropy;
    } else{
        document.getElementById('ce2').innerHTML = condEntropy;
    }
}
    
function removeCategory(){
    var table = document.getElementById('table-cond-entropy-2');
    var tBodyRef = table.getElementsByTagName('tbody')[0];
    table.deleteRow(tBodyRef.rows.length);

    // add "Category remove button" to the now last row
    if(tBodyRef.rows.length >= 4) {
        var removeButton = document.createElement("div");
        removeButton.classList.add("btn");
        removeButton.classList.add("btn-outline-danger");
        removeButton.setAttribute("onclick", "removeCategory()");
        removeButton.innerHTML = "-";

        cell = tBodyRef.rows[tBodyRef.rows.length - 1].cells[0]
        cell.appendChild(removeButton);
    }
}

function addCategory(){
    var table = document.getElementById('table-cond-entropy-2');
    var tBodyRef = table.getElementsByTagName('tbody')[0];

    var catCount = +tBodyRef.rows[tBodyRef.rows.length - 1].cells[0].id[1] + 1;
    var newRow = tBodyRef.insertRow();
    var catCell = newRow.insertCell();
    var class1Cell = newRow.insertCell();
    var class2Cell = newRow.insertCell();
    var ratioCell = newRow.insertCell();
    var entropyCell = newRow.insertCell();

    // Category cell
    catCell.id = "c" + catCount;
    catLabel = document.createElement("label");
    catLabel.classList.add("form-control-plaintext");
    catLabel.innerHTML = "Category " + +catCount + ":";
    catCell.appendChild(catLabel);

    removeButton = document.createElement("div");
    removeButton.classList.add("btn");
    removeButton.classList.add("btn-outline-danger");
    removeButton.setAttribute("onclick", "removeCategory()");
    removeButton.innerHTML = "-";
    catCell.appendChild(removeButton);

    // Class 1 cell
    class1Input = document.createElement("input");
    class1Input.setAttribute("value", "0");
    class1Input.setAttribute("type", "text");
    class1Input.classList.add("form-control");
    class1Cell.appendChild(class1Input);

    // Class 2 cell
    class2Input = document.createElement("input");
    class2Input.setAttribute("value", "0");
    class2Input.setAttribute("type", "text");
    class2Input.classList.add("form-control");
    class2Cell.appendChild(class2Input);

    // Ratio cell
    ratioLabel = document.createElement("label");
    ratioLabel.classList.add("form-control-plaintext");
    ratioLabel.innerHTML = "0";
    ratioCell.appendChild(ratioLabel);

    // Entropy cell
    entropyLabel = document.createElement("label");
    entropyLabel.classList.add("form-control-plaintext");
    entropyLabel.innerHTML = "0";
    entropyCell.appendChild(entropyLabel);

    document.getElementById('ce2cell').setAttribute("rowspan", catCount.toString());

    // remove "Category remove button" of previous input group so that there is only one
    if(tBodyRef.rows.length >= 5) {
        cell = tBodyRef.rows[tBodyRef.rows.length - 2].cells[0]
        button = cell.getElementsByTagName("div")[0];
        cell.removeChild(button);
    }
}