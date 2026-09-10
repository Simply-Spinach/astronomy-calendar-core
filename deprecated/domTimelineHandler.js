const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * 60;
const SECONDS_PER_DAY = MINUTES_PER_DAY * 60;
const MILISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

export default class domTimelineHandler
{
    #timelineTemplate;
    //added to help with Chromium bug (developed on firefox and without thinking introduced bugs on 99% of the world's browsers)
    #lineSegmentTemplate;
    
    #astObjContainer;

    constructor()
    {
        this.#timelineTemplate = document.querySelector(".timeline");
        this.#timelineTemplate.parentNode.removeChild(this.#timelineTemplate);
        this.#lineSegmentTemplate = this.#timelineTemplate.querySelector(".lineAnchor");
        this.#lineSegmentTemplate.parentNode.removeChild(this.#lineSegmentTemplate);

        //get containers by type
        this.#astObjContainer = document.querySelector(".timeline-holder > .sectionType");
        //console.log(this.#astObjContainer)
        this.clear()
    }

    clear()
    {
        //clear timelines from objects stored
        for (let child of this.#astObjContainer.querySelectorAll('.timeline'))
        {
            this.#astObjContainer.removeChild(child);
        }
    }

    update(astroData, locId)
    {
        //just reset us and rebuild the dom for simplicity of coding
        this.clear();

        //anchor for far left of the screen representing what time it is now
        //TODO: replace with optional parameter later for access to previous dates
        let leftAnchor = Date.now();
        leftAnchor -= (leftAnchor % MILISECONDS_PER_DAY)
        
        for (let astObj of astroData)
        {
            let curTimeline = this.#timelineTemplate.cloneNode(true);
            
            //prepare names to be visible
            curTimeline.querySelector(".objectLabel").innerText = astObj.name;
            
            //mark days when viewable
            let objEvents = astObj.getLocalEvents(locId, new Date());

            //fill timeline
            for (let event of objEvents)
            {
                let curSegment = this.#lineSegmentTemplate.cloneNode(true);

                console.log(event);
                let setWidth = (event.endDatetime.getTime() - event.startDatetime.getTime()) / 1000;
                let setStart = (event.startDatetime.getTime() - leftAnchor) / 1000;

                console.log(`start: ${setStart}`);
                console.log(`width ${setWidth}`);

                curSegment.style.width = `calc(${setWidth} * var(--second-width))`;
                curSegment.style.left = `calc(${setStart} * var(--second-width))`;

                curTimeline.querySelector('.lineHolder').appendChild(curSegment)
            }
            
            //add to dom
            this.#astObjContainer.appendChild(curTimeline);
        }
    }
}

            
//            for (let i = 0; i < visibleDays.length; ++i)
//            {
//                //for some reason, we have earth as a planet you can view in our data, so we're forcing it out
//                
//                let isVisibleToday = visibleDays[i];
//                let curLineSegment;
//                           
//                if (isVisibleToday)
//                {
//                    //setup line segment
//                    
//                    curLineSegment = this.#lineSegmentTemplate.cloneNode(true);
//                                        
//                    if (i > 0 && !lastSegmentVisible) //general case to add start point
//                    {
//                        //insert beginning point
//                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode(true));
//                        
//                    }
//                    else if (i > 0 && lastSegmentVisible)
//                    {
//                        //patch for Chromium: add bridge to help cover gaps between lines
//                        curLineSegment.appendChild(this.#lineSegmentBridgeTemplate.cloneNode(true));
//                    }
//                    else if (i == 0) //edge case where we do want a start here
//                    {
//                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode(true));
//                    }
//                    /* if (i == 0 && isVisibleToday) //first node edge case.  Has segment behind it 
//                    {
//                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode());
//                    } */
//                    
//                }
//                else //isVisibleToday == false
//                {
//                    if (i > 0 && lastSegmentVisible == true) //needs cap on last segment when called
//                    {
//                        curTimeline.querySelector('.lineStroke').lastElementChild.appendChild(this.#lineSegmentEndTemplate.cloneNode(true));
//                    }
//
//                    //enter empty div into dom
//                    curLineSegment = document.createElement("div");                    
//                    
//                }
//                
//                //add timeline to dom
//                this.#astObjContainer.appendChild(curTimeline);
//                lastSegmentVisible = isVisibleToday;
//
//                //add to timeline
//                curTimeline.querySelector('.lineHolder').appendChild(curLineSegment);
//            }
