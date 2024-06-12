import { goToStep } from './stepbystep.js';
import { entropy } from '../../lib/entropy-calculator.js';

const STD_LEAFHEIGHT = 133;
const STD_NODEHEIGHT = 92;
const STD_NODEWIDTH = 82;

const STD_NODE_NR_X_POS = 12;
const STD_NODE_NR_WIDTH = 53;
const STD_NODE_FONTSIZE = 16;
const MAX_NODE_TEXTWIDTH = STD_NODEWIDTH - 10;

const STD_LEAF_NR_X_POS = 17;
const STD_LEAF_NR_WIDTH = 41;

const STD_BRANCH_FONTSIZE = 12;
const STD_BRANCH_STROKE_WIDTH = 1;
const STD_BRANCH_DY = -0.7;
const MAX_BRANCH_TEXT_PATH_RATIO = 0.9;

// To retrieve locally stored csv data
const csvA = 'csvAttributes';
const csvAV = 'csvAttributeValues';
const csvL = 'csvLabel';
const csvLV = 'csvLabelValues';
const csvD = 'csvDataRows';

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


/**
 * Finds the most common label in a dataset
 * @param {*} data The dataset
 * @returns The most common label
 */
function mostCommonLabel(data) {
    let labels = [];
    data.forEach(function (row) {
        labels.push(row.label);
    });

    let counts = {};
    for (let i = 0; i < labels.length; i++) {
        counts[labels[i]] = counts[labels[i]] ? counts[labels[i]] + 1 : 1;
    }

    let max = 0;
    let maxLabel = null;
    for (let i = 0; i < labels.length; i++) {
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
    let counts = {};
    for (const label of labels) {
        counts[label] = counts[label] ? counts[label] + 1 : 1;
    }
    return counts;
}


/**
 * Calculates the entropy for a set of label values
 * @param {*} labels Array of label values
 * @returns The entropy of the array of label values
 */
function entropyLabels(labels) {
    // Count the occurrence of each label value
    let counts = countLabels(labels);

    // Calculate probabilities
    let sum = labels.length;
    let pValues = [];
    for (const labelCount of Object.values(counts)) {
        pValues.push(labelCount / sum);
    }

    // Calculate the entropy
    let e = entropy(pValues);
    return e;
}

/**
 * Calculates the information gain for an attribute
 * @param {*} data The dataset
 * @param {*} attribute The attribute
 * @param {*} valTableGroup To store relevant values for the later created value table
 * @returns The information gain of the attribute
 */
function infoGain(data, attribute, valTableGroup) {
    // Save the calculated values for each attribute for the value table
    let valTabAttribute = {};
    let valTabAttributeVals = [];
    // Save subset label counts for the value table
    let valTabSubsetCounts = [];

    // Save the labels for each of the attribute's instances in an array
    let attributeIndex = attributes.indexOf(attribute);
    let attributeLabels = [];
    data.forEach(function (row) {
        attributeLabels.push([Object.values(row.attributes)[attributeIndex], row.label]);
    });

    // Save only the labels to calculate this attribute's entropy
    let labels = [];
    attributeLabels.forEach(function (row) {
        labels.push(row[1]);
    });

    // Caclulate entropy for the whole attribute
    let e = entropyLabels(labels);

    // Save the attribute values in a set
    let currentAttributeValues = new Set(data.map(instance => Object.values(instance.attributes)[attributeIndex]));

    // Count the number of instances for each value
    let attributeValuesCounts = (data.map(instance => Object.values(instance.attributes)[attributeIndex]));

    let counts = {};
    attributeValuesCounts.forEach(function (row) {
        counts[row] = counts[row] ? counts[row] + 1 : 1;
    });

    // Calculate the entropy for each value
    let entropies = [];
    for (const value of currentAttributeValues) {
        let subset = attributeLabels.filter(instance => instance[0] === value);
        // Save only the labels to calculate this attribute's entropy
        let subsetLabels = [];
        subset.forEach(function (row) {
            subsetLabels.push(row[1]);
        });

        // Transform counts object into array of label counts for the value table
        let subsetLabelsCount = countLabels(subsetLabels);
        let subLabCountKeys = Object.keys(subsetLabelsCount);
        let subLabCountVals = Object.values(subsetLabelsCount);
        let valTabCounts = [];
        for (let i = 0; i < labelValues.length; i++) {
            if (subLabCountKeys.includes(labelValues[i])) {
                let index = subLabCountKeys.indexOf(labelValues[i]);
                valTabCounts.push(subLabCountVals[index]);
            } else {
                valTabCounts.push(0);
            }
        }
        valTabSubsetCounts.push(valTabCounts);

        entropies.push([entropyLabels(subsetLabels), counts[value] / data.length, value]);
    }

    // Calculate the conditional entropy
    let condEntropy = 0;
    for (const entropy of entropies) {
        condEntropy += entropy[0] * entropy[1];
    }

    // Calculate the information gain
    let infoGain = e - condEntropy;

    // Save the values for each subset
    for (let i = 0; i < currentAttributeValues.size; i++) {
        let subsetValues = [];
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


/**
 * Finds the best attribute of a dataset
 * @param {*} data The dataset
 * @param {*} attributes The dataset's attributes
 * @param {*} valTableGroup To store relevant values for the later created value table
 * @returns The best attribute of the given dataset
 */
function findBestAttribute(data, attributes, valTableGroup) {
    let bestAttribute = null;
    let maxGain = 0;
    attributes.forEach(function (attribute) {
        let gain = infoGain(data, attribute, valTableGroup);
        if (gain > maxGain) {
            maxGain = gain;
            bestAttribute = attribute;
        }
    });
    return bestAttribute;
}

/**
 * The ID3 algorithm that creates a decision tree structure
 * @param {*} data the dataset of the current node
 * @param {*} attributes the considered attributes
 * @param {*} prevBranchVal the label of the branch path for which the current node serves as the destination node
 * @param {*} nodeId the current node id
 * @param {*} leafId the current leaf id
 * @returns The tree, node id, and leaf id (for correct initialization through the recursion calls)
 */
function id3(data, attributes, prevBranchVal, nodeId, leafId) {
    if (data.length === 0) return null;
    let allPositive = true;
    let allNegative = true;
    let class1 = 0;
    let class2 = 0;
    let n = data.length;

    // Save the labels in an array
    let datasetLabels = [];
    data.forEach(function (row) {
        datasetLabels.push(row.label);
    });

    // Caclulate entropy for the dataset
    let e = entropyLabels(datasetLabels).toFixed(2);

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
    let valTableGroup = [];

    // Check if we have reached a leaf node
    if (allPositive) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        let nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, labelValues[0], prevBranchVal), nodeId, nextLeafId];
    }
    if (allNegative) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        let nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, labelValues[1], prevBranchVal), nodeId, nextLeafId];
    }
    if (attributes.length === 0) {
        valTableGroup = [class1, class2];
        valueTableGroups.push(valTableGroup);

        let nextLeafId = leafId[0] + (+leafId.substring(1) + 1);
        return [new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(data), prevBranchVal), nodeId, nextLeafId];
    }

    // Find the current best attribute to split the data on
    let bestAttribute = findBestAttribute(data, attributes, valTableGroup);
    let tree = new TreeNode(nodeId, bestAttribute, new NodeValues(class1, class2, n, e), false, null, null);
    valueTableGroups.push(valTableGroup);

    // Split the data on the best attribute
    let bestAttributeValues = new Set(data.map(instance => instance.attributes[bestAttribute]));

    nodeId = nodeId[0] + (+nodeId.substring(1) + 1);

    // Do a recursive call for each value of the selected attribute or add a leaf node if the value's subset is empty
    for (const value of bestAttributeValues) {
        let subset = data.filter(instance => instance.attributes[bestAttribute] === value);

        dataTableGroups.push([subset]);

        let remainingAttributes = attributes.filter(attribute => attribute !== bestAttribute);

        if (subset.length === 0) {
            valTableGroup = [class1, class2];
            valueTableGroups.push(valTableGroup);

            tree.children.push(new TreeNode(leafId, null, new NodeValues(class1, class2, n, e), true, mostCommonLabel(data), prevBranchVal));
        } else {
            tree.prevBranchVal = prevBranchVal;
            let returnVals = id3(subset, remainingAttributes, value, nodeId, leafId);
            tree.children.push(returnVals[0]);
            nodeId = returnVals[1];
            leafId = returnVals[2];
        }
    }
    return [tree, nodeId, leafId];
}

