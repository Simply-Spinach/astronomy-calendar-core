export default class domTimelineHandler
{
    #timelineTemplate;
    #lineSegmentTemplate;
    #lineSegmentBeginTemplate;
    #lineSegmentEndTemplate;
    //added to help with Chromium bug (developed on firefox and without thinking introduced bugs on 99% of the world's browsers)
    #lineSegmentBridgeTemplate;
    
    #astObjContianer;

    constructor()
    {
        this.#timelineTemplate = document.querySelector(".timeline").cloneNode(true);

        //prep line segments

        //TODO: REMOVE SELECTABLE CAPS IF NEEDED (currently just goes off screen if needed)
        this.#lineSegmentTemplate = this.#timelineTemplate.querySelector(".line .lineSegment").cloneNode(true /* REMOVE COMMENT FOR DEBUGGING MODE*/);
        this.#lineSegmentBeginTemplate = this.#timelineTemplate.querySelector(".lineSegment .left-cap").cloneNode();
        this.#lineSegmentEndTemplate = this.#timelineTemplate.querySelector(".lineSegment .right-cap").cloneNode();

        this.#lineSegmentBridgeTemplate = this.#timelineTemplate.querySelector(".line .left-bridge").cloneNode();

        //remove children from timelineTemplate's line
        this.#timelineTemplate.querySelector('.line').innerHTML = '';

        //get containers by type
        this.#astObjContianer = document.querySelector(".timeline-holder > .sectionType");
        this.clear()
    }

    clear()
    {
        //clear timelines from objects stored
        for (let child of this.#astObjContianer.querySelectorAll('.timeline'))
        {
            this.#astObjContianer.removeChild(child);
        }
    }

    update(astroData, locId, db)
    {
        //just reset us and rebuild the dom for simplicity of coding
        this.clear();

        //anchor for far left of the screen representing what time it is now
        //TODO: replace with optional parameter later for access to previous dates
        let leftAnchor = Date.now();

        for (let astObj of astroData)
        {
            let curTimeline = this.#timelineTemplate.cloneNode(true);
            
            //prepare names to be visible
            curTimeline.querySelector(".objectLabel").innerText = astObj.name;
            
            //mark days when viewable
            let objEvents = astObj.getLocalEvents(locId);

            //fill timeline
            for (let event of objEvents)
            {
                curLineSegment = this.#lineSegmentTemplate.cloneNode(true);

            }











            for (let i = 0; i < visibleDays.length; ++i)
            {
                //for some reason, we have earth as a planet you can view in our data, so we're forcing it out

                let isVisibleToday = visibleDays[i];
                let curLineSegment;
                           
                if (isVisibleToday)
                {
                    //setup line segment
                    
                    curLineSegment = this.#lineSegmentTemplate.cloneNode(true);
                                        
                    if (i > 0 && !lastSegmentVisible) //general case to add start point
                    {
                        //insert beginning point
                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode(true));
                        
                    }
                    else if (i > 0 && lastSegmentVisible)
                    {
                        //patch for Chromium: add bridge to help cover gaps between lines
                        curLineSegment.appendChild(this.#lineSegmentBridgeTemplate.cloneNode(true));
                    }
                    else if (i == 0) //edge case where we do want a start here
                    {
                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode(true));
                    }
                    /* if (i == 0 && isVisibleToday) //first node edge case.  Has segment behind it 
                    {
                        curLineSegment.appendChild(this.#lineSegmentBeginTemplate.cloneNode());
                    } */
                    
                }
                else //isVisibleToday == false
                {
                    if (i > 0 && lastSegmentVisible == true) //needs cap on last segment when called
                    {
                        curTimeline.querySelector('.line').lastElementChild.appendChild(this.#lineSegmentEndTemplate.cloneNode(true));
                    }

                    //enter empty div into dom
                    curLineSegment = document.createElement("div");                    
                    
                }
                
                //add timeline to dom
                this.#astObjContianer.appendChild(curTimeline);
                lastSegmentVisible = isVisibleToday;

                //add to timeline
                curTimeline.querySelector('.line').appendChild(curLineSegment);
            }
        }
            
    }
}