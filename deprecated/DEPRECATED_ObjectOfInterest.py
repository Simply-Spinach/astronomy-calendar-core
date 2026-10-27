PLANETS = [
        ObjectOfInterest('mercury', 'mercury',AO_type.PLANET), 
        ObjectOfInterest('venus', 'venus', AO_type.PLANET),
        ObjectOfInterest('moon', 'moon', AO_type.MOON), 
        ObjectOfInterest('mars', 'mars barycenter', AO_type.PLANET),
        ObjectOfInterest('jupiter', 'jupiter barycenter', AO_type.PLANET),
        ObjectOfInterest('saturn', 'saturn barycenter', AO_type.PLANET),
        ObjectOfInterest('uranus', 'uranus barycenter', AO_type.PLANET),
        ObjectOfInterest('neptune', 'neptune barycenter', AO_type.PLANET),
        ObjectOfInterest('pluto', 'pluto barycenter', AO_type.DWARF_PLANET)
        ]

class ObjectOfInterest:
        def __init__(self, name, info):
                self.display_name = name
                self.display_info = info

        def save(self, cursor)
