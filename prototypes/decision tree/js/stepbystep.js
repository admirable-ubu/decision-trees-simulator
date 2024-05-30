import { nodeCount, leafCount, dataTableGroups } from './tree.js';
import { createValueTable } from './valueTable.js';

var currentStep = 1;

var changedCells = [];

function highlightAttributes(){
    var rowsToMark = dataTableGroups[currentStep - 2][0];
    var colsToMark = dataTableGroups[currentStep - 2][1];

    var table = document.getElementById('dataTableEl');
    var tHead = table.getElementsByTagName('thead')[0];
    var tHeadCols = tHead.getElementsByTagName('tr')[0].getElementsByTagName('th');

    var tBody = table.getElementsByTagName('tbody')[0];
    var tRows = tBody.getElementsByTagName('tr');
    for (var i = 0; i < tRows.length; i++) {
        // Mark the currently important columns
        if(rowsToMark.includes(i)){
            var rowCols = tRows[i].getElementsByTagName('td');
            for (var j  = 0; j < rowCols.length; j++){
                if(colsToMark.includes(j)){
                    rowCols[j+1].classList.add('table-warning');
                    changedCells.push(rowCols[j+1]);
                }
            }

        // Gray out the currently unimportant rows
        } else{
            tRows[i].classList.add('table-secondary');
            changedCells.push(tRows[i]);
        }
    }

    // Mark the currently important header columns/attributes
    for (var i = 0; i < tHeadCols.length; i++){
        if (colsToMark.includes(i)){
            tHeadCols[i+1].classList.add('table-warning');
            changedCells.push(tHeadCols[i+1]);
        }
    }
}

function unhighlightAttributes(){
    for (var i = 0; i < changedCells.length; i++){
        if(changedCells[i].tagName == 'TD' || changedCells[i].tagName == 'TH'){
            changedCells[i].classList.remove('table-warning');
        } else if (changedCells[i].tagName == 'TR'){
            changedCells[i].classList.remove('table-secondary');
        }
    }
}

function initialStep() {
    unhighlightAttributes();

    currentStep = 1;
    document.getElementById('stepCount').textContent = "Step: 1";
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToHide = document.getElementById(groupId);
        groupToHide.style.display = "none";
    }

    createValueTable(currentStep);
}

function stepForward() {
    if (currentStep === nodeCount + leafCount) return;

    unhighlightAttributes();

    currentStep++;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + currentStep;
    var groupToShow = document.getElementById(groupId);
    groupToShow.style.display = "block";

    highlightAttributes();
    createValueTable(currentStep);
}

function stepBack() {
    if (currentStep === 1) return;

    unhighlightAttributes();

    currentStep--;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + (currentStep + 1);
    var groupToHide = document.getElementById(groupId);
    groupToHide.style.display = "none";

    if(currentStep >= 2){
        highlightAttributes();
    }
    createValueTable(currentStep);
}

function lastStep() {
    unhighlightAttributes();

    currentStep = nodeCount + leafCount;
    document.getElementById('stepCount').textContent = "Step: " + (nodeCount + leafCount);
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }

    highlightAttributes();
    createValueTable(currentStep);
}

function goToStep() {
    for (var i = 2; i <= currentStep; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }
}

export { initialStep, stepForward, stepBack, lastStep, goToStep };
export default initialStep;