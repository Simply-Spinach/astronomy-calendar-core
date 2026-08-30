import AstroData as ad
import config

from dataclasses import dataclass

@dataclass
class Notification:
    header: str
    content: str
    img_path: str = None

def createNotification():
    #init db
    ad.AstroData()