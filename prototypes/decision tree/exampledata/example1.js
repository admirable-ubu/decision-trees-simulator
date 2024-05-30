
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

var attributes1 = attributes;
var attributeValues1 = attributeValues;
const label1 = label;
var labelValues1 = labelValues;
const data1 = data;

export { attributes1, attributeValues1, label1, labelValues1, data1 }
export default label1;

