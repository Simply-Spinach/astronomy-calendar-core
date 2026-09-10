import domDayHandler from "./domDayHandler.js"
import domTimelineHandler from "./domTimelineHandler.js"
import {sqlInitPromise, getDbInitStatus, getLocId, getCoords, getFutureDateWeather, getAstroObjects} from "./astroWeatherLoader.js"

export default class domLoader
{
    #timelineHandler;
    #dayHandler;
    #locId;

    #curLocationStr;
    #astroData;
    #weatherData;

    constructor()
    {
        //load dayHandler and timelineHandler
        this.#dayHandler = new domDayHandler();
        this.#timelineHandler = new domTimelineHandler();
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
        
        this.setLocationLocId(1);
    }

    async setLocationLocId(locId)
    {
        //update self
        this.#locId = locId;
        this.#astroData = getAstroObjects(locId)
        console.log(this.#astroData)
        this.#weatherData = getFutureDateWeather(locId)

        //update curLocationStr to show coordinates (at the moment, we don't have location names)
        let coords = getCoords(locId)
        this.#curLocationStr = `Coordinates: ${coords[0]}, ${coords[1]}`

        //update visuals
        this.clear()
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
        this.#timelineHandler.update(this.#astroData, this.#locId);

        document.body.classList.remove("no_content");
    }
}