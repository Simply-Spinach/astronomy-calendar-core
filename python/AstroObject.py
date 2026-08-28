from enum import Enum

class AO_type(Enum):
        PLANET = 0
        MOON = 1
        DWARF_PLANET = 2

#general "struct" to help bridge the gap between astrodata and skyfield data
class AstroObject:
        def __init__(self, ad_name, sf_name, type):
                self.sf_name = sf_name
                self.ad_name = ad_name
                self.type = type

PLANETS = [
        AstroObject('mercury', 'mercury',AO_type.PLANET), 
        AstroObject('venus', 'venus', AO_type.PLANET),
        AstroObject('moon', 'moon', AO_type.MOON), 
        AstroObject('mars', 'mars barycenter', AO_type.PLANET),
        AstroObject('jupiter', 'jupiter barycenter', AO_type.PLANET),
        AstroObject('saturn', 'saturn barycenter', AO_type.PLANET),
        AstroObject('uranus', 'uranus barycenter', AO_type.PLANET),
        AstroObject('neptune', 'neptune barycenter', AO_type.PLANET),
        AstroObject('pluto', 'pluto barycenter', AO_type.DWARF_PLANET)
        ]