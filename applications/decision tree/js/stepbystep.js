import { nodeCount, leafCount, dataTableGroups } from './tree.js';
import { createValueTable } from './valueTable.js';

var currentStep = 1;

var changedCells = [];

const useNodeId = "useNode";
const useLeafId = "useLeaf";

const symbolNodeId = "node";
const symbolLeafId = "leaf";

const redMarkerHeightNode = '89';
const redMarkerHeightLeaf = '131';
const redMarkerWidth = '80';

/**
 * Highlight the currently relevant columns and rows of the data table
 */
function highlightAttributes() {
    var rowsToMark = dataTableGroups[currentStep - 2][0];
    var colsToMark = dataTableGroups[currentStep - 2][1];

    var table = document.getElementById('dataTableEl');
    var tHead = table.getElementsByTagName('thead')[0];
    var tHeadCols = tHead.getElementsByTagName('tr')[0].getElementsByTagName('th');

    var tBody = table.getElementsByTagName('tbody')[0];
    var tRows = tBody.getElementsByTagName('tr');
    for (var i = 0; i < tRows.length; i++) {
        // Mark the currently important columns
        if (rowsToMark.includes(i)) {
            var rowCols = tRows[i].getElementsByTagName('td');
            for (var j = 0; j < rowCols.length; j++) {
                if (colsToMark.includes(j)) {
                    rowCols[j + 1].classList.add('table-warning');
                    changedCells.push(rowCols[j + 1]);
                }
            }

            // Gray out the currently unimportant rows
        } else {
            tRows[i].classList.add('table-secondary');
            changedCells.push(tRows[i]);
        }
    }

    // Array that will hold the current rules to later write them into the table caption 
    var currentRules = [];

    // Mark the currently important header columns/attributes
    for (var i = 0; i < tHeadCols.length; i++) {
        if (colsToMark.includes(i)) {
            tHeadCols[i + 1].classList.add('table-warning');
            changedCells.push(tHeadCols[i + 1]);

            // Get first appearance of the desired attribute value
            var valueName = tRows[rowsToMark[0]].getElementsByTagName('td')[i + 1].textContent;
            // First append attribute name to the string
            var rule = tHeadCols[i + 1].textContent;
            rule += "=" + valueName;
            currentRules.push(rule);
        }
    }

    // Write the rule(s) into the caption
    var captionEl = document.getElementById('dataTableCaption');
    if (currentRules.length > 0) {
        if (currentRules.length === 1) {
            captionEl.textContent = 'Current rule: ' + currentRules[0];
        } else {
            captionEl.textContent = 'Current rules: ' + currentRules.join(' & ');
        }
    } else {
        captionEl.textContent = 'Current rules: none';
    }
}

/**
 * Un-highlight the columns and rows of the data table that were highlighted in the previous step
 */
function unhighlightAttributes() {
    for (var i = 0; i < changedCells.length; i++) {
        if (changedCells[i].tagName == 'TD' || changedCells[i].tagName == 'TH') {
            changedCells[i].classList.remove('table-warning');
        } else if (changedCells[i].tagName == 'TR') {
            changedCells[i].classList.remove('table-secondary');
        }
    }
}

/**
 * Create a red marker around the current node
 * @param {*} useElements The use elements that are part of the current SVG group element
 */
function createRedMarker(useElements) {
    var node;
    // Store the current node/leaf number
    var useElementNr = -1;

    // Do we create a red marker for a decision node or a leaf node?
    for (var i = 0; i < useElements.length; i++) {
        var useElementId = useElements[i].id;
        if (useElementId.substring(0, useNodeId.length) == useNodeId) {
            node = true;
            useElementNr = +useElementId.substring(useNodeId.length);
        } else if (useElementId.substring(0, useLeafId.length) == useLeafId) {
            node = false;
            useElementNr = +useElementId.substring(useLeafId.length);
        }
    }

    // Get symbol/template, create new rect (marker) and set height based on whether it is a node or a leaf
    var symbol = null;
    if (node) {
        symbol = document.getElementById(symbolNodeId + useElementNr);
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('height', redMarkerHeightNode);
    } else {
        symbol = document.getElementById(symbolLeafId + useElementNr);
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('height', redMarkerHeightLeaf);
    }

    // Set the marker's attributes and append it to the symbol/template
    rect.setAttribute('id', 'currentRedMarker');
    rect.setAttribute('x', '1');
    rect.setAttribute('y', '1');
    rect.setAttribute('width', redMarkerWidth);
    rect.style.stroke = "red";
    rect.style.strokeWidth = "2";
    rect.style.fill = "none";

    symbol.appendChild(rect);
}

/**
 * Delete the current red marker from the SVG tree
 */
function deleteRedMarker(){
    var redMarkerRect = document.getElementById('currentRedMarker');
    if (redMarkerRect != null){
        redMarkerRect.parentNode.removeChild(redMarkerRect);
    }
}

/**
 * Go to the initial step of the step-by-step visualization
 */
function initialStep() {
    unhighlightAttributes();
    deleteRedMarker();

    currentStep = 1;
    document.getElementById('stepCount').textContent = "Step: 1";
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToHide = document.getElementById(groupId);
        groupToHide.style.display = "none";
    }

    createRedMarker(document.getElementById('g' + currentStep).querySelectorAll('use'));
    createValueTable(currentStep);
}

/**
 * Go a step forward with the step-by-step visualization
 */
function stepForward() {
    if (currentStep === nodeCount + leafCount) return;

    unhighlightAttributes();
    deleteRedMarker();

    currentStep++;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + currentStep;
    var groupToShow = document.getElementById(groupId);
    groupToShow.style.display = "block";

    createRedMarker(groupToShow.querySelectorAll('use'))
    highlightAttributes();
    createValueTable(currentStep);
}

/**
 * Go a step back with the step-by-step visualization
 */
function stepBack() {
    if (currentStep === 1) return;

    unhighlightAttributes();
    deleteRedMarker();

    currentStep--;
    document.getElementById('stepCount').textContent = "Step: " + currentStep;
    var groupId = 'g' + (currentStep + 1);
    var groupToHide = document.getElementById(groupId);
    groupToHide.style.display = "none";

    createRedMarker(document.getElementById('g' + currentStep).querySelectorAll('use'));
    if (currentStep >= 2) {
        highlightAttributes();
    }
    createValueTable(currentStep);
}

/**
 * Go to the last step of the step-by-step visualization
 */
function lastStep() {
    unhighlightAttributes();
    deleteRedMarker();

    currentStep = nodeCount + leafCount;
    document.getElementById('stepCount').textContent = "Step: " + (nodeCount + leafCount);
    for (var i = 2; i <= nodeCount + leafCount; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }

    createRedMarker(groupToShow.querySelectorAll('use'));
    highlightAttributes();
    createValueTable(currentStep);
}

/**
 * Go to the current step of the step-by-step visualization
 * (used only for window-resizing purposes)
 */
function goToStep() {
    for (var i = 2; i <= currentStep; i++) {
        var groupId = 'g' + i;
        var groupToShow = document.getElementById(groupId);
        groupToShow.style.display = "block";
    }
    
    createRedMarker(document.getElementById('g' + currentStep).querySelectorAll('use'));
}

export { initialStep, stepForward, stepBack, lastStep, goToStep };
export default initialStep;