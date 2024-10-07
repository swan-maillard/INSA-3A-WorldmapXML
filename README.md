# XML World Map Visualization

## Description

This project is a **web-based visualization tool** that uses **XML** and **XSLT**, and **API Data** to display an interactive world map. 
The map provides real-time information about countries, such as their currency, capital, languages, and current temperature. 
The visualization includes additional interactive features, allowing users to search for countries, hover over them for detailed information, and display temperature gradients across the globe.

## Features

- **Interactive World Map**: Explore and interact with countries by hovering over or selecting them from a list.
- **Country Information**: Displays detailed information about each country, including:
  - Capital
  - Languages
  - Currency
  - Current maximum temperature (fetched via Open-Meteo API).
- **Temperature Visualization**: Option to color the map based on real-time temperature data.
- **Country Search**: Dropdown menu to quickly search and focus on a country by its code.
- **Mini-Game**: The aim is to find the location of a country knowing its name.
- **Color Mode**: Toggle between dark and blue background modes.

## Technologies Used

- **XML/XSLT**: Core data for countries and transformations into HTML content.
- **JavaScript**: Handles user interactions, updates tooltips, and fetches real-time data from external APIs.
- **REST API**: Provides additional country data such as real-time temperature, currency and languages.
- **SVG Map**: An SVG file is used to render the world map, allowing for scalable and interactive elements.

## Access the website

This project is hosted on **GitHub Pages** at [this adress](https://swan-maillard.github.io/INSA-3A-WorldmapXML/). 

## API References

- **[REST Countries API](https://restcountries.com/)**: Used to fetch country details such as currency and language.
- **[Open-Meteo API](https://open-meteo.com/)**: Used to fetch real-time temperature data for each country.

## Authors

- Swan Maillard (maillard.swan@gmail.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
