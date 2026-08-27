# astronomy-calendar-core

*Note that astronomy-calendar-core is still in early development and usage of this repository may change*

## What is this?:
The astronomy-calendar-xxxx project is a project that merges astronomy data with weather data to help users pick times to view objects in the sky.  This repository in general is the platform independent code of this project, aptly named astronomy-calendar-core.

astronomy-calendar-core is designed in a way where it requires minimal setup to add new platforms.  If you're at all interested in moving my astronomy-calendar-android application to another platform and have the development skills required to do so (or you trust your vibe coding skills), feel free to fork my repository and integrate this application onto any other platform of your choosing.

*astronomy-calendar-core is still very early in development and the steps required to integrate this may change at any point*

## How to use:
  astronomy-calendar-core consists of three main components that need to be wired before it can run:
  - A SQLite database called astro_weather.db that stores all location, weather, and astronomy information
  - A python program called AstroDataLoader.py that loads astro_weather.db with data
  - A displayable website under the /site folder that contains a viewable website form of the calendar

## Configuring python:
  Python requires the following packages to run:
    `pip install skyfield openmeteo_requests`
  To then update astro_weather.db, run AstroDataLoader.py
  (note that these instructions may change as I develop my first version of this in Android Studio and discover bugs.  This is still in development)
  
## Configuring site:
astronomy-calendar-core already contains the site directory as a user friendly way to view data relevant to them.
To begin, you are going to need a way to open the site with javascript enabled.  Typically, unless plans change, the best page to start them on is index.html
