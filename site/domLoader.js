import domDayHandler from "./domDayHandler.js"
import domTimelineHandler from "./domTimelineHandler.js"

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
        this.setLocationGPS();
    }

    setLocationCity(cityName)
    {
        //TODO: request to update sqlite database with city data

        //update visuals
        this.update();
    }

    async setLocationGPS()
    {
        //TODO: get current location data from python file
        let lat = 0;
        let lon = 0;

        //TODO: Update weatherData and astroData to contain updated location data

        //update visuals
        this.update();
    }

    clear()
    {
        //clear all dayHandler and timelineHandler conteent
        this.#dayHandler.clear();
        this.#timelineHandler.clear();

        //add class on body to hide non-functioning content
        document.body.classList.add("no_content");
    }

    update()
    {
        //update titlebar to location
        document.querySelector('#location').innerText = this.#weatherData.location.name;

        this.clear();

        this.#dayHandler.update(this.#weatherData, this.#astroData);
        this.#timelineHandler.update(this.#weatherData, this.#astroData.data);

        document.body.classList.remove("no_content");
    }
}