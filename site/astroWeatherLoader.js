import "./sql-wasm.js"

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

export function setLocationByCoords(lat, lon)
{
    const loc_id_prep = db.prepare("SELECT loc_id FROM Location WHERE lat= :lat AND lon=:lon");
    const loc_id = loc_id_prep.getAsObject({':lat':lat, 'lon':lon}).loc_id;
    return setLocation(loc_id)
}

export function setLocation(locId)
{ 
    //get location data
    const latlon = db.exec("SELECT lat, lon FROM Location WHERE loc_id= :locId", 
        {':locId' : locId}
    )[0].values[0]
    console.log(latlon)     
    const lat = latlon[0];
    const lon = latlon[1];
    console.log("loc_id = " + locId + ": lat=" + lat + ', lon=' + lon);
    

    //Get current time
    const curEpoch = Math.floor(Date.now() / 1000); //For easier interaction with database
    const curDate = new Date(Date.now()); //For conversion to UTC value in user interactions
    
    const curUTCFormatDate = `${curDate.getUTCFullYear().toString()}-${(curDate.getUTCMonth() + 1).toString().padStart(2,'0')}-${curDate.getUTCDate().toString().padStart(2,'0')}`
    console.log("Current UTC time: ", curUTCFormatDate);

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
        let currentDay = new DateWeather(db, dayDbInfo.loc_date_id, new Date(Date.parse(dayDbInfo.view_date)), dayDbInfo.sunrise, dayDbInfo.sunset)
        days.push(currentDay)
    }

    //load AstroObjects
    let astroObjects = Array();
    let astroDbIter = db.prepare(`SELECT ast_obj_id, display_name, display_info
            FROM AstroObject`);
    while(astroDbIter.step())
    {
        let objInfo = astroDbIter.getAsObject();
        let currentObj = new AstroObject(objInfo.ast_obj_id, objInfo.display_name, objInfo.display_info);

        //insert to list
        astroObjects.push(currentObj);
    }
}
