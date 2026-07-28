import "./sql-wasm.js"

export default class dateWeather
{
    #dbLocDateId;
    #jsDate;

    #sunrise;
    #sunset;

    #hourlyWeather;

    constructor(db, dbLocDateId, jsDate, sunrise, sunset)
    {
        //load primary data
        this.#dbLocDateId = dbLocDateId;
        this.#jsDate = jsDate;
        this.#sunrise = sunrise;
        this.#sunset = sunset;

        //load child weather data
        this.#hourlyWeather = Array(24);
        let collectWeather = db.prepare(`SELECT hr, temp, cloud_cover AS cloudCover, visibility, chance_precipitation as chancePrecipitation
            FROM (SELECT loc_date_id, hr, temp, cloud_cover, visibility, chance_precipitation
                FROM Weather
                WHERE loc_date_id = :locDateId)`);
        collectWeather.bind({':locDateId':this.#dbLocDateId})

        while(collectWeather.step())
        {
            let weather = collectWeather.getAsObject()
            this.#hourlyWeather[weather.hr] = weather; //should be fine here as an object since there's no children
        }
    }

    get dbLocDateId()
    {
        return this.#dbLocDateId;
    }

    get jsDate()
    {
        return this.#jsDate;
    }

    get sunrise()
    {
        return this.#sunrise;
    }

    get sunset()
    {
        return this.#sunset;
    }

    get hourlyWeather()
    {
        return this.#hourlyWeather;
    }
}