/**
 * Assigns parents to each node of a tree structure
 * @param {*} node The current node
 * @param {*} parent The parent of the current node
 * @returns Returns if the current node is null
 */
function assignParents(node, parent = null) {
    if (!node) return;

    // Assign parent reference
    node.parent = parent;

    // Recursively assign parents for children
    for (let child of node.children) {
        assignParents(child, node);
    }
}

/**
 * Create new use element to display the node or branch path
 * @returns The use element
 */
function createNewUse(id, href, x, y, width, height) {
    // Create a new 'use' element and set the node's position attributes
    let newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', id);
    newUse.setAttribute('href', href);
    newUse.setAttribute('x', x);
    newUse.setAttribute('y', y);
    newUse.setAttribute('width', width);
    newUse.setAttribute('height', height);

    return newUse
}

/**
 * Get the width that a text occupies in an SVG node
 * @param {*} svgEl The SVG element in which the tree is displayed
 * @param {*} textToDisplay The text displayed in a node
 * @returns The width of the displayed text inside the node
 */
function getNodeTextWidth(svgEl, textToDisplay) {
    // Create temporary text element
    let textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("x", 0);
    textEl.setAttribute("y", 0);
    textEl.setAttribute("font-size", STD_NODE_FONTSIZE);
    textEl.textContent = textToDisplay;

    // Append the text element to the SVG
    svgEl.appendChild(textEl);

    // Get the bounding box and width of the text element
    let bbox = textEl.getBBox();

    // Remove temporary text element again and return width
    svgEl.removeChild(textEl);
    return bbox.width;
}

