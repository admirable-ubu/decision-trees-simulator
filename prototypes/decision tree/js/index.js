// Example data
const data = [
    { attributes: { outlook: 'sunny', temperature: 'hot', humidity: 'high', windy: false }, label: 'no' },
    { attributes: { outlook: 'sunny', temperature: 'hot', humidity: 'high', windy: true }, label: 'no' },
    { attributes: { outlook: 'overcast', temperature: 'hot', humidity: 'high', windy: false }, label: 'yes' },
    { attributes: { outlook: 'rainy', temperature: 'mild', humidity: 'high', windy: false }, label: 'yes' },
    { attributes: { outlook: 'rainy', temperature: 'cool', humidity: 'normal', windy: false }, label: 'yes' },
    { attributes: { outlook: 'rainy', temperature: 'cool', humidity: 'normal', windy: true }, label: 'no' },
    { attributes: { outlook: 'overcast', temperature: 'cool', humidity: 'normal', windy: true }, label: 'yes' },
    { attributes: { outlook: 'sunny', temperature: 'mild', humidity: 'high', windy: false }, label: 'no' },
    { attributes: { outlook: 'sunny', temperature: 'cool', humidity: 'normal', windy: false }, label: 'yes' },
    { attributes: { outlook: 'rainy', temperature: 'mild', humidity: 'normal', windy: false }, label: 'yes' },
    { attributes: { outlook: 'sunny', temperature: 'mild', humidity: 'normal', windy: true }, label: 'yes' },
    { attributes: { outlook: 'overcast', temperature: 'mild', humidity: 'high', windy: true }, label: 'yes' },
    { attributes: { outlook: 'overcast', temperature: 'hot', humidity: 'normal', windy: false }, label: 'yes' },
    { attributes: { outlook: 'rainy', temperature: 'mild', humidity: 'high', windy: true }, label: 'no' }
];

const attributes = ['outlook', 'temperature', 'humidity', 'windy'];

class TreeNode{
    constructor(attribute, label, isLeaf = false){
        this.attribute = attribute;
        this.label = label;
        this.children = [];
        this.isLeaf = isLeaf;
    }
}



function mostCommonLabel(data){
    var labels = [];
    data.forEach(function (row){
        labels.push(row.label);
    });

    var counts = {};
    for (const label of labels){
        counts[label] = counts[label]? counts[label] + 1 : 1;
    }

    var max = 0;
    var maxLabel = null;
    for (const label in counts){
        if (counts[label] > max){
            max = counts[label];
            maxLabel = label;
        }
    }

    return maxLabel;
}

function entropy(valueLabels){
    var sum = valueLabels.length;
    var labels = [];
    valueLabels.forEach(function (row){
        labels.push(row[1]);
    });

    // Count the occurrence of each label value
    var counts = {};
    for (const label of labels){
        counts[label] = counts[label]? counts[label] + 1 : 1;
    }

    // Calculate probabilities
    var pValues = [];
    for (const labelCount of Object.values(counts)) {
        pValues.push(labelCount / sum);
    }

    // Calculate the entropy
    var entropy = 0;
    for (const pValue of pValues) {
        entropy -= pValue * Math.log2(pValue);
    }
    if (isNaN(entropy)) {
        entropy = 0;
    }
    return entropy;
}

function infoGain(data, attribute){
    // Save the labels for each of the attribute's instances in an array
    var attributeLabels = [];
    data.forEach(function(row){
        attributeLabels.push([row.attributes[attribute], row.label]);
    });

    // Caclulate entropy for the whole attribute
    var e = entropy(attributeLabels);

    // Save the attribute values in a set
    var attributeValues = new Set(data.map(instance => instance.attributes[attribute]));

    // Count the number of instances for each value
    var attributeValuesCounts = (data.map(instance => instance.attributes[attribute]));
    var counts = {};
    attributeValuesCounts.forEach(function (row){
        counts[row] = counts[row]? counts[row] + 1 : 1;
    });

    // Calculate the entropy for each value
    var entropies = [];
    for (const value of attributeValues) {
        var subset = attributeLabels.filter(instance => instance[0] === value);
        entropies.push([entropy(subset), counts[value], value]);
    }

    // Calculate the information gain
    var infoGain = e;
    for (const entropy of entropies) {
        infoGain -= entropy[0] * (entropy[1] / data.length);
    }
    return infoGain;
}


function findBestAttribute(data, attributes){
    var bestAttribute = null;
    var maxGain = 0;
    attributes.forEach(function(attribute){
        var gain = infoGain(data, attribute);
        if (gain > maxGain){
            maxGain = gain;
            bestAttribute = attribute;
        }
    });
    return bestAttribute;
}

function id3(data, attributes){
    if (data.length === 0) return null;
    var allPositive = true;
    var allNegative = true;
    for (const row of data){
        if (row.label == 'no'){
            allPositive = false;
        }
        if (row.label == 'yes'){
            allNegative = false;
        }
    }

    // Check if we have reached a leaf node
    if (allPositive){
        return new TreeNode(null, 'yes', true);
    }
    if (allNegative){
        return new TreeNode(null, 'no', true);
    }
    if (attributes.length === 0){
        return new TreeNode(null, mostCommonLabel(data), true);
    }

    // Find the current best attribute to split the data on
    var bestAttribute = findBestAttribute(data, attributes);
    var tree = new TreeNode(bestAttribute, null);
    
    // Split the data on the best attribute
    var attributeValues = new Set(data.map(instance => instance.attributes[bestAttribute]));
    
    // Do a recursive call for each value of the selected attribute or add a leaf node if the value's subset is empty
    for (const value of attributeValues){
        var subset = data.filter(instance => instance.attributes[bestAttribute] === value);
        var remainingAttributes = attributes.filter(attribute => attribute!== bestAttribute);

        if(subset.length === 0){
            tree.children.push([value, new TreeNode(null, mostCommonLabel(subset), true)]);
        } else{
            tree.children.push([value, id3(subset, remainingAttributes)]);
        }
    }
    return tree;
}

function hideChildren(element){
    var node = element.querySelector('ellipse');
    var nodeId = node.id;

    var connectedPaths = document.querySelectorAll('path[data-connected-to="' + nodeId + '"]');
    if (connectedPaths.length !== 0 && connectedPaths[0].parentNode.style.display == "none"){
        showConnectedNodes(nodeId);
    } else{
        hideConnectedNodes(nodeId);
    }
}

function hideConnectedNodes(nodeId){
    var connectedPaths = document.querySelectorAll('path[data-connected-to="' + nodeId + '"]');
    if (connectedPaths.length === 0) return;

    for (const path of connectedPaths){
        var pathGroup = path.parentNode;
        pathGroup.style.display = "none";

        var pathIdNum = +path.id[1];
        var connectedNodeId = "n" + pathIdNum;

        hideConnectedNodes(connectedNodeId);
    }
}

function showConnectedNodes(nodeId){
    var connectedPaths = document.querySelectorAll('path[data-connected-to="' + nodeId + '"]');
    if (connectedPaths.length === 0) return;

    for (const path of connectedPaths){
        var pathGroup = path.parentNode;
        pathGroup.style.display = "block";

        var pathIdNum = +path.id[1];
        var connectedNodeId = "n" + pathIdNum;

        showConnectedNodes(connectedNodeId);
    }
}

var decisionTree = id3(data, attributes);
console.log(decisionTree);
