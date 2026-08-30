import domLoader from "./domLoader.js"
import {sqlInitPromise} from "./astroWeatherLoader.js"


//prepare setup for modifying the dom
document.addEventListener("DOMContentLoaded", function()
{
    // prep domHandler with default settings
    let domHandler = new domLoader();
    
    // ensure that sqlInit happens
    sqlInitPromise.then(function()
    {
        console.warn("TODO: default behavior of document is to initialize by setting locationID to 1.  Change later to init by current location")
        domHandler.setLocationLocId(1)
    })
    //wire searchBar to execute domHandler functions
    let searchFourm = document.querySelector('form#citySearch');
    searchFourm.addEventListener('submit', function(e)
    {
        e.preventDefault();

        domHandler.setLocationCity(searchFourm['searchbar'].value)
    });

    sqlInitPromise.then(async function()
    {
        //domHandler.setWeatherData()
    });
});