/**
 * Checks whether a given text is too wide to be displayed in a node
 * @param {*} svgEl The SVG element in which the tree is displayed
 * @param {*} textToDisplay The text that displayed in a node
 * @returns Ratio between the maximum text width and the actual text width
 */
function checkNodeTextTooWide(svgEl, textEl) {
    // Get text width
    let textWidth = getNodeTextWidth(svgEl, textEl.textContent);

    // Check if the text width is wider than the maximum acceptable text width, reduce font size if yes
    let ratio = MAX_NODE_TEXTWIDTH / textWidth;
    if (ratio < 1) {
        textEl.setAttribute('font-size', STD_NODE_FONTSIZE * ratio);
    }
}

/**
 * Creates a new SVG symbol/template and use element that displays it based on the given node values
 * @param {*} nodeId The node id
 * @param {*} n The number of instances in the subset represented by this node
 * @param {*} e The entropy of the subset represented by this node
 * @param {*} attribute The attribute that this node represents / the best attribute of the subset that this node represents
 * @param {*} x The x coordinate of this node
 * @param {*} y The y coordinate of this node
 * @param {*} width The width of this node
 * @param {*} height The height of this node
 * @returns The use element that displays the created SVG symbol
 */
function createNode(nodeId, n, e, attribute, x, y, width, height) {
    let svgEl = document.getElementById(svgId);
    let nodeTemplate = document.getElementById('node');
    let nodeNumber = nodeId.substring(1);

    // Clone the template
    let clonedTemplate = nodeTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'node' + nodeNumber);

    // Update text contents and check for each if the text is too wide, reduce the font size if yes
    // For the node number text, check if it is still placed in the middle
    clonedTemplate.querySelector('#nodeNr').textContent += nodeNumber;
    let widthNodeNr = getNodeTextWidth(svgEl, clonedTemplate.querySelector('#nodeNr').textContent);
    if (widthNodeNr > STD_NODE_NR_WIDTH) {
        clonedTemplate.querySelector('#nodeNr').setAttribute('x', STD_NODE_NR_X_POS - ((widthNodeNr - STD_NODE_NR_WIDTH) / 2));
    }
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#nodeNr'));

    clonedTemplate.querySelector('#nodeN').textContent += n;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#nodeN'));

    // Entropy can never be too wide (only values between 0 and 1 with a fixed 2 decimal points are displayed)
    clonedTemplate.querySelector('#nodeE').textContent += e;

    clonedTemplate.querySelector('#nodeAttribute').textContent = attribute;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#nodeAttribute'));

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useNode' + nodeNumber, '#node' + nodeNumber, x, y, width, height);
}

/**
 * Creates a new SVG symbol/template and use element that displays it based on the given node values
 * @param {*} leafId The leaf id
 * @param {*} n The number of instances in the subset represented by this leaf
 * @param {*} class1 The number of instances in this subset belonging to class 1
 * @param {*} class2 The number of instances in this subset belonging to class 2
 * @param {*} e The entropy of the subset represented by this leaf
 * @param {*} label The label value that this leaf represents based on the given subset
 * @param {*} x The x coordinate of this node
 * @param {*} y The y coordinate of this node
 * @param {*} width The width of this node
 * @param {*} height The height of this node
 * @returns The use element that displays the created SVG symbol
 */
