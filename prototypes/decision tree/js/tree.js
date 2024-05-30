import { goToStep } from './stepbystep.js';
import { entropy } from '../../../lib/entropy-calculator.js';

const STD_LEAFHEIGHT = 133;
const STD_NODEHEIGHT = 92;
const STD_NODEWIDTH = 82;

const STD_BRANCH_FONTSIZE = 12;

// To retrieve locally stored user data
const userA = 'userAttributes';
const userAV = 'userAttributeValues';
const userL = 'userLabel';
const userLV = 'userLabelValues';
const userD = 'userData';

const svgId = 'svgDT';
var svgWidth = 0;
var svgHeight = 0;

var decisionTree = null;

var nodeCount = 0;
var leafCount = 0;

var dataTableGroups = [];
var valueTableGroups = [];

var data;
var attributes;
var attributeValues;
var label;
var labelValues;

// Get example data
import { data1, attributes1, attributeValues1, label1, labelValues1 } from '../exampledata/example1.js';
// const attributes = Object.keys(data[0].attributes);

// import data from '../exampledata/example1.mjs';
// const attributes = Object.keys(data[0].attributes);

// function loadExampleData(){
//     fetch('./exampledata/example1.json')
//     .then(response => response.json())
//     .then(jsonData => {
//         data = jsonData;
//         attributes = Object.keys(data[0].attributes);
//     })
//     .catch(error => console.error('Error fetching example data:', error));
// }


class NodeValues {
    constructor(class1, class2, n, entropy) {
        this.class1 = class1;
        this.class2 = class2;
        this.n = n;
        this.entropy = entropy;
    }
}

class TreeNode {
    constructor(id, attribute, nodeValues, isLeaf = false, label, prevBranchVal) {
        this.id = id;
        this.attribute = attribute;

        this.nodeValues = nodeValues;
        this.isLeaf = isLeaf;
        this.label = label;

        this.prevBranchVal = prevBranchVal;
        this.parent = null;
        this.children = [];

        this.depth = 0;
        this.x = 0;
        this.y = 0;
        this.mod = 0;
    }
}



function mostCommonLabel(data) {
    var labels = [];
    data.forEach(function (row) {
        labels.push(row.label);
    });

    var counts = {};
    for (var i = 0; i < labels.length; i++) {
        counts[labels[i]] = counts[labels[i]] ? counts[labels[i]] + 1 : 1;
    }

    var max = 0;
    var maxLabel = null;
    for (var i = 0; i < labels.length; i++) {
        if (counts[labels[i]] > max) {
            max = counts[labels[i]];
            maxLabel = labels[i];
        }
    }

    return maxLabel;
}

/**
 * Counts the occurrence of each label value
 */
function countLabels(labels) {
    var counts = {};
    for (const label of labels) {
        counts[label] = counts[label] ? counts[label] + 1 : 1;
    }
    return counts;
}

function entropyLabels(labels) {
    // Count the occurrence of each label value
    var counts = countLabels(labels);

    // Calculate probabilities
    var sum = labels.length;
    var pValues = [];
    for (const labelCount of Object.values(counts)) {
        pValues.push(labelCount / sum);
    }

    // Calculate the entropy
    var e = entropy(pValues);
    return e;
}

