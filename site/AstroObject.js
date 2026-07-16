import './sql-wasm.js'

export default class AstroObject
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

    getLocalEvents(db, locId)
    {
        //prepare empty array to push to
        let localEvents = Array();
        
        let locEventsIter = db.prepare(`
            SELECT astro_event_id, start_datetime, end_datetime
            FROM (SELECT astro_event_id, loc_id, ast_obj_id, start_datetime, end_datetime
                WHERE loc_id = :locId AND ast_obj_id = :astObjId)`
        )
        locEventsIter.bind({':locId':locId , ':astObjId':this.#astObjId});

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