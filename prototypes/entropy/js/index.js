function E(x) {
    if (x == 0 || x == 1 || 0.99999 <= x) {
        return 0;
    }
    return (-x) * Math.log2(x) - (1 - x) * Math.log2(1 - x);
}

// Returns array of points that represents E(x)
function graphFunction() {
    pointNum = 1;

    const data = [];
    for (var x = 0; x <= pointNum + 0.001; x = x + 0.001) {
        y = E(x);
        data.push([x, y])
    }
    return data;
}

function calcProbs() {
    var table = document.getElementById('table-classes');
    var items = table.getElementsByTagName('input');
    var sum = 0;
    for (var i = 0; i < items.length; i++) {
        sum += parseInt(items[i].value);
    }
    document.getElementById('sum-classes').innerHTML = sum;
    for (var i = 0; i < items.length; i++) {
        var pValue = parseInt(items[i].value) / sum
        document.getElementById('p' + (i + 1).toString()).innerHTML = pValue;
    }
}

function calcEntropy() {
    calcProbs();
    var table = document.getElementById('table-entropy');
    var rowCount = table.tBodies[0].rows.length;
    var columnIndex = 1;
    var sum = 0;
    for (var i = 0; i < rowCount; i++) {
        var pCurrent = table.rows[i].cells[columnIndex].innerHTML;
        sum -= pCurrent * Math.log2(pCurrent);
    }
    if (isNaN(sum)) {
        var output = document.getElementById('sum-entropy');
        output.innerHTML = 0;
    } else {
        var output = document.getElementById('sum-entropy');
        output.innerHTML = sum;
    }
}

function addClass() {
    var tableClasses = document.getElementById('table-classes');
    var tableEntropy = document.getElementById('table-entropy');
    var tBodyRef = tableEntropy.getElementsByTagName('tbody')[0];

    var clone = tableClasses.rows[tableClasses.rows.length - 2].cloneNode(true);
    clone.cells[0].firstChild.data =
        clone.cells[0].firstChild.data.replace(/(\d+):/, function (str, g1) {
            return (+g1 + 1) + ':';
        });
    tableClasses.tBodies[0].appendChild(clone);

    var pCount = +tBodyRef.rows[tBodyRef.rows.length - 1].cells[1].id[1] + 1;
    var newRow = tBodyRef.insertRow();
    var pCell = newRow.insertCell();
    var valueCell = newRow.insertCell();

    pCell.innerHTML = "p(Class " + +pCount + "):";

    valueCell.innerHTML = 0;
    valueCell.id = "p" + pCount;
}

function removeClass(){
    var tableClasses = document.getElementById('table-classes');
    var tableEntropy = document.getElementById('table-entropy');

    tableClasses.deleteRow(tableClasses.tBodies[0].rows.length-1);
    tableEntropy.deleteRow(tableEntropy.tBodies[0].rows.length-1);

}
