#import base functionality
from AstroData import AstroData
import config

import sys
import warnings


def loadAstroData():
    astroData = AstroData()
    if (len(sys.argv) >= 3):
        astroData.setLocation(sys.argv[1], sys.argv[2])
    else:
            warnings.warn("Location not provided.  Using default location", UserWarning)
    astroData.updateDatabase()
    astroData.cleanupDatabase()

def cleanupAstroData():
     astroData = AstroData()
     astroData.cleanupDatabase()