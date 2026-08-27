# astronomy-calendar-core

A WIP astronomy app showing you what days are best used for viewing the skies at night based on weather and what's visible.

## How to use:
  astronomy-calendar-core consists of three main components that need to be wired before it can run:
  - A SQLite database called astro_weather.db that stores all location, weather, and astronomy information
  - A python program called AstroDataLoader.py that loads astro_weather.db with data
  - A displayable website under the /site folder that contains a viewable website form of the calendar

## Configuring python:
  Python requires the following packages to run:
    `pip install skyfield openmeteo_requests`
    To get all the 

## Configuring site
astronomy-calendar-core already contains the site directory as a user friendly way to view data relevant to them.
To begin, you are going to need a way to open the site with javascript enabled.  Typically, unless plans change, the best page to start them on is index.html