function createLeaf(leafId, n, class1, class2, e, label, x, y, width, height) {
    let svgEl = document.getElementById(svgId);
    let leafTemplate = document.getElementById('leaf');
    let leafNumber = leafId.substring(1);

    // Clone the template
    let clonedTemplate = leafTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'leaf' + leafNumber);

    // Update text contents and check for each if the text is too wide, reduce the font size if yes
    clonedTemplate.querySelector('#leafNr').textContent += leafNumber;
    let widthLeafNr = getNodeTextWidth(svgEl, clonedTemplate.querySelector('#leafNr').textContent);
    if (widthLeafNr > STD_LEAF_NR_WIDTH) {
        clonedTemplate.querySelector('#leafNr').setAttribute('x', STD_LEAF_NR_X_POS - ((widthLeafNr - STD_LEAF_NR_WIDTH) / 2));
    }
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#leafNr'));

    clonedTemplate.querySelector('#leafN').textContent += n;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#leafN'));

    clonedTemplate.querySelector('#leafYes').textContent = labelValues[0] + ' = ' + class1;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#leafYes'));

    clonedTemplate.querySelector('#leafNo').textContent = labelValues[1] + ' = ' + class2;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#leafNo'));

    // Entropy can never be too wide (only values between 0 and 1 with a fixed 2 decimal points are displayed)
    clonedTemplate.querySelector('#leafE').textContent += e;

    clonedTemplate.querySelector('#leafLabel').textContent = label;
    checkNodeTextTooWide(svgEl, clonedTemplate.querySelector('#leafLabel'));

    // Append cloned template to the svg and return the use element
    svgEl.appendChild(clonedTemplate);
    return createNewUse('useLeaf' + leafNumber, '#leaf' + leafNumber, x, y, width, height);
}

/**
 * Checks whether a given text is too wide to be displayed alongside a branch
 * @param {*} svgEl The SVG element in which the tree is displayed
 * @param {*} path The path element along which the text is displayed
 * @param {*} textToDisplay The text that is displayed alongside the branch
 * @param {*} fontSize The font size of the text
 * @param {*} textSpanEl The textSpan element that contains the text and sets the font size
 */
function checkBranchTextTooWide(svgEl, path, textToDisplay, fontSize, textSpanEl) {
    // Create a temporary SVG text element to measure text length
    let textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("font-size", fontSize);

    textEl.textContent = textToDisplay;
    svgEl.appendChild(textEl);

    // Get the bounding box and width of the text element and the path length
    let bbox = textEl.getBBox();
    let textWidth = bbox.width;
    let pathLength = path.getTotalLength();

    let textPathratio = textWidth / pathLength;

    if (textPathratio > MAX_BRANCH_TEXT_PATH_RATIO) {
        let newFontSizeRatio = MAX_BRANCH_TEXT_PATH_RATIO / textPathratio;
        textSpanEl.setAttribute('font-size', fontSize * newFontSizeRatio);
    }

    // Remove temporary text element again
    svgEl.removeChild(textEl);
}

/**
 * Creates a new SVG symbol/template and use element that displays it based on the given branch values
 * @param {*} nodeId The id of the node the branch points to
 * @param {*} x1 The branch's x1 value
 * @param {*} y1 The branch's y1 value
 * @param {*} x2 The branch's x2 value
 * @param {*} y2 The branch's y2 value
 * @param {*} value The branch's text
 * @param {*} sizeRatio The nodes' size ratio that is relative to the svg's width and height; used to scale the branch
 * @returns The use element that displays the created SVG symbol
 */
