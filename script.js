class Page {
    static blueMode;        // True si le mode bleu est activ�
    static mouse;           // Contient les coordonn�es de la souris
    static tooltip;         // Objet qui contient le DOM de l'infobulle et s'il est affich�
    static countriesCodes;  // N�uds XML des codes cca2 des pays (il faut faire innerHTML pour r�cup�rer la valeur)

    // Initialise la page
    static init() {
        Page.blueMode = false;
        Page.mouse = {
            x: 0,
            y: 0
        };
        Page.tooltip = {
            element: document.getElementById("tooltip"),
            displayed: false
        };
        Page.countriesCodes = XML.countriesXML.getElementsByTagName("cca2");
        Page.generateCountrySelect();

        Map.init();

        // On attend un peu pour laisser le temps � la page de chargement de se charger
        // initCountriesData() prend beaucoup de temps
        window.setTimeout(Map.getCountriesData, 500);
    }

    // Change la couleur du fond
    static switchColor() {
        const defaultColor = "#121212";
        const blueColor = "#244A66FF";

        Page.blueMode = !Page.blueMode;

        document.body.style.backgroundColor = (Page.blueMode ? blueColor : defaultColor);
        if (Page.blueMode) {
            document.getElementById("toggleInside").classList.add("blue");
            Page.displayTooltip("Desactiver l'affichage de la mer");
        } else {
            document.getElementById("toggleInside").classList.remove("blue");
            Page.displayTooltip("Activer l'affichage de la mer");
        }
    }

    // G�n�re l'�l�ment select contenant les codes des pays
    static generateCountrySelect() {
        const selectElement = document.getElementById("countrySelect");
        for (let i = 0; i < Page.countriesCodes.length; ++i) {
            const codeCountry = Page.countriesCodes[i].innerHTML;
            const optionElement = document.createElement('option');
            optionElement.value = codeCountry;
            optionElement.text = codeCountry;
            selectElement.add(optionElement);
        }
    }

    // Ex�cut� quand l'utilisateur cherche un code pays dans le select
    static selectCountryCode() {
        const countryCode = document.getElementById("countrySelect").value;
        const countryDOM = document.querySelector("#map path[id=" + countryCode + "]");

        // Si un pays �tait focus, on enl�ve le focus
        if (Map.focusedCountry !== null)
            Map.unfocusCountry();

        // On focus le nouveau pays
        Map.focusCountry(countryDOM);
    }


    // Affiche l'infobulle avec un contenu (HTML ou Text)
    static displayTooltip(content) {
        const tooltipDOM = Page.tooltip.element;
        tooltipDOM.style.display = "block";
        tooltipDOM.innerHTML = content;
        Page.tooltip.displayed = true;

        // Met � jour les coordonn�es de l'infobulle
        Page.updateTooltip();
    }

    // Cache l'infobulle
    static removeTooltip() {
        Page.tooltip.displayed = false;

        const tooltipDOM = Page.tooltip.element;
        tooltipDOM.innerHTML = "";
        tooltipDOM.style.display = "none";
        tooltipDOM.style.top = "0";
        tooltipDOM.style.left = "0";
    }

    // Modifie la position de l'infobulle pour qu'elle suive la souris si elle est activ�e
    static updateTooltip() {
        if (Page.tooltip.displayed) {
            const tooltipDOM = Page.tooltip.element;
            const offsetTop = (Page.mouse.y > window.innerHeight / 2 ? -60 - tooltipDOM.offsetHeight : 0);
            const offsetLeft = (Page.mouse.x > 3 * window.innerWidth / 4 ? -20 - tooltipDOM.offsetWidth : 0);
            tooltipDOM.style.top = (Page.mouse.y + 10 + offsetTop) + "px";
            tooltipDOM.style.left = (Page.mouse.x + 30 + offsetLeft) + "px";
        }
    }
}

class Map {
    static focusedCountry;      // Code du pays qui est focus sur la map (peut �tre null)
    static temperatureVisual;   // True si la visualisation de la temp�rature est activ�e
    static memoCountries = {};  // Stocke les informations des pays r�cup�r�es du fichier XML et des API

