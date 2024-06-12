const dataInfo = {
    "Play Golf 1": "This dataset includes weather-related attributes that affect the decision of whether to play golf or not, such as outlook (sunny, overcast, rainy), temperature, humidity, and wind conditions. It's a great starting point for beginners in machine learning due to its simplicity.",
    "Play Golf 2": "This dataset includes weather-related attributes that affect the decision of whether to play golf or not, such as outlook (sunny, overcast, rainy), temperature, humidity, and wind conditions. It's a great starting point for beginners in machine learning due to its simplicity, however this version has additional rows to increase complexity.",
    "Iris": "This dataset contains a set of 150 records under 5 attributes - Sepal Length, Sepal width, Petal Length, Petal Width and its label. The dataset has been discretized to only work with two class labels - whether an Iris is an Iris Virginica or not - and categorical values, instead of numerical ones.",
    "Mushrooms": "This dataset includes descriptions of hypothetical samples corresponding to 23 species of gilled mushrooms in the Agaricus and Lepiota family. Each species is classified as edible or poisonous. The original number of instances of 8124 has been reduced to 120 to fit the application. The attribute values are abbreviations, click on the link below to see what each one stands for.",
    "Lenses": "This dataset consists of the attributes: age of the patient, prescription of the lenses, astigmatic condition, and the tear production rate. Based on these attributes' values, a patient is classified whether they should buy hard, soft, or no contact lenses. As this application only works with classes of 2 distinct values, the 'no contact lenses' class has been replaced by either 'soft' or 'hard'."
}

const dataLinks = {
    "Play Golf 1": "https://www.kaggle.com/datasets/saadabdurrazzaq/play-golf-dataset",
    "Play Golf 2": "https://www.kaggle.com/datasets/saadabdurrazzaq/play-golf-dataset",
    "Iris": "https://www.kaggle.com/datasets/arshid/iris-flower-dataset",
    "Mushrooms": "https://archive.ics.uci.edu/dataset/73/mushroom",
    "Lenses": "https://archive.ics.uci.edu/dataset/58/lenses"
}

function getDataInfo(datasetName) {
    return dataInfo[datasetName];
}

function getDataLink(datasetName) {
    return dataLinks[datasetName];
}

export {getDataInfo, getDataLink};
export default getDataInfo;