function infoGain(data, attribute, valTableGroup) {
    // Save the calculated values for each attribute for the value table
    var valTabAttribute = {};
    var valTabAttributeVals = [];
    // Save subset label counts for the value table
    var valTabSubsetCounts = [];

    // Save the labels for each of the attribute's instances in an array
    var attributeIndex = attributes.indexOf(attribute);
    var attributeLabels = [];
    data.forEach(function (row) {
        attributeLabels.push([Object.values(row.attributes)[attributeIndex], row.label]);
    });

    // Save only the labels to calculate this attribute's entropy
    var labels = [];
    attributeLabels.forEach(function (row) {
        labels.push(row[1]);
    });

    // Caclulate entropy for the whole attribute
    var e = entropyLabels(labels);

    // Save the attribute values in a set
    var currentAttributeValues = new Set(data.map(instance => Object.values(instance.attributes)[attributeIndex]));

    // Count the number of instances for each value
    var attributeValuesCounts = (data.map(instance => Object.values(instance.attributes)[attributeIndex]));

    var counts = {};
    attributeValuesCounts.forEach(function (row) {
        counts[row] = counts[row] ? counts[row] + 1 : 1;
    });

    // Calculate the entropy for each value
    var entropies = [];
    for (const value of currentAttributeValues) {
        var subset = attributeLabels.filter(instance => instance[0] === value);
        // Save only the labels to calculate this attribute's entropy
        var subsetLabels = [];
        subset.forEach(function (row) {
            subsetLabels.push(row[1]);
        });

        // Transform counts object into array of label counts for the value table
        var subsetLabelsCount = countLabels(subsetLabels);
        var subLabCountKeys = Object.keys(subsetLabelsCount);
        var subLabCountVals = Object.values(subsetLabelsCount);
        var valTabCounts = [];
        for (var i = 0; i < labelValues.length; i++) {
            if (subLabCountKeys.includes(labelValues[i])) {
                var index = subLabCountKeys.indexOf(labelValues[i]);
                valTabCounts.push(subLabCountVals[index]);
            } else {
                valTabCounts.push(0);
            }
        }
        valTabSubsetCounts.push(valTabCounts);

        entropies.push([entropyLabels(subsetLabels), counts[value] / data.length, value]);
    }

    // Calculate the conditional entropy
    var condEntropy = 0;
    for (const entropy of entropies) {
        condEntropy += entropy[0] * entropy[1];
    }

    // Calculate the information gain
    var infoGain = e - condEntropy;

    // Save the values for each subset
    for (var i = 0; i < currentAttributeValues.size; i++) {
        var subsetValues = [];
        subsetValues.push(entropies[i][2]);
        subsetValues.push(valTabSubsetCounts[i]);
        subsetValues.push(entropies[i][1].toFixed(2));
        subsetValues.push(entropies[i][0].toFixed(2));
        if (i === 0) {
            subsetValues.push(condEntropy.toFixed(2));
            subsetValues.push(infoGain.toFixed(2));
        }
        valTabAttributeVals.push(subsetValues);
    }

    // Save the values for this attribute
    valTabAttribute[attribute] = valTabAttributeVals;
    valTableGroup.push(valTabAttribute);

    return infoGain;
}


function findBestAttribute(data, attributes, valTableGroup) {
    var bestAttribute = null;
    var maxGain = 0;
    attributes.forEach(function (attribute) {
        var gain = infoGain(data, attribute, valTableGroup);
        if (gain > maxGain) {
            maxGain = gain;
            bestAttribute = attribute;
        }
    });
    return bestAttribute;
}

function id3(data, attributes, prevBranchVal, nodeId, leafId) {
    if (data.length === 0) return null;
    var allPositive = true;
    var allNegative = true;
    var class1 = 0;
    var class2 = 0;
    var n = data.length;

    // Save the labels in an array
    var datasetLabels = [];
    data.forEach(function (row) {
        datasetLabels.push(row.label);
    });

    // Caclulate entropy for the dataset
    var e = entropyLabels(datasetLabels).toFixed(2);

    for (const row of data) {
        if (row.label == labelValues[1]) {
            class2++;
            allPositive = false;
        }
        if (row.label == labelValues[0]) {
            class1++;
            allNegative = false;
        }
    }

    // Save values for the value table to be able to create it later
    var valTableGroup = [];

    // Check if we have reached a leaf node
    if (allPositive) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        var nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, labelValues[0], prevBranchVal), nodeId, nextLeafId];
    }
    if (allNegative) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        var nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, labelValues[1], prevBranchVal), nodeId, nextLeafId];
    }
    if (attributes.length === 0) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        var nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(data), prevBranchVal), nodeId, nextLeafId];
    }

    // Find the current best attribute to split the data on
    var bestAttribute = findBestAttribute(data, attributes, valTableGroup);
    var tree = new TreeNode(nodeId, bestAttribute, new NodeValues(class1, class2, n, e), false, null, null);
    valueTableGroups.push(valTableGroup);

    // Split the data on the best attribute
    var bestAttributeValues = new Set(data.map(instance => instance.attributes[bestAttribute]));

    nodeId = nodeId[0] + (+nodeId.substring(1) + 1);

    // Do a recursive call for each value of the selected attribute or add a leaf node if the value's subset is empty
    for (const value of bestAttributeValues) {
        var subset = data.filter(instance => instance.attributes[bestAttribute] === value);

        dataTableGroups.push([subset]);

        var remainingAttributes = attributes.filter(attribute => attribute !== bestAttribute);

        if (subset.length === 0) {
            valTableGroup = [class1, class2];
            valueTableGroups.push(valTableGroup);

            tree.children.push(new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(subset), prevBranchVal));
        } else {
            tree.prevBranchVal = prevBranchVal;
            var returnVals = id3(subset, remainingAttributes, value, nodeId, leafId);
            tree.children.push(returnVals[0]);
            nodeId = returnVals[1];
            leafId = returnVals[2];
        }
    }
    return [tree, nodeId, leafId];
}

