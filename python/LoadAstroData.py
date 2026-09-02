#import base functionality
from AstroData import AstroData
import config

import sys
import warnings

#loads database with latest data from provided coordinates or location name
def loadAstroData(lat=None, lon=None, loc_name=None):
    astroData = AstroData()
    if (loc_name != None):
         astroData.setLocationByName(loc_name)
    else: #should mean lat and lon are not set to none
        astroData.setLocationByCoords(lat, lon)
    astroData.updateDatabase()
    astroData.cleanupDatabase()

def cleanupAstroData():
     astroData = AstroData()
     astroData.cleanupDatabase()