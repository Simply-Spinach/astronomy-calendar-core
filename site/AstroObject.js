import {getLocalAstroEvents} from "./astroWeatherLoader.js"

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

    //gets local events viewable past jsStartDate
    //  Set to new Date() to view all possible future dates
    getLocalEvents(locId, jsStartDate)
    {
        //return array to user
        return getLocalAstroEvents(this.#astObjId, locId, jsStartDate);
    }

    get dbAstObjId()
    {
        return this.#astObjId;
    }

    get name()
    {
        return this.#displayName;
    }

    get description()
    {
        return this.#displayInfo;
    }
}