function assignParents(node, parent = null) {
    if (!node) return;

    // Assign parent reference
    node.parent = parent;

    // Recursively assign parents for children
    for (let child of node.children) {
        assignParents(child, node);
    }
}

function createNewUse(id, href, x, y, width, height) {
    // Create a new 'use' element and set the node's position attributes
    var newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', id);
    newUse.setAttribute('href', href);
    newUse.setAttribute('x', x);
    newUse.setAttribute('y', y);
    newUse.setAttribute('width', width);
    newUse.setAttribute('height', height);

    return newUse
}

function createNode(nodeId, n, e, attribute, x, y, width, height) {
    var svgEl = document.getElementById(svgId);
    var nodeTemplate = document.getElementById('node');
    var nodeNumber = nodeId.substring(1);

    // Clone the template
    var clonedTemplate = nodeTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'node' + nodeNumber);

    // Update text contents
    clonedTemplate.querySelector('#nodeNr').textContent += nodeNumber;
    clonedTemplate.querySelector('#nodeN').textContent += n;
    clonedTemplate.querySelector('#nodeE').textContent += e;
    clonedTemplate.querySelector('#nodeAttribute').textContent = attribute;

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useNode' + nodeNumber, '#node' + nodeNumber, x, y, width, height);
}


function createLeaf(leafId, n, class1, class2, e, label, x, y, width, height) {
    var svgEl = document.getElementById(svgId);
    var leafTemplate = document.getElementById('leaf');
    var leafNumber = leafId.substring(1);

    // Clone the template
    var clonedTemplate = leafTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'leaf' + leafNumber);

    // Update text contents
    clonedTemplate.querySelector('#leafNr').textContent += leafNumber;
    clonedTemplate.querySelector('#leafN').textContent += n;
    clonedTemplate.querySelector('#leafYes').textContent = labelValues[0] + ' = ' + class1;
    clonedTemplate.querySelector('#leafNo').textContent = labelValues[1] + ' = ' + class2;
    clonedTemplate.querySelector('#leafE').textContent += e;
    clonedTemplate.querySelector('#leafLabel').textContent += label;

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useLeaf' + leafNumber, '#leaf' + leafNumber, x, y, width, height);
}