function createBranch(nodeId, x1, y1, x2, y2, value, sizeRatio) {
    const svgEl = document.getElementById(svgId);
    let branchTemplate = document.getElementById('branch');

    // Clone the template
    let clonedTemplate = branchTemplate.cloneNode(true);
    clonedTemplate.setAttribute('id', 'branch' + nodeId);

    const templateBranchPathId = 'branchPath';
    const templateBranchTPid = 'branchTP';
    const templateBranchValueId = 'branchValue';

    // Update position attributes and ids
    let positionAttribute = '';
    if (x2 < x1) {
        positionAttribute = 'M' + x2 + ' ' + y2 + ' ' + x1 + ' ' + y1;
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-end', '');
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-start', 'url(#arrowMarkerReverse)');
    } else {
        positionAttribute = 'M' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2;
        clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('marker-end', 'url(#arrowMarker)');
    }
    clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('d', positionAttribute);
    clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('stroke-width', sizeRatio * STD_BRANCH_STROKE_WIDTH);

    clonedTemplate.querySelector('#' + templateBranchValueId).textContent = value;
    let textSizeRatio = (y2 - y1) / 100;
    let fontSize = textSizeRatio * STD_BRANCH_FONTSIZE;
    clonedTemplate.querySelector('#' + templateBranchValueId).setAttribute('font-size', fontSize);
    clonedTemplate.querySelector('#' + templateBranchValueId).setAttribute('dy', sizeRatio * STD_BRANCH_DY + '%');
    clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('startOffset', '50%');

    // Check if the branch text is too wide to fit the branch
    checkBranchTextTooWide(svgEl, clonedTemplate.querySelector('#' + templateBranchPathId), clonedTemplate.querySelector('#' + templateBranchValueId).textContent, fontSize, clonedTemplate.querySelector('#' + templateBranchValueId))

    clonedTemplate.querySelector('#' + templateBranchPathId).setAttribute('id', templateBranchPathId + nodeId);
    clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('href', '#' + templateBranchPathId + nodeId);
    clonedTemplate.querySelector('#' + templateBranchTPid).setAttribute('id', templateBranchTPid + nodeId);
    clonedTemplate.querySelector('#' + templateBranchValueId).setAttribute('id', templateBranchValueId + nodeId);

    // Create a new 'use' element
    let newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newUse.setAttribute('id', 'useBranch' + nodeId);
    newUse.setAttribute('href', '#branch' + nodeId);

    // Append cloned template and use element to the svg
    svgEl.appendChild(clonedTemplate);
    return newUse;
}

/**
 * Creates the nodes and adds them to groups
 */
function createNodes(node, nodeIndex, svgEl, groupId, nodeWidth, nodeHeight, leafHeight, sizeRatio) {
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute("id", groupId);

    let useNode = null;
    // No branch going into the root node
    if (node.depth === 0) {
        useNode = createNode(node.id, node.nodeValues.n, node.nodeValues.entropy, node.attribute, node.x, node.y, nodeWidth, nodeHeight);
        group.appendChild(useNode);
        svgEl.appendChild(group);

    } else {
        let nodeSplitByChildren = nodeWidth / node.parent.children.length;
        let x1Value = node.parent.x + (nodeSplitByChildren - (nodeSplitByChildren / 2) + (nodeIndex * nodeSplitByChildren));
        let useBranch = createBranch(node.id, x1Value, (node.parent.y + nodeHeight) - 1, node.x + (nodeWidth / 2), node.y - 1, node.prevBranchVal, sizeRatio)

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

    for (let i = 0; i < node.children.length; i++) {
        groupId = createNodes(node.children[i], i, svgEl, 'g' + (+groupId.substring(1) + 1), nodeWidth, nodeHeight, leafHeight, sizeRatio);
    }

    return groupId;
}

/**
 * Calculate the amount of nodes on each level in a tree structure
 * @param {*} root The root node of a tree structure
 * @returns The levels with each one containing the amount of nodes that is in it
 */
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function calcInitialX(node, nodeIndex, columnWidth, currentLevel = 0) {
    for (let i = 0; i < node.children.length; i++) {
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
        let middle = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function checkForConflicts(node, columnWidth, currentLevel, nodeIndex) {
    // Nodes should at least be one column width apart from each other
    let minDistance = columnWidth;
    let shift = 0;

    let leftEdges = calcLeftEdges(node, 0, currentLevel);

    let siblingIndex = 0;
    let currentSibling = node.parent.children[siblingIndex];
    // Go through all siblings that are left of the node
    while (currentSibling != null && currentSibling != node) {
        let rightEdges = calcRightEdges(currentSibling, 0, currentLevel);

        let leftEdgesKeys = Object.keys(leftEdges).map(Number);
        let maxLeftEdgesKey = leftEdgesKeys.reduce((a, b) => Math.max(a, b), -Infinity);

        let rightEdgesKeys = Object.keys(rightEdges).map(Number);
        let maxRightEdgesKey = rightEdgesKeys.reduce((a, b) => Math.max(a, b), -Infinity);

        // Go through all subtrees that are left and right of the node
        for (let level = currentLevel + 1; level <= Math.min(maxRightEdgesKey, maxLeftEdgesKey); level++) {
            let dist = leftEdges[level] - rightEdges[level];
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function centerNodesBetween(leftNode, rightNode, leftIndex, rightIndex) {
    let numNodesBetween = (rightIndex - leftIndex) - 1;

    if (numNodesBetween > 0) {
        let distanceBetweenNodes = (leftNode.x - rightNode.x) / (numNodesBetween + 1);

        let count = 1;
        for (let i = leftIndex + 1; i < rightIndex; i++) {
            let middleNode = leftNode.parent.children[i];

            let desiredX = rightNode.x + (distanceBetweenNodes * count);
            let offset = desiredX - middleNode.x;
            middleNode.x += offset;
            middleNode.mod += offset;

            count++;
        }
    }

}

/**
 * Calculates the left edges of a node and its children
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
 */
function checkInBounds(node) {
    let leftEdges = calcLeftEdges(node, 0, 0);

    let rightShift = 0;
    for (let level in Object.keys(leftEdges)) {
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
 * Inspired by the code provided by Rachel Lim at {@link https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/}
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

/**
 * Centers the tree in the SVG if there are still space left on the right side
 */
function centerTree(node, nodeWidth) {
    let rightEdges = calcRightEdges(node, 0, 0);
    let rightEdgesVals = Object.values(rightEdges).map(Number);
    let maxRightEdgesVal = rightEdgesVals.reduce((a, b) => Math.max(a, b), -Infinity);

    let freeSpace = (svgWidth - maxRightEdgesVal) - nodeWidth;

    if (freeSpace > 0) {
        node.x += freeSpace / 2;
        node.mod += freeSpace / 2;
    }
}

/**
 * Calculates the positions of each node in a given tree structure
 * Own implementation of the Reingold-Tilford algorithm
 */
function calcPositions(root, nodeWidth, leafHeight, columnWidth) {
    let queue = [root];

    // Assign depth to each node and reset their positional values (in case the SVG tree is being rebuilt)
    while (queue.length > 0) {
        const node = queue.shift();
        node.children.forEach(child => {
            child.depth = node.depth + 1;
            queue.push(child);
        });
    }

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
        let reachedRoot = false;
        let attributesToMark = [];
        let currentNode = node.parent;

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
    for (let i = 1; i < nodeCount + leafCount; i++) {
        let markedRows = [];
        dataTableGroups[i - 1][0].forEach(function (selectedRow) {
            data.forEach(function (row, j) {
                if (selectedRow == row) {
                    markedRows.push(j);
                }
            });
        });
        dataTableGroups[i - 1][0] = markedRows;

        let markedCols = [];
        dataTableGroups[i - 1][1].forEach(function (attribute) {
            markedCols.push(attributes.indexOf(attribute));
        });
        dataTableGroups[i - 1][1] = markedCols;
    }
}

/**
 * Builds the SVG tree
 */
function buildSvgTree() {
    // Get array that holds the amount of nodes in each level/row
    let levels = countNodesAtEachLevel(decisionTree);

    // A row is a row of (leaf) nodes or branches 
    let rows = levels.length + (levels.length - 1);
    let rowHeight = svgHeight / rows;
    let heightRatio = rowHeight / STD_LEAFHEIGHT;

    let maxColumns = levels.reduce((a, b) => Math.max(a, b), -Infinity);

    let columnWidth = (svgWidth / (maxColumns));
    // Nodes need to be a bit smaller than a column so there is space between them
    let nodeWidth = (svgWidth / (maxColumns + maxColumns * 0.3));
    let columnNodeWidthRatio = columnWidth / nodeWidth;
    let widthRatio = nodeWidth / STD_NODEWIDTH;

    // Choose the smaller ratio so the nodes don't go out ouf bounds
    let sizeRatio = Math.min(widthRatio, heightRatio);
    // Make sure the nodes won't be too big if it's just a small tree
    sizeRatio = Math.min(sizeRatio, 1);

    // Calculate leaf and node height with the size ratio
    let leafHeight = STD_LEAFHEIGHT * sizeRatio;
    let nodeHeight = STD_NODEHEIGHT * sizeRatio;

    // Both leaf and decision nodes have the same width
    let actualNodeWidth = STD_NODEWIDTH * sizeRatio;
    // The column width is a little bigger so there will be space between the nodes
    let actualColumnWidth = actualNodeWidth * columnNodeWidthRatio;

    calcPositions(decisionTree, actualNodeWidth, leafHeight, actualColumnWidth);

    let svgEl = document.getElementById(svgId);
    createNodes(decisionTree, 0, svgEl, "g1", actualNodeWidth, nodeHeight, leafHeight, sizeRatio);
}

/**
 * Builds the tree structure and the SVG tree
 */
function buildTree() {
    let dataCsv = JSON.parse(sessionStorage.getItem('csvData'));
    data = dataCsv[csvD];
    attributes = dataCsv[csvA];
    attributeValues = dataCsv[csvAV];
    label = dataCsv[csvL];
    labelValues = dataCsv[csvLV];

    dataTableGroups = [];
    valueTableGroups = [];

    let treeValues = id3(data, attributes, null, "n1", "l1");
    decisionTree = treeValues[0];
    nodeCount = +treeValues[1].substring(1) - 1;
    leafCount = +treeValues[2].substring(1) - 1;

    // Assign parent to each child node
    assignParents(decisionTree);

    // Prepare data table groups for the step-by-step visualization
    dataTableGroupsAddColumns(decisionTree);
    transformDataTableGroups();

    // Get SVG sizes
    let svgSizes = calcSvgSize();
    svgWidth = svgSizes[0];
    svgHeight = svgSizes[1];
    resizeViewBox();

    // Build the SVG tree
    buildSvgTree();
}

/**
 * Destroy the SVG tree for when a new dataset is loaded
 */
function destroyTree(svgEl) {
    // Remove all the groups in which the use elements are located
    for (let i = 0; i < nodeCount + leafCount; i++) {
        let groupId = 'g' + (i + 1);
        let groupToRemove = document.getElementById(groupId);
        if (groupToRemove != null) {
            svgEl.removeChild(groupToRemove);
        }
    }

    // Remove all the specifically created symbols/templates related to nodes
    for (let i = 0; i < nodeCount; i++) {
        let nodeId = 'node' + (i + 1);
        let nodeToRemove = document.getElementById(nodeId);
        if (nodeToRemove != null) {
            svgEl.removeChild(nodeToRemove);
        }

        // There is no branch belonging to the root node
        if (i === 0) continue;
        let branchId = 'branchn' + (i + 1);
        let branchToRemove = document.getElementById(branchId);
        if (branchToRemove != null) {
            svgEl.removeChild(branchToRemove);
        }
    }

    //Remove all the specifically created symbols/templates related to leaves
    for (let i = 0; i < leafCount; i++) {
        let leafId = 'leaf' + (i + 1);
        let leafToRemove = document.getElementById(leafId);
        if (leafToRemove != null) {
            svgEl.removeChild(leafToRemove);
        }

        let branchId = 'branchl' + (i + 1);
        let branchToRemove = document.getElementById(branchId);
        if (branchToRemove != null) {
            svgEl.removeChild(branchToRemove);
        }
    }
}

/**
 * Reset each node's positional values for when a new dataset is loaded
 */
function resetPosVals(node) {
    node.x = 0;
    node.y = 0;
    node.mod = 0;

    node.children.forEach((child) => {
        resetPosVals(child);
    });
}

/**
 * Calculates the SVG container's size
 * @returns Width and height of the SVG container
 */
function calcSvgSize() {
    let svgEl = document.getElementById(svgId);
    const rect = svgEl.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    return [width, height];
}

/**
 * Resize the SVG viewbox for when the browser window is resized
 */
function resizeViewBox() {
    let svgEl = document.getElementById(svgId);
    svgEl.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
}

/**
 * Handle a resize of the browser window
 */
function handleResize() {
    let newSizes = calcSvgSize();
    if (newSizes[0] != svgWidth || newSizes[1] != svgHeight) {
        svgWidth = newSizes[0];
        svgHeight = newSizes[1];
        resizeViewBox();

        // Rebuild the tree with the new sizes
        let svgEl = document.getElementById(svgId);
        destroyTree(svgEl);
        resetPosVals(decisionTree);
        buildSvgTree();
        goToStep();
    }
}
window.onresize = handleResize;

export { mostCommonLabel, entropyLabels, infoGain, findBestAttribute, id3, createNode, createLeaf, createBranch, buildTree, destroyTree, nodeCount, leafCount, dataTableGroups, valueTableGroups }
export default buildTree;