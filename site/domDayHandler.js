const DAY_NODE_CONTAINER_QUERY = '#dayIdentifier'
const DAY_NODE_QUERY = '.dayInfo';
const DAY_NODE_DAY_NAME_QUERY = '.day';
const SIMPLE_DAY_NODE_QUERY = '.dayLabel';

export default class domDayHandler
{
    #daysContainer;
    #dayTemplate;
    #simpleDayTemplate;

    constructor()
    {
        this.#daysContainer = document.querySelector(DAY_NODE_CONTAINER_QUERY);
        this.#dayTemplate = this.#daysContainer.querySelector(DAY_NODE_QUERY);
        this.#simpleDayTemplate = this.#daysContainer.querySelector(SIMPLE_DAY_NODE_QUERY);

        this.#daysContainer.removeChild(this.#dayTemplate);
        this.#daysContainer.removeChild(this.#simpleDayTemplate);
    }

    //Clears all days from the daysContainer
    clear()
    {
        this.#daysContainer.innerHTML = '';
    }

    update(weatherData, astroData)
    {
        //for simplicity, clear all days from daysContainer
        this.clear();


        let weatherForecastAvailable = weatherData.forecast.forecastday.length;
        let astroForecastAvailable = astroData.data.table.header.length; /* I really can't figure out how to do the math here and I don't want to worry about it*/;

        for (let i = 0; i < astroForecastAvailable; ++i)
        {
            //create day to add to daysContainer
            let currentTime = new Date();

            let curAstro = astroData.data.table[i];
            let curDay; //set later

            //set default curDay template
            if (i < weatherForecastAvailable) //has forecast info
            {
                curDay = this.#dayTemplate.cloneNode(true);
            }
            else //no forecast info
            {
                curDay = this.#simpleDayTemplate.cloneNode(true);
            }
            
            //set day
            if (i == 0)
            {
                curDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = 'Tonight';
            }
            else if (i == 1)
            {
                curDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = "Tomorrow";
            }
            else if (i < 7) //same week
            {
                let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                let selectWeekDay = (currentTime.getDay() + i - 1) % 6;
                
                curDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = daysOfWeek[selectWeekDay];
            }
            else //just throw out the date
            {
                let nodeTime = currentTime;
                nodeTime.setDate(currentTime.getDate() + i);
                
                curDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = `${nodeTime.getMonth() + 1}-${nodeTime.getDate()}-${nodeTime.getFullYear()}`
            }

            //set phase from moon info
            curDay.querySelector('.moonPhase').innerText = astroData.data.table.rows[1].cells[i].extraInfo.phase.string;

            //complex info for other stuff
            if (i < weatherForecastAvailable)
            {
                //get weather data            
                let curWeather = weatherData.forecast.forecastday[i].day;

                curDay.querySelector('.weatherIcon').src = curWeather.condition.icon;

                //update sunset and sunrise
                if (i < weatherForecastAvailable - 1)
                {
                    curDay.querySelector('.timeframe .sunset').innerText = weatherData.forecast.forecastday[i].astro.sunset;
                    curDay.querySelector('.timeframe .sunrise').innerText = weatherData.forecast.forecastday[i + 1].astro.sunrise;
                }
                else if (i == weatherForecastAvailable - 1)
                {
                    curDay.querySelector('.timeframe').innerHTML = `Sunset: <span class="sunset">${weatherData.forecast.forecastday[i].astro.sunset}</span>`;
                }
            }
            else //we don't have weather data and nothing gets set
            {

            }
            
            //Add to DOM
            this.#daysContainer.appendChild(curDay);
        }
    }
}