function createBranch(nodeId, x1, y1, x2, y2, value) {
    var svgEl = document.getElementById(svgId);
    var branchTemplate = document.getElementById('branch');

    // Clone the template
    var clonedTemplate = branchTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'branch' + nodeId);

    var templateBranchPathId = 'branchPath';
    var templateBranchTPid = 'branchTP';

    // Update position attributes and ids
    if (x2 < x1) {
        var positionAttribute = 'M' + x2 + ' ' + y2 + ' ' + x1 + ' ' + y1;
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-end', '');
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-start', 'url(#arrowMarkerReverse)');
    } else {
        var positionAttribute = 'M' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2;
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-end', 'url(#arrowMarker)');
    }
    clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('d', positionAttribute);
    clonedTemplate.querySelector('#branchValue').textContent = value;

    var textSizeRatio = (y2 - y1) / 100;
    clonedTemplate.querySelector('#branchValue').setAttribute('font-size', textSizeRatio * STD_BRANCH_FONTSIZE);
    if (x1 === x2) {
        clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('startOffset', (y2 - y1) * 0.1);
    } else {
        clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('startOffset', (y2 - y1) * 0.2);
    }
    clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('id', templateBranchPathId + nodeId);
    clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('href', '#' + templateBranchPathId + nodeId);
    clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('id', templateBranchTPid + nodeId);

    // Create a new 'use' element
    var newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', 'useBranch' + nodeId);
    newUse.setAttribute('href', '#branch' + nodeId);

    // Append cloned template and use element to the svg
    svgEl.appendChild(clonedTemplate);
    return newUse;
}


// Calculate the tree's depth (including the root node)
function calcTreeDepth(rootNode) {
    if (!rootNode) return 0;
    if (rootNode.children.length === 0) return 1;

    var maxDepth = 0;

    rootNode.children.forEach(child => {
        maxDepth = Math.max(maxDepth, calcTreeDepth(child));
    });

    return maxDepth + 1;
}

// Calculate the tree's width by getting the maximum amount of nodes a row has
function calcTreeWidth(rootNode) {
    if (!rootNode) return 0;
    if (rootNode.children.length === 0) return 0;

    var maxWidth = 0;
    var maxWidth2 = 0;

    rootNode.children.forEach(child => {
        maxWidth++;
        child.children.forEach(() => {
            maxWidth2++;
        });
    });
    maxWidth = Math.max(maxWidth, maxWidth2);

    rootNode.children.forEach(child => {
        maxWidth = Math.max(maxWidth, calcTreeWidth(child));
    });

    return maxWidth;
}

function countNodesAtEachLevel(root) {
    if (!root) {
        return [];
    }

    let levels = [];
    let queue = [root];

    while (queue.length > 0) {
        let levelSize = queue.length;
        levels.push(levelSize);

        for (let i = 0; i < levelSize; i++) {
            let currentNode = queue.shift();
            for (let child of currentNode.children) {
                queue.push(child);
            }
        }
    }

    return levels;
}

/**
 * Calculates the initial x values for all nodes
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function calcInitialX(node, nodeIndex, columnWidth, currentLevel = 0) {
    for (var i = 0; i < node.children.length; i++) {
        calcInitialX(node.children[i], i, columnWidth, currentLevel + 1);
    }

    // Position leaf nodes next to each other, each at a distance of columnWidth
    if (node.children.length === 0) {
        if (nodeIndex !== 0) {
            node.x = node.parent.children[nodeIndex - 1].x + columnWidth;
        } else {
            node.x = 0;
        }

        // Position nodes that have one child above their child, except if they have siblings
    } else if (node.children.length === 1) {
        if (nodeIndex === 0) {
            node.x = node.children[0].x;
        } else {
            node.x = node.parent.children[nodeIndex - 1].x + columnWidth;
            node.mod = node.x - node.children[0].x;
        }

        // Position nodes that have more than one child in the middle between their children, except if they have siblings
    } else {
        var middle = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
        if (nodeIndex === 0) {
            node.x = middle;
        } else {
            node.x = node.parent.children[nodeIndex - 1].x + columnWidth;
            node.mod = node.x - middle;
        }
    }

    // Check nodes that have at least one child and are not the leftmost sibling if there are conflicts in the subtrees in the levels below them
    if (node.children.length > 0 && nodeIndex !== 0) {
        checkForConflicts(node, columnWidth, currentLevel, nodeIndex);
    }
}

/**
 * Checks if subtrees of a node are overlapping
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function checkForConflicts(node, columnWidth, currentLevel, nodeIndex) {
    // Nodes should at least be one column width apart from each other
    var minDistance = columnWidth;
    var shift = 0;

    var leftEdges = calcLeftEdges(node, 0, currentLevel);

    var siblingIndex = 0;
    var currentSibling = node.parent.children[siblingIndex];
    // Go through all siblings that are left of the node
    while (currentSibling != null && currentSibling != node) {
        var rightEdges = calcRightEdges(currentSibling, 0, currentLevel);

        var leftEdgesKeys = Object.keys(leftEdges).map(Number);
        var maxLeftEdgesKey = leftEdgesKeys.reduce((a, b) => Math.max(a, b), -Infinity);

        var rightEdgesKeys = Object.keys(rightEdges).map(Number);
        var maxRightEdgesKey = rightEdgesKeys.reduce((a, b) => Math.max(a, b), -Infinity);

        // Go through all subtrees that are left and right of the node
        for (var level = currentLevel + 1; level <= Math.min(maxRightEdgesKey, maxLeftEdgesKey); level++) {
            var dist = leftEdges[level] - rightEdges[level];
            // If the distance is less than the minimum distance, increase the necessary shift
            if (dist + shift < minDistance) {
                shift = minDistance - dist;
            }
        }

        // Shift the node and update its mod so that its children will get shifted later, too
        if (shift > 0) {
            node.x += shift;
            node.mod += shift;

            // Center nodes in between after the shift
            centerNodesBetween(node, currentSibling, siblingIndex, nodeIndex);

            shift = 0;
        }

        siblingIndex++;
        currentSibling = currentSibling.parent.children[siblingIndex];
    }
}

/**
 * Centers the nodes that are in between two nodes on the edge
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function centerNodesBetween(leftNode, rightNode, leftIndex, rightIndex) {
    var numNodesBetween = (rightIndex - leftIndex) - 1;

    if (numNodesBetween > 0) {
        var distanceBetweenNodes = (leftNode.x - rightNode.x) / (numNodesBetween + 1);

        var count = 1;
        for (var i = leftIndex + 1; i < rightIndex; i++) {
            var middleNode = leftNode.parent.children[i];

            var desiredX = rightNode.x + (distanceBetweenNodes * count);
            var offset = desiredX - middleNode.x;
            middleNode.x += offset;
            middleNode.mod += offset;

            count++;
        }

        // Double check for conflicts
        checkForConflicts(leftNode);
    }

}

/**
 * Calculates the left edges of a node and its children
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function calcLeftEdges(node, modSum, currentLevel, edges = {}) {
    if (edges[currentLevel] == null) {
        edges[currentLevel] = node.x + modSum;
    } else {
        edges[currentLevel] = Math.min(edges[currentLevel], node.x + modSum);
    }

    modSum += node.mod;

    for (const child of node.children) {
        calcLeftEdges(child, modSum, currentLevel + 1, edges);
    }

    return edges;
}

/**
 * Calculates the right edges of a node and its children
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function calcRightEdges(node, modSum, currentLevel, edges = {}) {
    if (edges[currentLevel] == null) {
        edges[currentLevel] = node.x + modSum;
    } else {
        edges[currentLevel] = Math.max(edges[currentLevel], node.x + modSum);
    }

    modSum += node.mod;

    for (const child of node.children) {
        calcRightEdges(child, modSum, currentLevel + 1, edges);
    }

    return edges;
}

/**
 * Checks if any nodes have gone out of bounds on the left side of the SVG
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function checkInBounds(node) {
    var leftEdges = calcLeftEdges(node, 0, 0);

    var rightShift = 0;
    for (var level in Object.keys(leftEdges)) {
        // Check if any node has gone out of bounds on the left side
        if (leftEdges[level] + rightShift < 0) {
            rightShift = (leftEdges[level] * -1);
        }
    }

    if (rightShift > 0) {
        node.x += rightShift;
        node.mod += rightShift;
    }
}

/**
 * Traverses the tree one last time to perform shifts based on a child's parent's mod value
 * Based on the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function calcFinalPositions(node, modSum, leafHeight) {
    node.x += modSum;
    modSum += node.mod;

    if (node.depth === 0) {
        node.y = node.depth;
    } else {
        node.y = (node.depth * 2) * leafHeight;
    }

    for (const child of node.children) {
        calcFinalPositions(child, modSum, leafHeight);
    }
}

// Creates/draws the nodes and adds them to groups
function createNodes(node, nodeIndex, svgEl, groupId, nodeWidth, nodeHeight, leafHeight) {
    var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute("id", groupId);

    var useNode = null;
    // No branch going into the root node
    if (node.depth === 0) {
        useNode = createNode(node.id, node.nodeValues.n, node.nodeValues.entropy, node.attribute, node.x, node.y, nodeWidth, nodeHeight);
        group.appendChild(useNode);
        svgEl.appendChild(group);

    } else {
        var nodeSplitByChildren = nodeWidth / node.parent.children.length;
        var x1Value = node.parent.x + (nodeSplitByChildren - (nodeSplitByChildren / 2) + (nodeIndex * nodeSplitByChildren));
        var useBranch = createBranch(node.id, x1Value, (node.parent.y + nodeHeight) - 1, node.x + (nodeWidth / 2), node.y - 1, node.prevBranchVal)

        if (node.children.length === 0) {
            useNode = createLeaf(node.id, node.nodeValues.n, node.nodeValues.class1, node.nodeValues.class2, node.nodeValues.entropy, node.label,
                node.x, node.y, nodeWidth, leafHeight);
        } else {
            useNode = createNode(node.id, node.nodeValues.n, node.nodeValues.entropy, node.attribute, node.x, node.y, nodeWidth, nodeHeight);
        }
        group.appendChild(useBranch);
        group.appendChild(useNode);
        svgEl.appendChild(group);
        group.style.display = 'none';

        if (node.children.length === 0) {
            return groupId;
        }
    }

    for (var i = 0; i < node.children.length; i++) {
        groupId = createNodes(node.children[i], i, svgEl, 'g' + (+groupId.substring(1) + 1), nodeWidth, nodeHeight, leafHeight);
    }

    return groupId;
}

// Centers the tree in the SVG if there are still space left on the right side
function centerTree(node, nodeWidth) {
    var rightEdges = calcRightEdges(node, 0, 0);
    var rightEdgesVals = Object.values(rightEdges).map(Number);
    var maxRightEdgesVal = rightEdgesVals.reduce((a, b) => Math.max(a, b), -Infinity);

    var freeSpace = (svgWidth - maxRightEdgesVal) - nodeWidth;

    if (freeSpace > 0) {
        node.x += freeSpace / 2;
        node.mod += freeSpace / 2;
    }
}

function calcPositions(root, nodeWidth, leafHeight, columnWidth) {
    var queue = [root];

    // Assign depth to each node and reset their positional values (in case the SVG tree is being rebuilt)
    while (queue.length > 0) {
        const node = queue.shift();
        node.children.forEach(child => {
            child.depth = node.depth + 1;
            queue.push(child);
        });
    }

    console.log(decisionTree);

    // Calculate initial positions
    calcInitialX(root, 0, columnWidth);

    // Check if we need to shift the tree to the right if it went out of bounds on the left side
    checkInBounds(root);

    // Center the tree if there is still space on the right side
    centerTree(root, nodeWidth);

    // Calculate final positions
    calcFinalPositions(root, 0, leafHeight);
}

/**
 * Add the selected attributes/columns for each step to the data table groups
 */
function dataTableGroupsAddColumns(node, i = 0) {
    if (node.parent != null) {
        var reachedRoot = false;
        var attributesToMark = [];
        var currentNode = node.parent;

        while (!reachedRoot) {
            attributesToMark.push(currentNode.attribute);
            if (currentNode.parent == null) {
                reachedRoot = true;
            } else {
                currentNode = currentNode.parent;
            }
        }

        dataTableGroups[i - 1].push(attributesToMark);
    }

    for (const child of node.children) {
        i = dataTableGroupsAddColumns(child, i + 1);
    }

    return i;
}

/**
 * Transform the data table groups array elements into indeces so that stepbystep.js can work with it
 */
function transformDataTableGroups() {
    for (var i = 1; i < nodeCount + leafCount; i++) {
        var markedRows = [];
        dataTableGroups[i - 1][0].forEach(function (selectedRow) {
            data.forEach(function (row, j) {
                if (selectedRow == row) {
                    markedRows.push(j);
                }
            });
        });
        dataTableGroups[i - 1][0] = markedRows;

        var markedCols = [];
        dataTableGroups[i - 1][1].forEach(function (attribute) {
            markedCols.push(attributes.indexOf(attribute));
        });
        dataTableGroups[i - 1][1] = markedCols;
    }
}

function buildSvgTree() {
    // Get array that holds the amount of nodes in each level/row
    var levels = countNodesAtEachLevel(decisionTree);

    // A row is a row of (leaf) nodes or branches 
    var rows = levels.length + (levels.length - 1);
    var rowHeight = svgHeight / rows;
    var heightRatio = rowHeight / STD_LEAFHEIGHT;

    var maxColumns = levels.reduce((a, b) => Math.max(a, b), -Infinity);
    var columnWidth = (svgWidth / (maxColumns));
    // Nodes need to be a bit smaller than a column so there is space between them
    var nodeWidth = (svgWidth / (maxColumns + maxColumns * 0.1));
    var widthRatio = nodeWidth / STD_NODEWIDTH;

    // Choose the smaller ratio so the nodes don't go out ouf bounds
    var sizeRatio = Math.min(widthRatio, heightRatio);

    // Calculate leaf and node height with the size ratio
    var leafHeight = STD_LEAFHEIGHT * sizeRatio;
    var nodeHeight = STD_NODEHEIGHT * sizeRatio;

    // Both leaf and decision nodes have the same width
    var realNodeWidth = STD_NODEWIDTH * sizeRatio;

    calcPositions(decisionTree, realNodeWidth, leafHeight, columnWidth);

    var svgEl = document.getElementById(svgId);
    createNodes(decisionTree, 0, svgEl, "g1", realNodeWidth, nodeHeight, leafHeight);
}

function buildTree(userData = false) {
    if (userData) {
        let userCsvData = JSON.parse(localStorage.getItem('csvData'));
        data = userCsvData[userD];
        attributes = userCsvData[userA];
        attributeValues = userCsvData[userAV];
        label = userCsvData[userL];
        labelValues = userCsvData[userLV];
    } else {
        data = data1
        attributes = attributes1;
        attributeValues = attributeValues1;
        label = label1;
        labelValues = labelValues1;
    }

    dataTableGroups = [];
    valueTableGroups = [];

    var treeValues = id3(data, attributes, null, "n1", "l1");
    decisionTree = treeValues[0];
    nodeCount = +treeValues[1].substring(1) - 1;
    leafCount = +treeValues[2].substring(1) - 1;

    // var newNode = new TreeNode("n4", "testAttr", new NodeValues(3, 3, 6, 0.5), false, null, 'test1');
    // var newNode2 = new TreeNode("n5", "testAttr", new NodeValues(3, 3, 6, 0.5), false, null, 'test2');
    // var newNode3 = new TreeNode("n6", "testAttr", new NodeValues(3, 3, 6, 0.5), false, null, 'test3');
    // var newNode4 = new TreeNode("n7", "testAttr", new NodeValues(3, 3, 6, 0.5), false, null, 'test4');
    // var newLeaf = new TreeNode("l6", null, new NodeValues(3, 0, 3, 0), true, 'Yes', 'testl1');
    // var newLeaf2 = new TreeNode("l7", null, new NodeValues(0, 3, 3, 0), true, 'No', 'testl2');
    // var newLeaf3 = new TreeNode("l8", null, new NodeValues(0, 3, 3, 0), true, 'no', 'testl3');
    // var newLeaf4 = new TreeNode("l9", null, new NodeValues(0, 3, 3, 0), true, 'no', 'testl4');
    // decisionTree.children.push(newNode);
    // decisionTree.children.push(newNode2);
    // decisionTree.children[3].children.push(newLeaf);
    // decisionTree.children[3].children.push(newLeaf2);
    // decisionTree.children[2].children.push(newNode);
    // decisionTree.children[2].children.push(newNode2);
    // decisionTree.children[2].children.push(newNode3);
    // decisionTree.children[2].children.push(newNode4);
    // decisionTree.children[2].children.push(newLeaf);
    // decisionTree.children[2].children.push(newLeaf2);
    // decisionTree.children[2].children[2].children.push(newLeaf3);
    // decisionTree.children[2].children[2].children.push(newLeaf4);
    // decisionTree.children.push(newLeaf3);
    // decisionTree.children.push(newLeaf4);
    // decisionTree.children.splice(2, 1);
    // decisionTree.children.splice(1, 1);
    // decisionTree.children.push(newNode);
    // console.log(decisionTree);
    // decisionTree.children[1].children.push(newNode2);
    // console.log(decisionTree);
    // decisionTree.children[1].children[0].children.push(newNode3);
    // decisionTree.children[1].children[0].children[0].children.push(newLeaf);
    // decisionTree.children[1].children[0].children[0].children.push(newLeaf2);

    // Assign parent to each child node
    assignParents(decisionTree);

    // Prepare data table groups for the step-by-step visualization
    dataTableGroupsAddColumns(decisionTree);
    transformDataTableGroups();

    console.log(decisionTree);

    // Get SVG sizes
    var svgSizes = calcSvgSize();
    svgWidth = svgSizes[0];
    svgHeight = svgSizes[1];
    resizeViewBox();

    // Build the SVG tree
    buildSvgTree();

    // var svg = document.getElementById(svgId);
    // var groups = svg.getElementsByTagName('g');
    // for (const group of groups) {
    //     group.style.display = "block";
    // }
}

function destroyTree(svgEl) {
    // Remove all the groups in which the use elements are located
    for (var i = 0; i < nodeCount + leafCount; i++) {
        var groupId = 'g' + (i + 1);
        var groupToRemove = document.getElementById(groupId);
        svgEl.removeChild(groupToRemove);
    }

    // Remove all the specifically created symbols/templates related to nodes
    for (var i = 0; i < nodeCount; i++) {
        var nodeId = 'node' + (i + 1);
        var nodeToRemove = document.getElementById(nodeId);
        svgEl.removeChild(nodeToRemove);

        // There is no branch belonging to the root node
        if (i === 0) continue;
        var branchId = 'branchn' + (i + 1);
        var branchToRemove = document.getElementById(branchId);
        svgEl.removeChild(branchToRemove);
    }

    //Remove all the specifically created symbols/templates related to leaves
    for (var i = 0; i < leafCount; i++) {
        var leafId = 'leaf' + (i + 1);
        var leafToRemove = document.getElementById(leafId);
        svgEl.removeChild(leafToRemove);

        var branchId = 'branchl' + (i + 1);
        var branchToRemove = document.getElementById(branchId);
        svgEl.removeChild(branchToRemove);
    }
}

function resetPosVals(node) {
    node.x = 0;
    node.y = 0;
    node.mod = 0;

    node.children.forEach((child) => {
        resetPosVals(child);
    });
}

function calcSvgSize() {
    var svgEl = document.getElementById(svgId);
    const rect = svgEl.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    console.log('SVG Width:', width);
    console.log('SVG Height:', height);

    return [width, height];
}

function resizeViewBox() {
    var svgEl = document.getElementById(svgId);
    svgEl.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
}

function handleResize() {
    var newSizes = calcSvgSize();
    if (newSizes[0] != svgWidth || newSizes[1] != svgHeight) {
        svgWidth = newSizes[0];
        svgHeight = newSizes[1];
        resizeViewBox();

        // Rebuild the tree with the new sizes
        var svgEl = document.getElementById(svgId);
        destroyTree(svgEl);
        resetPosVals(decisionTree);
        buildSvgTree();
        goToStep();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    buildTree(false);
});
window.onresize = handleResize;

export { mostCommonLabel, entropyLabels, infoGain, findBestAttribute, id3, calcTreeDepth, calcTreeWidth, createNode, createLeaf, createBranch, buildTree, destroyTree, nodeCount, leafCount, dataTableGroups, valueTableGroups }