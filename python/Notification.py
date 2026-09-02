from AstroData import AstroData
import config

from dataclasses import dataclass
import json

@dataclass
class Notification:
    header: str
    content: str
    img_path: str = None

def createNotification():
    #init db
    astroData = AstroData()

    with open(config.SETTINGS_PATH, 'r') as settings:
        for loc_id in settings['recommendations']['favorite_locations']:
            astroData.setLocationById(loc_id)
            astroData.updateDatabase()