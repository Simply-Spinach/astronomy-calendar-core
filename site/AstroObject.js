import './sql-wasm.js'

export default class astroObject
{
    #astObjId;
    #displayName;
    #displayInfo;

    constructor(astObjId, displayName, displayInfo)
    {
        //load general info for object
        this.#astObjId = astObjId;
        this.#displayName = displayName;
        this.#displayInfo = displayInfo;
    }

    getLocalEvents(db, locID)
    {
        return getLocalEvents(db,locId, Date(0))
    }

    getLocalEvents(db, locId, jsStartDate)
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
            ':astObjId':this.#astObjId,
            ':startUTCDatetime': startDbUTCDatetime
        });

        while(locEventsIter.step())
        {
            localEvents.push(locEventsIter.getAsObject())
        }

        //return array to user
        return localEvents;
    }

    get dbAstObjId()
    {
        return this.#astObjId;
    }

    get displayName()
    {
        return this.#displayName;
    }

    get description()
    {
        return this.#displayInfo;
    }
}