    // (Re) initialise la map
    static init() {
        Map.focusedCountry = null;
        Map.temperatureVisual = false;

        // (Re) dessine la carte vierge
        Map.draw();

        // Ajoute un listener au survol d'un pays
        document.querySelector("#map g").addEventListener("mouseover", Map.hoverCountryEvent);
    }

    // Ajoute ou remplace la carte dans le DOM
    static draw() {
        const serializer = new XMLSerializer();
        const mapXML = XML.load("worldmap.svg");
        document.getElementById("map").innerHTML = serializer.serializeToString(mapXML);
    }

    // R�cup�re les informations des pays des API et de l'XML
    static getCountriesData() {
        // Pour chaque pays de la map
        document.querySelectorAll("#map path").forEach((countryDOM) => {
            const countryCode = countryDOM.id;
            const countryXML = XML.getCountryXML(countryCode);

            // On r�cup�re la monnaie � partir d'une API
            const countryJSON = JSON.load("https://restcountries.com/v2/alpha/" + countryCode);
            const currency = (!countryJSON['currencies'] ? "" : countryJSON['currencies'][0])

            // On r�cup�re la temp�rature d'une API
            let temperature = NaN;
            const latitude = XML.getTagValue(countryXML, "latitude");
            const longitude = XML.getTagValue(countryXML, "longitude");
            if (latitude && longitude) {
                const url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&hourly=temperature_2m&forecast_days=1";
                const temperatureJSON = JSON.load(url);
                temperature = (!temperatureJSON['hourly'] ? NaN : Math.max(...temperatureJSON['hourly']['temperature_2m']));
            }

            // On stocke les informations pour chaque pays
            Map.memoCountries[countryCode] = {
                name: XML.getTagValue(countryXML, 'name'),
                capital: XML.getTagValue(countryXML, 'capital'),
                languages: XML.getTagValue(countryXML, 'languages'),
                flag: XML.getTagValue(countryXML, 'flag').trim(),
                currency: currency,
                temperature: temperature
            };
        });

        // Une fois termin�, on cache la page de chargement
        document.getElementById("loadingPage").style.display = "none";
    }

    // Ex�cut� lorsque l'utilisateur survole un pays
    static hoverCountryEvent(e) {
        const countryDOM = e.target;
        const countryCode = countryDOM.id;

        // Si le pays survol� est diff�rent de celui qui avait le focus, on fait le changement de focus
        if (Map.focusedCountry !== countryCode) {
            if (Map.focusedCountry !== null) {
                Map.unfocusCountry();
            }
            Map.focusCountry(countryDOM);

            // On ajoute un listener sur le clic
            countryDOM.addEventListener('click', Map.clickCountryEvent);

            // Lorsque l'utilisateur arr�te de survoler le pays, on retire le focus
            countryDOM.addEventListener("mouseleave", Map.unfocusCountry);
        }
    }

    // Ex�cut� lorsque l'utilisateur clique sur un pays
    static clickCountryEvent(e) {
        const countryDOM = e.target;
        const countryCode = countryDOM.id;

        // Si l'utilisateur est en jeu et qu'il n'a pas gagn� ni d�j� propos� ce pays, alors on le propose
        if (Game.started && !Game.win && !Game.guesses.includes(countryCode))
            Game.guessCountry(countryDOM);
    }

    // Met le focus sur un pays de la carte
    static focusCountry(countryDOM) {
        const countryCode = countryDOM.id;
        Map.focusedCountry = countryCode;

        // Si pas en jeu et pays pas encore propos�, on colore le pays en gris fonc�
        if (!Game.started || !Game.guesses.includes(countryCode))
            countryDOM.style.fill = "#494949";

        // Si on est en jeu, on affiche "???" dans l'infobulle, sinon on affiche les infos du pays
        if (Game.started && !Game.win && !Game.guesses.includes(countryCode))
            Page.displayTooltip("???");
        else
            Page.displayTooltip(Map.getCountryTooltipContent(countryCode));
    }

