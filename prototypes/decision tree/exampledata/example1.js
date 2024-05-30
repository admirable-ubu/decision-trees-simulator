
var attributes = ['Outlook', 'Temperature', 'Humidity', 'Windy']
var attributeValues = [['Sunny', 'Overcast', 'Rainy'], ['Hot', 'Mild', 'Cool'], ['High', 'Normal'], ['False', 'True']]

const label = 'Play Golf';
var labelValues = ['Yes', 'No']

const data = [
    { attributes: { [attributes[0]]: attributeValues[0][0], [attributes[1]]: attributeValues[1][0], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][0] }, label: labelValues[1] },
    { attributes: { [attributes[0]]: attributeValues[0][0], [attributes[1]]: attributeValues[1][0], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][1] }, label: labelValues[1] },
    { attributes: { [attributes[0]]: attributeValues[0][1], [attributes[1]]: attributeValues[1][0], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][2], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][2], [attributes[1]]: attributeValues[1][2], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][2], [attributes[1]]: attributeValues[1][2], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][1] }, label: labelValues[1] },
    { attributes: { [attributes[0]]: attributeValues[0][1], [attributes[1]]: attributeValues[1][2], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][1] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][0], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][0] }, label: labelValues[1] },
    { attributes: { [attributes[0]]: attributeValues[0][0], [attributes[1]]: attributeValues[1][2], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][2], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][0], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][1] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][1], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][1] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][1], [attributes[1]]: attributeValues[1][0], [attributes[2]]: attributeValues[2][1], [attributes[3]]: attributeValues[3][0] }, label: labelValues[0] },
    { attributes: { [attributes[0]]: attributeValues[0][2], [attributes[1]]: attributeValues[1][1], [attributes[2]]: attributeValues[2][0], [attributes[3]]: attributeValues[3][1] }, label: labelValues[1] }
];

export var attributes1 = attributes;
export var attributeValues1 = attributeValues;
export const label1 = label;
export var labelValues1 = labelValues;
export const data1 = data;

