import DateWeather from "./DateWeather.js"
import AstroObject from "./AstroObject.js"
import domLoader from "./domLoader.js"
import {setLocation, sqlInitPromise} from "./astroWeatherLoader.js"

// init SqlJs
document.addEventListener('dbStartEvent', function()
{
    console.warn("Loc_id doesn't change automatically with location or other data yet.  Currently set to default to 1");
    setLocation(1)
})

//prepare setup for modifying the dom
document.addEventListener("DOMContentLoaded", function()
{
    // prep domHandler with default settings
    let domHandler = new domLoader();

    //wire searchBar to execute domHandler functions
    let searchFourm = document.querySelector('form#citySearch');
    searchFourm.addEventListener('submit', function(e)
    {
        e.preventDefault();

        domHandler.setLocationCity(searchFourm['searchbar'].value)
    });

    sqlInitPromise.then(async function()
    {
        domHandler.setWeatherData()
    });
});

//create domLoader class for ease of use