    // Enl�ve le focus du pays actuel
    static unfocusCountry() {
        if (Map.focusedCountry !== null) {
            const countryDOM = document.querySelector("#map path[id=" + Map.focusedCountry + "]");
            Map.focusedCountry = null;
            Page.removeTooltip();

            // Si on n'est pas en jeu, et que la pays n'a pas encore �t� propos�, on remet sa couleur initiale
            if (!Game.started || !Game.guesses.includes(countryDOM.id)) {
                // Soit gris clair, soit la couleur de la visualisation de temp�rature si elle est activ�e
                if (Map.temperatureVisual) {
                    console.log(Map.memoCountries[countryDOM.id].temperature)
                    countryDOM.style.fill = Map.getColorFromTemperature(Map.memoCountries[countryDOM.id].temperature);
                }
                else
                    countryDOM.style.fill = "#CCCCCC";
            }
        }

    }

    // On r�cup�re les infos du pays � afficher dans l'infobulle
    static getCountryTooltipContent(countryCode) {
        const data = Map.memoCountries[countryCode];

        let content = "<h2>" + data.name + " " + data.flag + "</h2>";
        content += "<h3>" + data.capital + "</h3>";
        content += "<b>Langue(s) :</b> " + data.languages;
        content += "<br/><b>Monnaie :</b> " + data.currency['name'] + " (" + data.currency['symbol'] + ")";
        content += "<br><b>Temperature maximale aujourd'hui :</b> " + data.temperature + "&#8451;";

        return content;
    }

    // Parcourt les pays pour les colorer selon leur temp�rature
    static colorWithTemperatureGradient() {
        Map.temperatureVisual = true;

        document.querySelectorAll("#map path").forEach((countryDOM) => {
            let temperature = Map.memoCountries[countryDOM.id].temperature;
            countryDOM.style.fill = Map.getColorFromTemperature(temperature);
        });
    }

    // Renvoie une couleur correspondant � une temp�rature (en �C)
    static getColorFromTemperature(temperature) {
        const tempMin = -30;
        const tempMax = 40;
        const gradient = ["#ff6000", "#ff6a0b", "#ff7315", "#ff7d20", "#ff862a", "#ff9035", "#ff9a3f", "#ffa34a", "#ffad55", "#ffb65f", "#ffc06a", "#ffc974", "#ffd37f", "#ffd585", "#ffd78c", "#ffda92", "#ffdc99", "#ffde9f", "#ffe1a5", "#ffe3ac", "#ffe5b2", "#ffe7b9", "#ffeabf", "#ffecc6", "#ffeecc", "#ffefd0", "#fff1d4", "#fff2d9", "#fff4dd", "#fff5e1", "#fff7e6", "#fff8ea", "#fff9ee", "#fffbf2", "#fffcf7", "#fffefb", "#ffffff", "#fbfcff", "#f7f9ff", "#f2f7ff", "#eef4ff", "#eaf1ff", "#e6eeff", "#e1ebff", "#dde8ff", "#d9e6ff", "#d4e3ff", "#d0e0ff", "#ccddff", "#c6d9ff", "#bfd5ff", "#b9d1ff", "#b2ccff", "#acc8ff", "#a5c4ff", "#9fc0ff", "#99bcff", "#92b7ff", "#8cb3ff", "#85afff", "#7fabff", "#74aaff", "#6aa9ff", "#5fa8ff", "#55a7ff", "#4aa6ff", "#3fa5ff", "#35a4ff", "#2aa3ff", "#20a2ff", "#15a1ff", "#0ba0ff", "#009fff"];

        if (isNaN(temperature))
            return "#ccc";

        temperature = Math.max(Math.min(temperature, tempMax), tempMin);
        const index = gradient.length - Math.floor((temperature - tempMin) * gradient.length / (Math.abs(tempMin) + Math.abs(tempMax))) - 1;
        return gradient[index];
    }

}

class XML {
    static countriesXML = XML.load("./countries.xml");
    static countryXSL = XML.load("./country.xsl");

    // Charge un fichier XML
    static load(url) {
        let httpAjax;

        httpAjax = window.XMLHttpRequest ?
            new XMLHttpRequest() :
            new ActiveXObject('Microsoft.XMLHTTP');

        if (httpAjax.overrideMimeType) {
            httpAjax.overrideMimeType('text/xml');
        }

        httpAjax.open('GET', url, false);
        httpAjax.send();

        return httpAjax.responseXML;
    }

