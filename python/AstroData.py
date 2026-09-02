#general imports
import sqlite3
import os
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from warnings import warn
import requests

#import local files
import AstroObject as astObj
import config

#openmeto imports
import openmeteo_requests

import requests_cache
from retry_requests import retry

#skyfield imports
import skyfield
from skyfield import api as sf_api
from skyfield.api import load as sf_load
from skyfield.api import wgs84 #handles positioning

from skyfield.almanac import find_discrete, risings_and_settings

#Nominatim imports
import geopy.geocoders
from geopy.geocoders import Nominatim

#main class definition
class AstroData:
    #initializes db integration
    def __init__(self):
        self.DB_PATH = config.DB_PATH
        dbReady = self._check_database_ready()
        self.sql = sqlite3.connect(self.DB_PATH)
        
        #set foreign key enforcement (not enabled by default?  Why SQLite?)
        self.sql.execute('''
            PRAGMA foreign_keys = ON;
        ''')

        #set default loc_id
        self.loc_id = 0

        #initialize tables in database if it doesn't exist
        if (not dbReady):
            self._exec_SQL_file('./astro-weather-init.sql')

    #sets location to load based on written location
    #TODO: FUNCTION CURRENTLY DOESN'T CURRENTLY WORK
    #use an api like nominatim to use https://nominatim.org/release-docs/develop/api/Search/
    def setLocationByName(self, name):
        #load via url (because I'm lazy)
        url = f"https://nominatim.openstreetmap.org/search?q=\"{name}\"&format=json&featureType=city&limit=1"        
        try:
            #load data from nominatim
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            print(response)

            #load db
            cursor = self.sql.cursor()
            cursor.execute('''
                INSERT INTO Location (lat, lon, short_name, long_name)
                VALUES (?,?,?,?); 
                ''', (response[0].lat, response[0].lon, response[0].name, response[0].display_name))
            print("name entered into system successfully")

            #retrieve location

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            print("Not changing data.  Figure out what to do from here I guess")
        self.loc_id = 0

    #sets internal location variable to coordinates provided
    def setLocationByCoords(self, lat, lon):
        cursor = self.sql.cursor()

        #insert into Location (if needed) and pull loc_id it generates
        #NOTE: CODE CAUSES RUNAWAY LOC_ID INCREASE ON IGNORE
        cursor.execute('''
        INSERT OR IGNORE INTO Location(lat, lon) VALUES
                        (? , ?)
        ''', (lat, lon))
        cursor.execute('''
        SELECT loc_id FROM
                       (
                       SELECT loc_id, lat, lon FROM Location 
                       WHERE lat = ? AND lon = ?);
        ''', (lat, lon))
        self.loc_id = cursor.fetchone()[0]
        print(self.loc_id)
        self.sql.commit()

        cursor.close()

    #updates database with new weather based on previously defined location
    def updateDatabase(self):
        #get loc_id (used everywhere, so it's computed here)
        loc_id = self.loc_id

        #create new cursor
        cursor = self.sql.cursor()

        #
        cursor.execute('''
            SELECT lat, lon FROM
                (
                SELECT loc_id, lat, lon FROM Location 
                WHERE loc_id = ?); ''', (loc_id,))
        coords = cursor.fetchone()
        lat = coords[0]
        lon = coords[1]
        self.sql.commit()

        # Retrieve new data
        meteoData = AstroData._getOpenMeteoUpdate(lat,lon)

        #lat and lon may vary slightly but technically be for the same spot so merge them
        lat = meteoData.Latitude()
        lon = meteoData.Longitude()
        timezone = meteoData.Timezone()

        #load openMeteoData
        self._loadOpenMeteoData(meteoData, loc_id)

        #get current date and convert to timescales
        curDate = date.today()
        endDate = curDate + timedelta(days=14)

        #create timescales from dates
        ts = sf_load.timescale()
        time_start = ts.utc(curDate.year,curDate.month,curDate.day)
        time_end = ts.utc(endDate.year, endDate.month, endDate.day)

        self._loadCelestialEvents(loc_id, lat, lon, time_start, time_end)
        
        print("Successfully updated", self.DB_PATH)
        #cleanup
        cursor.close()
        self.sql.commit()

    def searchNotifications(self):
        return None

    #cleans old and unusable data from the database
    #   note: DOES NOT CLEAR ENTIRE DATABASE
    def cleanupDatabase(self):
        cursor = self.sql.cursor()

        #set time holders
        cur_datetime = datetime.now(tz=ZoneInfo("UTC"))
        yesterday_date = cur_datetime - timedelta(days=1)
        yesterday_date = yesterday_date.date()

        print(yesterday_date)

        #cleanup old events
        cursor.execute('''
            DELETE FROM CelestialEvent
            WHERE end_datetime < ?;
        ''', ( cur_datetime.strftime('%Y-%m-%d %H:M:%S'), ))
        self.sql.commit()

        #cleanup locationDates with old dates (cascading deals with weather)
        cursor.execute('''
            DELETE FROM LocationDate
            WHERE view_date < ?
            ''', (yesterday_date.strftime('%Y-%m-%d'),))

        #remove all locations with no references
        cursor.execute('''
            DELETE FROM Location
            WHERE loc_id NOT IN (SELECT loc_id FROM CelestialEvent)
            AND loc_id NOT IN (SELECT loc_id FROM LocationDate)
        ''')
        #Should be good.  Commit
        cursor.close()
        self.sql.commit()
        print("Commited cleaned database")
        
    #loads all openMeteoData into database
    def _loadOpenMeteoData(self, meteoData, loc_id):
        #create new cursor
        cursor = self.sql.cursor()
             
        #compute day
        daily = meteoData.Daily()
        daily_sunrise = daily.Variables(0).ValuesInt64AsNumpy().tolist()
        daily_sunset = daily.Variables(1).ValuesInt64AsNumpy().tolist()
        
        day_start = daily.Time()
        day_end = daily.TimeEnd()
        day_interval = daily.Interval()

        hourly = meteoData.Hourly()
        hourly_temp = hourly.Variables(0).ValuesAsNumpy().tolist()
        hourly_precipitation_prob = hourly.Variables(1).ValuesAsNumpy().tolist()
        hourly_weather_code = hourly.Variables(2).ValuesAsNumpy().tolist()
        hourly_cloud_cover = hourly.Variables(3).ValuesAsNumpy().tolist()
        hourly_vis = hourly.Variables(4).ValuesAsNumpy().tolist()

        for day in range(day_start, day_end, day_interval):
            i = (day - day_start) // day_interval #just to keep track of indexes

            #insert into LocationDate
            cursor.execute('''
                INSERT OR REPLACE INTO LocationDate (loc_id, view_date, sunrise, sunset) VALUES
                           (?, date(?, 'unixepoch'), time(?, 'unixepoch'), time(?, 'unixepoch'))
                           ''', (loc_id, day, daily_sunrise[i], daily_sunset[i]))
            #get loc_date_id for weather
            cursor.fetchall()
            cursor.execute('''
                SELECT loc_date_id FROM
                           (SELECT loc_date_id, loc_id, view_date FROM LocationDate
                           WHERE loc_id = ? AND view_date = date(?, 'unixepoch'))
                           ''', (loc_id, day))
            loc_date_id = cursor.fetchone()[0]

            for hour in range(24):
                hour_index_offset = (i - 1) * 24
                hour_index = hour_index_offset + hour
                time = day + (hourly.Interval() * hour)

                temp = hourly_temp[hour_index]
                cloud_cover = hourly_cloud_cover[hour_index]
                visibility = hourly_vis[hour_index]
                precipitation_prob = hourly_precipitation_prob[hour_index]

                #insert into Weather
                cursor.execute('''
                    INSERT INTO Weather (loc_date_id, hr, temp, cloud_cover, visibility, chance_precipitation) VALUES
                               (?, ?, ? ,? ,? , ?)
                               ''', (loc_date_id, hour, temp, cloud_cover, visibility, precipitation_prob))

        cursor.close()

    #loads CelestialEvents in database based on skyfield information
    def _loadCelestialEvents(self, loc_id, lat, lon, time_start, time_end):
            #set cursor
            sql_cursor = self.sql.cursor()
            
            curLocation = wgs84.latlon(lat,lon)

            #load planets
            sf_planets = sf_load(config.BSP_PATH)
            earth = sf_planets['earth']

            #print off if rising or not
            for planet in astObj.PLANETS:
                    target = sf_planets[planet.sf_name]

                    #gets ast_obj_id from sql file
                    ast_obj_id = sql_cursor.execute('''
                            SELECT ast_obj_id FROM AstroObject
                            WHERE skyfield_name = ?
                            ''', [planet.sf_name])
                    ast_obj_id = sql_cursor.fetchone()
                    if ast_obj_id == None: #object doesn't exist yet.  Insert simple version without display_info
                            print("Inserting non-existant AstroObject", planet.ad_name)
                            sql_cursor.execute('''
                                    INSERT INTO AstroObject (skyfield_name, display_name)
                                    VALUES (?,?)
                                    ''', [planet.sf_name, planet.ad_name])
                            self.sql.commit()
                            sql_cursor.execute('''
                                    SELECT ast_obj_id FROM AstroObject
                                    WHERE skyfield_name = ?
                                    ''', [planet.sf_name])
                            ast_obj_id = sql_cursor.fetchone()
                    ast_obj_id = ast_obj_id[0]


                    #set triggers
                    testFunc = risings_and_settings(sf_planets, target, curLocation)
                    

                    #find rise and set events
                    rises_at = time_start.tt #set to current time as default (doesn't matter if it really started earlier right?)
                    for t, is_rising in zip(*find_discrete(time_start,time_end, testFunc)):
                            #note that t is in Julian date format, which is in days that need to be converted
                            selected_time = t.tt

                            if (is_rising):
                                    rises_at = selected_time
                            else: # not is_rising or in other words, setting
                                    sets_at = selected_time
                                    sql_cursor.execute(''' INSERT OR IGNORE INTO CelestialEvent (loc_id, ast_obj_id, start_datetime, end_datetime) VALUES
                                                    (?, ?, datetime(?, 'julianday'), datetime(?, 'julianday'))
                                                    ''', [loc_id,ast_obj_id, rises_at, sets_at])
            
            #cleanup (still part of function)
            sql_cursor.close()
            self.sql.commit()

    # Returns raw open meteo data pulled from the website
    def _getOpenMeteoUpdate(lat, lon):# Setup the Open-Meteo API client with cache and retry on error
        cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
        retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
        openmeteo = openmeteo_requests.Client(session = retry_session)

        # Make sure all required weather variables are listed here
        # The order of variables in hourly or daily is important to assign them correctly below
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": ["sunrise", "sunset"],
            "hourly": ["temperature_2m", "precipitation_probability", "weather_code", "cloud_cover", "visibility"],
            "timezone": "GMT",
            "wind_speed_unit": "mph",
            "temperature_unit": "fahrenheit",
            "precipitation_unit": "inch",
            "forecast_days": 14
        }
        return openmeteo.weather_api(url, params = params)[0]

    def _exec_SQL_file(self, fileName):
        #prep variables
        file = open(fileName)
        cursor = self.sql.cursor()

        #call script
        cursor.executescript(file.read())
        self.sql.commit()
        
        #cleanup
        cursor.close()
        file.close()

    def _check_database_ready(self):
        return os.access(self.DB_PATH, os.F_OK)