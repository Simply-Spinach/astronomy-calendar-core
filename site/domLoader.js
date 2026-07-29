import domDayHandler from "./domDayHandler.js"
import domTimelineHandler from "./domTimelineHandler.js"
import {sqlInitPromise, getDbInitStatus, getLocId, getCoords, getFutureDateWeather, getAstroObjects} from "./astroWeatherLoader.js"

export default class domLoader
{
    #timelineHandler;
    #dayHandler;

    #curLocationStr;
    #astroData;
    #weatherData;

    constructor()
    {
        //load dayHandler and timelineHandler
        this.#dayHandler = new domDayHandler();
        this.#timelineHandler = new domTimelineHandler();

        //load first data
        //TODO: Add if statement to make sure it doesn't load early without GPS
        this.setLocationGPS();
    }

    /*setLocationCity(cityName)
    {
        //TODO: request to update sqlite database with city data

        //update visuals
        this.update();
    }*/

    async setLocationGPS()
    {
        //TODO: update location data from python
        console.warn("TODO: setLocationGPS doesn't currently retrieve data.  Currently sets locID to 1")
        let locID = 1;

        //TODO: Update weatherData and astroData to contain updated location data

        //update visuals
        this.update();
    }

    async setLocationLocID(locId)
    {
        //update self
        this.#astroData = getAstroObjects(locId)
        this.#weatherData = getFutureDateWeather(locId)

        //update curLocationStr to show coordinates (at the moment, we don't have location names)
        let coords = getCoords(locId)
        this.#curLocationStr = `Coordinates: ${coords[0]}, ${coords[1]}`

        this.update()
    }

    clear()
    {
        //clear all dayHandler and timelineHandler conteent
        this.#dayHandler.clear();
        this.#timelineHandler.clear();

        //add class on body to hide non-functioning content
        //document.body.classList.add("no_content");
    }

    update()
    {
        //update titlebar to location
        document.querySelector('#location').innerText = this.#curLocationStr;

        this.clear();

        this.#dayHandler.update(this.#weatherData);
        this.#timelineHandler.update(this.#weatherData, this.#astroData);

        document.body.classList.remove("no_content");
    }
}