    // R�cup�re le XML issu de country.XSL pour un code pays particulier
    static getCountryXML(countryCode) {
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(XML.countryXSL);
        xsltProcessor.setParameter("", "country_code", countryCode);
        return xsltProcessor.transformToDocument(XML.countriesXML);
    }

    // R�cup�re le contenu d'un tag depuis un fichier XML
    static getTagValue(XML, tagName) {
        return XML.getElementsByTagName(tagName)[0].innerHTML;
    }
}

class JSON {
    // Charge un fichier JSON
    static load(url) {
        let httpAjax;

        httpAjax = window.XMLHttpRequest ?
            new XMLHttpRequest() :
            new ActiveXObject('Microsoft.XMLHTTP');

        if (httpAjax.overrideMimeType) {
            httpAjax.overrideMimeType('text/json');
        }

        httpAjax.open('GET', url, false);
        httpAjax.send();

        return eval("(" + httpAjax.responseText + ")");
    }
}

class Game {
    static started; // True si une partie est en cours
    static country; // Code pays � trouver
    static guesses; // Tableau des propositions
    static win;     // True si le joueur a gagn�

    // (Re) initialise une partie
    static init() {
        Game.started = false;
        Game.country = null;
        Game.guesses = [];
        Game.win = false;
    }

    // Commence une partie
    static start() {
        Game.init();
        Game.started = true;
        // R�cup�re un pays au hasard
        Game.country = Page.countriesCodes[Math.floor(Math.random() * Page.countriesCodes.length)].innerHTML;

        // Affiche le texte avec le pays � trouver
        const countryXML = XML.getCountryXML(Game.country);
        document.getElementById("map").classList.add("game")
        document.getElementById("gameExplanation").innerText = "Vous devez trouver le pays";
        document.getElementById("countryToFind").innerHTML = XML.getTagValue(countryXML, "name")
        document.getElementById("nbTries").innerText = "0";
        document.getElementById("gameText").style.display = "block";

        // R�-initialise la carte (pour les couleurs)
        Map.init();
    }

    // Arr�te la partie en cours
    static stop() {
        Game.init();
        document.getElementById("map").classList.remove("game")
        document.getElementById("gameText").style.display = "none";

        // R�-initialise la carte (pour les couleurs)
        Map.init();
    }

    // Quand le joueur propose un pays
    static guessCountry(countryDOM) {
        const countryCode = countryDOM.id;

        // Ajoute le pays aux propositions et affiche le nombre d'essais
        Game.guesses.push(countryCode);
        document.getElementById("nbTries").innerText = Game.guesses.length;

        // Affiche le pays en vert / rouge selon que la proposition est juste / fausse
        if (countryCode === Game.country) {
            Game.win = true;
            countryDOM.style.fill = "green";
            document.getElementById("gameExplanation").innerText = "Vous avez decouvert le pays";
            document.getElementById("countryToFind").style.color = "green";
            Page.displayTooltip("Bravo ! Vous l'avez eu en " + Game.guesses.length + " tentative(s) !" + Map.getCountryTooltipContent(countryCode));
        } else {
            countryDOM.style.fill = "red";
            Page.displayTooltip(Map.getCountryTooltipContent(countryCode))
        }
    }
}

// Update la position de la souris et de l'infobulle quand l'utilisateur bouge la souris
document.addEventListener("mousemove", (ev) => {
    Page.mouse.x = ev.pageX;
    Page.mouse.y = ev.pageY;
    Page.updateTooltip();
});

// Affiche une infobulle quand l'utilisateur survole le bouton "Visualiser les temp�ratures"
document.getElementById("temperatureButton").addEventListener("mouseenter", (ev) => {
    Page.displayTooltip("Visualisation des temperatures maximales atteintes aujourd'hui");

    ev.target.addEventListener("mouseleave", () => {
        Page.removeTooltip();
    })
});

// Affiche une infobulle quand l'utilisateur survole le bouton toggle de couleur de fond
document.getElementById("toggle").addEventListener("mouseenter", (ev) => {
    if (Page.blueMode)
        Page.displayTooltip("Desactiver l'affichage de la mer");
    else
        Page.displayTooltip("Activer l'affichage de la mer");

    ev.target.addEventListener("mouseleave", () => {
        Page.removeTooltip();
    })
});


//===================================================//


// C'est parti !
Page.init();