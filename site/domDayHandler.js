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

    update(weatherData)
    {
        //for simplicity, clear all days from daysContainer
        this.clear();

        let weatherForecastAvailable = weatherData.length;

        for (let i = 0; i < weatherForecastAvailable; ++i)
        {
            //create day to add to daysContainer
            let currentTime = new Date();

            let curDay = weatherData[i]; //currently selected day data
            let domDay = this.#dayTemplate.cloneNode(true)
                     
            //set day indicator
            if (i == 0)
            {
                domDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = 'Tonight';
            }
            else if (i == 1)
            {
                domDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = "Tomorrow";
            }
            else if (i < 7) //same week
            {
                let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                let selectWeekDay = curDay.date.getDay();
                
                domDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = daysOfWeek[selectWeekDay];
            }
            else //just show the 
            {   
                domDay.querySelector(DAY_NODE_DAY_NAME_QUERY).innerText = `${nodeTime.getMonth() + 1}-${nodeTime.getDate()}-${nodeTime.getFullYear()}`
            }

            //NOT INCLUDED AS A FEATURE ANYMORE
            //REASON: Not retrieving phase anymore
            /*
                //set phase from moon info
                curDay.querySelector('.moonPhase').innerText = 
                domDay.querySelector('.weatherIcon').src = curWeather.condition.icon;
            */
            
            //update sunset and sunrise
            domDay.querySelector('.timeframe .sunset').innerText = curDay.sunset;
            domDay.querySelector('.timeframe .sunrise').innerText = curDay.sunrise;
            
            //Add to DOM
            this.#daysContainer.appendChild(domDay);
        }
    }
}