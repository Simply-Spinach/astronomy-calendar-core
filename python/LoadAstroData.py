#import base functionality
import AstroData as ad
import config

import sys
import warnings


def loadAstroData():
    astroData = ad.AstroData()
    if (len(sys.argv) >= 3):
        astroData.cleanupOldData()
        astroData.setLocation(sys.argv[1], sys.argv[2])
    else:
            warnings.warn("Location not provided.  Using default location", UserWarning)
    astroData.updateDatabase()
    astroData.cleanupDatabase()

def cleanupAstroData():
     astroData = ad.AstroData()
     astroData.cleanupDatabase()