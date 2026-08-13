import "./sql-wasm.js"
import dateWeather from './dateWeather.js'
import astroObject from './astroObject.js'

const ASTRO_DB_PATH = "/astro_weather.db"

let config = {
    locateFile: filename => `/site/${filename}`
}

let db = null
let dbStartEvent = new Event ('dbStartEvent')


export const sqlInitPromise = initSqlJs(config).then(async function(SQL) {
    console.log("sqlInitPromise started")
    //init interface with db
    const res =  await fetch(ASTRO_DB_PATH)
    const bytes = new Uint8Array(await res.arrayBuffer())
    db = new SQL.Database(new Uint8Array(bytes));
}).then(function() //create SQL event afterward so that we can do stuff with this
{
    document.dispatchEvent(dbStartEvent)
});

export function getDbInitStatus()
{
    return db != null;
}

export function getLocId(lat, lon)
{
    //gets closest object, currently by manhatan distance for convenience
    const loc_id_prep = db.prepare("SELECT loc_id FROM Location ORDER BY abs(lat - :lat) + abs(lon - :lon) ASC");
    const loc_id = loc_id_prep.getAsObject({':lat':lat, 'lon':lon}).loc_id;
    return loc_id
}

//Returns coordinates given the locationID provided
//  returns: array in format [latitude, longitude]
export function getCoords(locId)
{
    //get location data
    const latlon = db.exec("SELECT lat, lon FROM Location WHERE loc_id= :locId", 
        {':locId' : locId}
    )[0].values[0]
    return latlon;
}

//TODO: redo to have a "from" value possibly?
export function getFutureDateWeather(locId)
{

    //Get current time and format in various useful ways
    const curDate = new Date(Date.now()); //Used to help convert to UTC value
    //for SQLite queries
    const curUTCFormatDate = `${curDate.getUTCFullYear().toString()}-${(curDate.getUTCMonth() + 1).toString().padStart(2,'0')}-${curDate.getUTCDate().toString().padStart(2,'0')}`

    //Get DateWeathers to load into dataset
    let days = Array();
    let daysDbIter = db.prepare(`SELECT loc_date_id, view_date, sunset, sunrise 
        FROM LocationDate 
        WHERE loc_id=:locId AND view_date >= :current_date `)
    
    daysDbIter.bind({
            ':locId' : locId, 
            ':current_date': curUTCFormatDate
    });

    while(daysDbIter.step())
    {
        let dayDbInfo = daysDbIter.getAsObject()
        let currentDay = new dateWeather(db, dayDbInfo.loc_date_id, new Date(Date.parse(dayDbInfo.view_date)), dayDbInfo.sunrise, dayDbInfo.sunset)
        days.push(currentDay)
    }

    return days;
}

export function getAstroObjects(locId)
{
    //load AstroObjects
    let astroObjects = Array();
    let astroDbIter = db.prepare(`SELECT ast_obj_id, display_name, display_info
            FROM AstroObject`);
    while(astroDbIter.step())
    {
        let objInfo = astroDbIter.getAsObject();
        let currentObj = new astroObject(objInfo.ast_obj_id, objInfo.display_name, objInfo.display_info);

        //insert to list
        astroObjects.push(currentObj);
    }
}

export function getLocalAstroEvents(astObjId, locId, jsStartDate)
{
    //prepare empty array to push to
    let localEvents = Array();
    const startDbUTCDatetime = `${jsStartDate.getUTCFullYear().toString()}-${(jsStartDate.getUTCMonth() + 1).toString().padStart(2,'0')}-${jsStartDate.getUTCDate().toString().padStart(2,'0')} ${jsStartDate.getHours().toString().padStart(2,'0')}:${jsStartDate.getMinutes().toString().padStart(2,'0')}:${jsStartDate.getSeconds().toString().padStart(2,'0')}`
    
    console.log(startDbUTCDatetime);

    let locEventsIter = db.prepare(`
        SELECT astro_event_id as astroEventId, start_datetime as startDatetime, end_datetime as endDatetime
        FROM (SELECT astro_event_id, loc_id, ast_obj_id, start_datetime, end_datetime
            FROM CelestialEvent
            WHERE loc_id = :locId AND ast_obj_id = :astObjId AND end_datetime > :startUTCDatetime)`
    )
    locEventsIter.bind({
        ':locId':locId , 
        ':astObjId':astObjId,
        ':startUTCDatetime': startDbUTCDatetime
    });

    while(locEventsIter.step())
    {
        localEvents.push(locEventsIter.getAsObject())
    }

    return localEvents;
}