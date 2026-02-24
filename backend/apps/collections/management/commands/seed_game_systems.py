from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.collections.models import GameSystem, Faction, CatalogMiniature, Tag


# ───────────────────────────────────────────
# GAME SYSTEMS
# ───────────────────────────────────────────

GAME_SYSTEMS = [
    {'name': 'Warhammer 40,000', 'description': 'In the grim darkness of the far future, there is only war.'},
    {'name': 'Warhammer Age of Sigmar', 'description': 'Epic fantasy battles in the Mortal Realms.'},
    {'name': 'Horus Heresy', 'description': 'Wage war in the era of the Horus Heresy.'},
    {'name': 'Middle-Earth Strategy Battle Game', 'description': 'Recreate the battles of Middle-earth.'},
    {'name': 'Necromunda', 'description': 'Gang warfare in the underhive.'},
    {'name': 'Kill Team', 'description': 'Small-scale tactical combat in the 41st Millennium.'},
    {'name': 'Warcry', 'description': 'Fast-paced skirmish combat in the Mortal Realms.'},
    {'name': 'Blood Bowl', 'description': 'Fantasy football with a violent twist.'},
    {'name': 'Warhammer The Old World', 'description': 'Classic Warhammer Fantasy rank-and-file battles.'},
    {'name': 'Warhammer Underworlds', 'description': 'Competitive tactical arena combat.'},
]

# ───────────────────────────────────────────
# FACTIONS — { game_system_name: [{ name, category }] }
# ───────────────────────────────────────────

FACTIONS = {
    'Warhammer 40,000': [
        # Imperium
        {'name': 'Ultramarines', 'category': 'imperium'},
        {'name': 'Blood Angels', 'category': 'imperium'},
        {'name': 'Dark Angels', 'category': 'imperium'},
        {'name': 'Space Wolves', 'category': 'imperium'},
        {'name': 'Black Templars', 'category': 'imperium'},
        {'name': 'Imperial Fists', 'category': 'imperium'},
        {'name': 'Iron Hands', 'category': 'imperium'},
        {'name': 'Salamanders', 'category': 'imperium'},
        {'name': 'Raven Guard', 'category': 'imperium'},
        {'name': 'White Scars', 'category': 'imperium'},
        {'name': 'Deathwatch', 'category': 'imperium'},
        {'name': 'Grey Knights', 'category': 'imperium'},
        {'name': 'Adeptus Custodes', 'category': 'imperium'},
        {'name': 'Adepta Sororitas', 'category': 'imperium'},
        {'name': 'Astra Militarum', 'category': 'imperium'},
        {'name': 'Adeptus Mechanicus', 'category': 'imperium'},
        {'name': 'Imperial Knights', 'category': 'imperium'},
        {'name': 'Imperial Agents', 'category': 'imperium'},
        # Chaos
        {'name': 'Chaos Space Marines', 'category': 'chaos'},
        {'name': 'Death Guard', 'category': 'chaos'},
        {'name': 'Thousand Sons', 'category': 'chaos'},
        {'name': 'World Eaters', 'category': 'chaos'},
        {'name': 'Chaos Daemons', 'category': 'chaos'},
        {'name': 'Chaos Knights', 'category': 'chaos'},
        # Xenos
        {'name': 'Aeldari', 'category': 'xenos'},
        {'name': 'Drukhari', 'category': 'xenos'},
        {'name': 'Harlequins', 'category': 'xenos'},
        {'name': 'Ynnari', 'category': 'xenos'},
        {'name': 'Orks', 'category': 'xenos'},
        {'name': 'Tyranids', 'category': 'xenos'},
        {'name': 'Genestealer Cults', 'category': 'xenos'},
        {'name': 'Necrons', 'category': 'xenos'},
        {'name': "T'au Empire", 'category': 'xenos'},
        {'name': 'Leagues of Votann', 'category': 'xenos'},
    ],
    'Warhammer Age of Sigmar': [
        # Order
        {'name': 'Stormcast Eternals', 'category': 'order'},
        {'name': 'Cities of Sigmar', 'category': 'order'},
        {'name': 'Fyreslayers', 'category': 'order'},
        {'name': 'Kharadron Overlords', 'category': 'order'},
        {'name': 'Lumineth Realm-Lords', 'category': 'order'},
        {'name': 'Idoneth Deepkin', 'category': 'order'},
        {'name': 'Sylvaneth', 'category': 'order'},
        {'name': 'Daughters of Khaine', 'category': 'order'},
        {'name': 'Seraphon', 'category': 'order'},
        # Chaos
        {'name': 'Slaves to Darkness', 'category': 'chaos'},
        {'name': 'Blades of Khorne', 'category': 'chaos'},
        {'name': 'Disciples of Tzeentch', 'category': 'chaos'},
        {'name': 'Maggotkin of Nurgle', 'category': 'chaos'},
        {'name': 'Hedonites of Slaanesh', 'category': 'chaos'},
        {'name': 'Skaven', 'category': 'chaos'},
        {'name': 'Beasts of Chaos', 'category': 'chaos'},
        # Death
        {'name': 'Ossiarch Bonereapers', 'category': 'death'},
        {'name': 'Soulblight Gravelords', 'category': 'death'},
        {'name': 'Nighthaunt', 'category': 'death'},
        {'name': 'Flesh-Eater Courts', 'category': 'death'},
        # Destruction
        {'name': 'Orruk Warclans', 'category': 'destruction'},
        {'name': 'Gloomspite Gitz', 'category': 'destruction'},
        {'name': 'Ogor Mawtribes', 'category': 'destruction'},
        {'name': 'Sons of Behemat', 'category': 'destruction'},
    ],
    'Horus Heresy': [
        {'name': 'Dark Angels (I)', 'category': 'imperium'},
        {'name': 'Emperor\'s Children (III)', 'category': 'chaos'},
        {'name': 'Iron Warriors (IV)', 'category': 'chaos'},
        {'name': 'White Scars (V)', 'category': 'imperium'},
        {'name': 'Space Wolves (VI)', 'category': 'imperium'},
        {'name': 'Imperial Fists (VII)', 'category': 'imperium'},
        {'name': 'Night Lords (VIII)', 'category': 'chaos'},
        {'name': 'Blood Angels (IX)', 'category': 'imperium'},
        {'name': 'Iron Hands (X)', 'category': 'imperium'},
        {'name': 'World Eaters (XII)', 'category': 'chaos'},
        {'name': 'Ultramarines (XIII)', 'category': 'imperium'},
        {'name': 'Death Guard (XIV)', 'category': 'chaos'},
        {'name': 'Thousand Sons (XV)', 'category': 'chaos'},
        {'name': 'Sons of Horus (XVI)', 'category': 'chaos'},
        {'name': 'Word Bearers (XVII)', 'category': 'chaos'},
        {'name': 'Salamanders (XVIII)', 'category': 'imperium'},
        {'name': 'Raven Guard (XIX)', 'category': 'imperium'},
        {'name': 'Alpha Legion (XX)', 'category': 'neutral'},
        {'name': 'Solar Auxilia', 'category': 'imperium'},
        {'name': 'Mechanicum', 'category': 'imperium'},
        {'name': 'Custodes', 'category': 'imperium'},
    ],
    'Middle-Earth Strategy Battle Game': [
        {'name': 'Gondor', 'category': 'good'},
        {'name': 'Rohan', 'category': 'good'},
        {'name': 'The Fellowship', 'category': 'good'},
        {'name': 'Rivendell', 'category': 'good'},
        {'name': 'Lothlórien', 'category': 'good'},
        {'name': 'The Shire', 'category': 'good'},
        {'name': 'Númenor', 'category': 'good'},
        {'name': 'Khazâd-dûm', 'category': 'good'},
        {'name': 'Mordor', 'category': 'evil'},
        {'name': 'Isengard', 'category': 'evil'},
        {'name': 'Moria', 'category': 'evil'},
        {'name': 'Angmar', 'category': 'evil'},
        {'name': 'Harad', 'category': 'evil'},
        {'name': 'Easterlings', 'category': 'evil'},
    ],
}

# ───────────────────────────────────────────
# CATALOG MINIATURES — { faction_name: [{ name, unit_type, points }] }
# Only a representative sample per faction
# ───────────────────────────────────────────

CATALOG = {
    # ── 40K Imperium ──
    'Ultramarines': [
        {'name': 'Marneus Calgar', 'name_es': 'Marneus Calgar', 'unit_type': 'HQ', 'points': 200, 'tags': ['Character', 'Primarch Champion', 'Infantry']},
        {'name': 'Chief Librarian Tigurius', 'name_es': 'Bibliotecario Jefe Tigurius', 'unit_type': 'HQ', 'points': 150, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Roboute Guilliman', 'name_es': 'Roboute Guilliman', 'unit_type': 'HQ', 'points': 350, 'tags': ['Character', 'Primarch', 'Monster']},
        {'name': 'Intercessor Squad', 'name_es': 'Escuadra de Intercesores', 'unit_type': 'Troops', 'points': 100, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Assault Intercessor Squad', 'name_es': 'Escuadra de Intercesores de Asalto', 'unit_type': 'Troops', 'points': 90, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Bladeguard Veterans', 'name_es': 'Veteranos Bladeguard', 'unit_type': 'Elites', 'points': 120, 'tags': ['Infantry']},
        {'name': 'Redemptor Dreadnought', 'name_es': 'Dreadnought Redemptor', 'unit_type': 'Elites', 'points': 195, 'tags': ['Vehicle', 'Walker']},
        {'name': 'Eradicator Squad', 'name_es': 'Escuadra de Erradicadores', 'unit_type': 'Heavy Support', 'points': 95, 'tags': ['Infantry', 'Anti-Tank']},
        {'name': 'Gladiator Lancer', 'name_es': 'Gladiator Lancer', 'unit_type': 'Heavy Support', 'points': 160, 'tags': ['Vehicle']},
        {'name': 'Outrider Squad', 'name_es': 'Escuadra de Avanzadilla', 'unit_type': 'Fast Attack', 'points': 120, 'tags': ['Mounted', 'Infantry']},
    ],
    'Blood Angels': [
        {'name': 'Commander Dante', 'name_es': 'Comandante Dante', 'unit_type': 'HQ', 'points': 185, 'tags': ['Character', 'Fly', 'Infantry']},
        {'name': 'Sanguinary Priest', 'name_es': 'Sacerdote Sanguinario', 'unit_type': 'HQ', 'points': 120, 'tags': ['Character', 'Infantry']},
        {'name': 'The Sanguinor', 'name_es': 'El Sanguinor', 'unit_type': 'HQ', 'points': 150, 'tags': ['Character', 'Fly', 'Infantry']},
        {'name': 'Death Company Intercessors', 'name_es': 'Intercesores de la Compañía de la Muerte', 'unit_type': 'Elites', 'points': 155, 'tags': ['Infantry']},
        {'name': 'Sanguinary Guard', 'name_es': 'Guardia Sanguinaria', 'unit_type': 'Elites', 'points': 140, 'tags': ['Infantry', 'Fly']},
        {'name': 'Furioso Dreadnought', 'name_es': 'Dreadnought Furioso', 'unit_type': 'Elites', 'points': 150, 'tags': ['Vehicle', 'Walker']},
        {'name': 'Baal Predator', 'name_es': 'Predator Baal', 'unit_type': 'Fast Attack', 'points': 130, 'tags': ['Vehicle']},
        {'name': 'Intercessor Squad', 'name_es': 'Escuadra de Intercesores', 'unit_type': 'Troops', 'points': 100, 'tags': ['Infantry', 'Battleline']},
    ],
    # ── 40K Chaos ──
    'Thousand Sons': [
        {'name': 'Magnus the Red', 'name_es': 'Magnus el Rojo', 'unit_type': 'HQ', 'points': 410, 'tags': ['Character', 'Primarch', 'Psyker', 'Monster', 'Daemon', 'Fly']},
        {'name': 'Ahriman', 'name_es': 'Ahriman', 'unit_type': 'HQ', 'points': 130, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Infernal Master', 'name_es': 'Maestro Infernal', 'unit_type': 'HQ', 'points': 90, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Exalted Sorcerer', 'name_es': 'Hechicero Exaltado', 'unit_type': 'HQ', 'points': 100, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Rubric Marines', 'name_es': 'Marines Rúbrica', 'unit_type': 'Troops', 'points': 105, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Scarab Occult Terminators', 'name_es': 'Exterminadores Escarabeo Oculto', 'unit_type': 'Elites', 'points': 200, 'tags': ['Infantry', 'Terminator']},
        {'name': 'Tzaangor Enlightened', 'name_es': 'Tzaangor Iluminados', 'unit_type': 'Fast Attack', 'points': 55, 'tags': ['Mounted', 'Fly']},
        {'name': 'Tzaangors', 'name_es': 'Tzaangors', 'unit_type': 'Troops', 'points': 70, 'tags': ['Infantry']},
        {'name': 'Mutalith Vortex Beast', 'name_es': 'Bestia Vórtice Mutalith', 'unit_type': 'Heavy Support', 'points': 145, 'tags': ['Monster', 'Daemon']},
        {'name': 'Heldrake', 'name_es': 'Heldrake', 'unit_type': 'Fast Attack', 'points': 170, 'tags': ['Vehicle', 'Daemon', 'Fly']},
    ],
    'Chaos Space Marines': [
        {'name': 'Abaddon the Despoiler', 'name_es': 'Abaddon el Saqueador', 'unit_type': 'HQ', 'points': 280, 'tags': ['Character', 'Infantry']},
        {'name': 'Master of Possession', 'name_es': 'Señor de la Posesión', 'unit_type': 'HQ', 'points': 100, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Dark Apostle', 'name_es': 'Apóstol Oscuro', 'unit_type': 'HQ', 'points': 95, 'tags': ['Character', 'Infantry']},
        {'name': 'Chaos Lord', 'name_es': 'Señor del Caos', 'unit_type': 'HQ', 'points': 90, 'tags': ['Character', 'Infantry']},
        {'name': 'Legionaries', 'name_es': 'Legionarios', 'unit_type': 'Troops', 'points': 90, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Chosen', 'name_es': 'Elegidos', 'unit_type': 'Elites', 'points': 130, 'tags': ['Infantry']},
        {'name': 'Possessed', 'name_es': 'Poseídos', 'unit_type': 'Elites', 'points': 140, 'tags': ['Infantry', 'Daemon']},
        {'name': 'Havocs', 'name_es': 'Havocs', 'unit_type': 'Heavy Support', 'points': 130, 'tags': ['Infantry']},
        {'name': 'Obliterators', 'name_es': 'Obliteradores', 'unit_type': 'Heavy Support', 'points': 165, 'tags': ['Infantry']},
        {'name': 'Raptors', 'name_es': 'Raptores', 'unit_type': 'Fast Attack', 'points': 95, 'tags': ['Infantry', 'Fly']},
        {'name': 'Forgefiend', 'name_es': 'Forgefiend', 'unit_type': 'Heavy Support', 'points': 145, 'tags': ['Vehicle', 'Daemon']},
    ],
    'Death Guard': [
        {'name': 'Mortarion', 'name_es': 'Mortarion', 'unit_type': 'HQ', 'points': 370, 'tags': ['Character', 'Primarch', 'Monster', 'Daemon', 'Fly', 'Psyker']},
        {'name': 'Lord of Contagion', 'name_es': 'Señor del Contagio', 'unit_type': 'HQ', 'points': 120, 'tags': ['Character', 'Infantry', 'Terminator']},
        {'name': 'Typhus', 'name_es': 'Typhus', 'unit_type': 'HQ', 'points': 160, 'tags': ['Character', 'Psyker', 'Infantry', 'Terminator']},
        {'name': 'Plague Marines', 'name_es': 'Marines de la Plaga', 'unit_type': 'Troops', 'points': 105, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Poxwalkers', 'name_es': 'Caminantes Pútridos', 'unit_type': 'Troops', 'points': 50, 'tags': ['Infantry']},
        {'name': 'Blightlord Terminators', 'name_es': 'Exterminadores Señores de la Peste', 'unit_type': 'Elites', 'points': 200, 'tags': ['Infantry', 'Terminator']},
        {'name': 'Plagueburst Crawler', 'name_es': 'Reptador Plagueburst', 'unit_type': 'Heavy Support', 'points': 175, 'tags': ['Vehicle', 'Daemon']},
        {'name': 'Myphitic Blight-hauler', 'name_es': 'Transportador Mífico de Peste', 'unit_type': 'Fast Attack', 'points': 100, 'tags': ['Vehicle', 'Daemon']},
    ],
    'World Eaters': [
        {'name': 'Angron', 'name_es': 'Angron', 'unit_type': 'HQ', 'points': 415, 'tags': ['Character', 'Primarch', 'Monster', 'Daemon', 'Fly']},
        {'name': 'World Eaters Lord on Juggernaut', 'name_es': 'Señor Devorador de Mundos en Juggernaut', 'unit_type': 'HQ', 'points': 110, 'tags': ['Character', 'Mounted']},
        {'name': 'Khorne Berserkers', 'name_es': 'Berserkers de Khorne', 'unit_type': 'Troops', 'points': 90, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Jakhals', 'name_es': 'Jakhals', 'unit_type': 'Troops', 'points': 65, 'tags': ['Infantry']},
        {'name': 'Eightbound', 'name_es': 'Ocho Encadenados', 'unit_type': 'Elites', 'points': 155, 'tags': ['Infantry', 'Daemon']},
        {'name': 'Exalted Eightbound', 'name_es': 'Ocho Encadenados Exaltados', 'unit_type': 'Elites', 'points': 160, 'tags': ['Infantry', 'Daemon']},
    ],
    # ── 40K Xenos ──
    'Necrons': [
        {'name': 'The Silent King', 'name_es': 'El Rey Silencioso', 'unit_type': 'HQ', 'points': 420, 'tags': ['Character', 'Vehicle', 'Fly']},
        {'name': 'Overlord', 'name_es': 'Overlord', 'unit_type': 'HQ', 'points': 85, 'tags': ['Character', 'Infantry']},
        {'name': 'Chronomancer', 'name_es': 'Cronomante', 'unit_type': 'HQ', 'points': 70, 'tags': ['Character', 'Infantry']},
        {'name': 'Necron Warriors', 'name_es': 'Guerreros Necrones', 'unit_type': 'Troops', 'points': 120, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Immortals', 'name_es': 'Inmortales', 'unit_type': 'Troops', 'points': 75, 'tags': ['Infantry']},
        {'name': 'Lychguard', 'name_es': 'Guardia Lych', 'unit_type': 'Elites', 'points': 100, 'tags': ['Infantry']},
        {'name': 'Skorpekh Destroyers', 'name_es': 'Destructores Skorpekh', 'unit_type': 'Elites', 'points': 90, 'tags': ['Infantry']},
        {'name': 'Canoptek Wraiths', 'name_es': 'Espectros Canoptek', 'unit_type': 'Fast Attack', 'points': 120, 'tags': ['Beast']},
        {'name': 'Doomsday Ark', 'name_es': 'Arca del Juicio Final', 'unit_type': 'Heavy Support', 'points': 175, 'tags': ['Vehicle', 'Fly']},
    ],
    'Tyranids': [
        {'name': 'Hive Tyrant', 'name_es': 'Tirano de Enjambre', 'unit_type': 'HQ', 'points': 235, 'tags': ['Character', 'Monster', 'Psyker']},
        {'name': 'Broodlord', 'name_es': 'Señor de la Prole', 'unit_type': 'HQ', 'points': 100, 'tags': ['Character', 'Infantry', 'Psyker']},
        {'name': 'Neurothrope', 'name_es': 'Neurotropo', 'unit_type': 'HQ', 'points': 70, 'tags': ['Character', 'Infantry', 'Psyker', 'Fly']},
        {'name': 'Termagants', 'name_es': 'Termagantes', 'unit_type': 'Troops', 'points': 75, 'tags': ['Infantry', 'Battleline', 'Swarm']},
        {'name': 'Hormagaunts', 'name_es': 'Hormagantes', 'unit_type': 'Troops', 'points': 65, 'tags': ['Infantry', 'Battleline', 'Swarm']},
        {'name': 'Genestealers', 'name_es': 'Genestealers', 'unit_type': 'Troops', 'points': 90, 'tags': ['Infantry']},
        {'name': 'Hive Guard', 'name_es': 'Guardia del Enjambre', 'unit_type': 'Elites', 'points': 100, 'tags': ['Infantry']},
        {'name': 'Carnifex', 'name_es': 'Carnifex', 'unit_type': 'Heavy Support', 'points': 125, 'tags': ['Monster']},
        {'name': 'Exocrine', 'name_es': 'Exocrino', 'unit_type': 'Heavy Support', 'points': 135, 'tags': ['Monster']},
        {'name': 'Tyrannofex', 'name_es': 'Tyrannofex', 'unit_type': 'Heavy Support', 'points': 190, 'tags': ['Monster']},
    ],
    'Orks': [
        {'name': 'Ghazghkull Thraka', 'name_es': 'Ghazghkull Thraka', 'unit_type': 'HQ', 'points': 235, 'tags': ['Character', 'Monster']},
        {'name': 'Warboss', 'name_es': 'Jefe de Guerra', 'unit_type': 'HQ', 'points': 70, 'tags': ['Character', 'Infantry']},
        {'name': 'Weirdboy', 'name_es': 'Weirdboy', 'unit_type': 'HQ', 'points': 70, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Boyz', 'name_es': 'Chikoz', 'unit_type': 'Troops', 'points': 75, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Gretchin', 'name_es': 'Gretchin', 'unit_type': 'Troops', 'points': 40, 'tags': ['Infantry', 'Swarm']},
        {'name': 'Meganobz', 'name_es': 'Meganobz', 'unit_type': 'Elites', 'points': 100, 'tags': ['Infantry']},
        {'name': 'Deff Dread', 'name_es': 'Deff Dread', 'unit_type': 'Elites', 'points': 75, 'tags': ['Vehicle', 'Walker']},
        {'name': 'Lootas', 'name_es': 'Lootas', 'unit_type': 'Heavy Support', 'points': 55, 'tags': ['Infantry']},
        {'name': 'Stormboyz', 'name_es': 'Stormboyz', 'unit_type': 'Fast Attack', 'points': 55, 'tags': ['Infantry', 'Fly']},
    ],
    "T'au Empire": [
        {'name': 'Commander Shadowsun', 'name_es': 'Comandante Shadowsun', 'unit_type': 'HQ', 'points': 130, 'tags': ['Character', 'Infantry', 'Battlesuit']},
        {'name': 'Commander in Coldstar', 'name_es': 'Comandante en Coldstar', 'unit_type': 'HQ', 'points': 120, 'tags': ['Character', 'Infantry', 'Battlesuit', 'Fly']},
        {'name': 'Ethereal', 'name_es': 'Etéreo', 'unit_type': 'HQ', 'points': 65, 'tags': ['Character', 'Infantry']},
        {'name': 'Fire Warriors', 'name_es': 'Guerreros de Fuego', 'unit_type': 'Troops', 'points': 80, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Crisis Battlesuits', 'name_es': 'Battlesuit Crisis', 'unit_type': 'Elites', 'points': 185, 'tags': ['Infantry', 'Battlesuit', 'Fly']},
        {'name': 'Riptide Battlesuit', 'name_es': 'Battlesuit Riptide', 'unit_type': 'Heavy Support', 'points': 240, 'tags': ['Monster', 'Battlesuit']},
        {'name': 'Broadside Battlesuits', 'name_es': 'Battlesuit Broadside', 'unit_type': 'Heavy Support', 'points': 90, 'tags': ['Infantry', 'Battlesuit']},
        {'name': 'Pathfinder Team', 'name_es': 'Equipo de Exploradores', 'unit_type': 'Fast Attack', 'points': 90, 'tags': ['Infantry']},
    ],
    'Aeldari': [
        {'name': 'Avatar of Khaine', 'name_es': 'Avatar de Khaine', 'unit_type': 'HQ', 'points': 270, 'tags': ['Character', 'Monster', 'Daemon']},
        {'name': 'Farseer', 'name_es': 'Vidente', 'unit_type': 'HQ', 'points': 90, 'tags': ['Character', 'Psyker', 'Infantry']},
        {'name': 'Autarch', 'name_es': 'Autarca', 'unit_type': 'HQ', 'points': 90, 'tags': ['Character', 'Infantry']},
        {'name': 'Guardian Defenders', 'name_es': 'Guardianes Defensores', 'unit_type': 'Troops', 'points': 110, 'tags': ['Infantry', 'Battleline']},
        {'name': 'Rangers', 'name_es': 'Rangers', 'unit_type': 'Troops', 'points': 55, 'tags': ['Infantry']},
        {'name': 'Dire Avengers', 'name_es': 'Vengadores Temibles', 'unit_type': 'Troops', 'points': 75, 'tags': ['Infantry']},
        {'name': 'Wraithguard', 'name_es': 'Guardia Espectral', 'unit_type': 'Elites', 'points': 160, 'tags': ['Infantry']},
        {'name': 'Wraithlord', 'name_es': 'Señor Espectral', 'unit_type': 'Heavy Support', 'points': 135, 'tags': ['Monster', 'Walker']},
        {'name': 'War Walker', 'name_es': 'Caminante de Guerra', 'unit_type': 'Heavy Support', 'points': 80, 'tags': ['Vehicle', 'Walker']},
        {'name': 'Windriders', 'name_es': 'Jinetes del Viento', 'unit_type': 'Fast Attack', 'points': 80, 'tags': ['Mounted', 'Fly']},
    ],
    # ── Age of Sigmar ──
    'Stormcast Eternals': [
        {'name': 'Lord-Celestant on Stardrake', 'name_es': 'Lord-Celestant en Stardrake', 'unit_type': 'Leader', 'points': 500, 'tags': ['Character', 'Monster']},
        {'name': 'Lord-Relictor', 'name_es': 'Lord-Relictor', 'unit_type': 'Leader', 'points': 145, 'tags': ['Character']},
        {'name': 'Knight-Incantor', 'name_es': 'Caballero-Incantor', 'unit_type': 'Leader', 'points': 125, 'tags': ['Character', 'Wizard']},
        {'name': 'Liberators', 'name_es': 'Liberadores', 'unit_type': 'Battleline', 'points': 120, 'tags': ['Battleline']},
        {'name': 'Vindictors', 'name_es': 'Vindictors', 'unit_type': 'Battleline', 'points': 130, 'tags': ['Battleline']},
        {'name': 'Sequitors', 'name_es': 'Sequitors', 'unit_type': 'Battleline', 'points': 120, 'tags': ['Battleline']},
        {'name': 'Retributors', 'name_es': 'Retributors', 'unit_type': 'Elites', 'points': 210, 'tags': []},
        {'name': 'Annihilators', 'name_es': 'Aniquiladores', 'unit_type': 'Elites', 'points': 200, 'tags': []},
    ],
    'Slaves to Darkness': [
        {'name': 'Archaon the Everchosen', 'name_es': 'Archaon el Elegido Eterno', 'unit_type': 'Leader', 'points': 800, 'tags': ['Character', 'Monster']},
        {'name': 'Chaos Lord', 'name_es': 'Señor del Caos', 'unit_type': 'Leader', 'points': 115, 'tags': ['Character']},
        {'name': 'Chaos Sorcerer Lord', 'name_es': 'Hechicero Señor del Caos', 'unit_type': 'Leader', 'points': 120, 'tags': ['Character', 'Wizard']},
        {'name': 'Chaos Warriors', 'name_es': 'Guerreros del Caos', 'unit_type': 'Battleline', 'points': 200, 'tags': ['Battleline']},
        {'name': 'Chaos Knights', 'name_es': 'Caballeros del Caos', 'unit_type': 'Battleline', 'points': 210, 'tags': ['Mounted', 'Battleline']},
        {'name': 'Chaos Chosen', 'name_es': 'Elegidos del Caos', 'unit_type': 'Elites', 'points': 260, 'tags': []},
        {'name': 'Varanguard', 'name_es': 'Varanguard', 'unit_type': 'Elites', 'points': 280, 'tags': ['Mounted']},
    ],
    # ── Middle-Earth ──
    'Gondor': [
        {'name': 'Aragorn, King Elessar', 'name_es': 'Aragorn, Rey Elessar', 'unit_type': 'Hero', 'points': 200, 'tags': ['Character', 'Hero of Legend']},
        {'name': 'Boromir, Captain of the White Tower', 'name_es': 'Boromir, Capitán de la Torre Blanca', 'unit_type': 'Hero', 'points': 95, 'tags': ['Character']},
        {'name': 'Faramir', 'name_es': 'Faramir', 'unit_type': 'Hero', 'points': 80, 'tags': ['Character']},
        {'name': 'Warriors of Minas Tirith', 'name_es': 'Guerreros de Minas Tirith', 'unit_type': 'Warrior', 'points': 8, 'tags': ['Infantry']},
        {'name': 'Rangers of Gondor', 'name_es': 'Montaraces de Gondor', 'unit_type': 'Warrior', 'points': 9, 'tags': ['Infantry']},
        {'name': 'Knights of Minas Tirith', 'name_es': 'Caballeros de Minas Tirith', 'unit_type': 'Warrior', 'points': 14, 'tags': ['Mounted']},
        {'name': 'Guards of the Fountain Court', 'name_es': 'Guardia de la Corte de la Fuente', 'unit_type': 'Warrior', 'points': 11, 'tags': ['Infantry']},
    ],
    'Mordor': [
        {'name': 'Sauron, The Dark Lord', 'name_es': 'Sauron, El Señor Oscuro', 'unit_type': 'Hero', 'points': 400, 'tags': ['Character', 'Hero of Legend', 'Monster']},
        {'name': 'The Witch-king of Angmar', 'name_es': 'El Rey Brujo de Angmar', 'unit_type': 'Hero', 'points': 80, 'tags': ['Character', 'Psyker']},
        {'name': 'Gothmog', 'name_es': 'Gothmog', 'unit_type': 'Hero', 'points': 75, 'tags': ['Character']},
        {'name': 'Mordor Orcs', 'name_es': 'Orcos de Mordor', 'unit_type': 'Warrior', 'points': 5, 'tags': ['Infantry']},
        {'name': 'Morannon Orcs', 'name_es': 'Orcos de Morannon', 'unit_type': 'Warrior', 'points': 8, 'tags': ['Infantry']},
        {'name': 'Mordor Trolls', 'name_es': 'Trolls de Mordor', 'unit_type': 'Warrior', 'points': 100, 'tags': ['Monster']},
    ],
}


class Command(BaseCommand):
    help = 'Seed the database with game systems, factions, and catalog miniatures'

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('\n═══ Seeding Game Systems ═══'))
        gs_map = {}
        for gs_data in GAME_SYSTEMS:
            obj, created = GameSystem.objects.get_or_create(
                slug=slugify(gs_data['name']),
                defaults={'name': gs_data['name'], 'description': gs_data['description']},
            )
            gs_map[gs_data['name']] = obj
            status = self.style.SUCCESS('Created') if created else 'Exists'
            self.stdout.write(f'  {status}: {gs_data["name"]}')

        self.stdout.write(self.style.HTTP_INFO('\n═══ Seeding Factions ═══'))
        faction_map = {}
        for gs_name, factions in FACTIONS.items():
            gs = gs_map.get(gs_name)
            if not gs:
                continue
            for f_data in factions:
                obj, created = Faction.objects.get_or_create(
                    game_system=gs,
                    slug=slugify(f_data['name']),
                    defaults={
                        'name': f_data['name'],
                        'category': f_data['category'],
                    },
                )
                faction_map[f_data['name']] = obj
                status = self.style.SUCCESS('Created') if created else 'Exists'
                self.stdout.write(f'  {status}: {f_data["name"]} ({gs_name})')

        self.stdout.write(self.style.HTTP_INFO('\n═══ Seeding Catalog Miniatures ═══'))
        mini_count = 0
        for faction_name, minis in CATALOG.items():
            faction = faction_map.get(faction_name)
            if not faction:
                self.stdout.write(self.style.WARNING(f'  Faction not found: {faction_name}'))
                continue
            for m_data in minis:
                obj, created = CatalogMiniature.objects.get_or_create(
                    faction=faction,
                    slug=slugify(m_data['name']),
                    defaults={
                        'name': m_data['name'],
                        'name_es': m_data.get('name_es', ''),
                        'unit_type': m_data.get('unit_type', ''),
                        'default_points': m_data.get('points', 0),
                    },
                )
                if created:
                    mini_count += 1

                # Always set tags (auto-tags + explicit tags)
                explicit_tags = m_data.get('tags', [])
                auto_tag_names = [
                    faction.name,
                    faction.category.capitalize(),
                    faction.game_system.name,
                ]
                if m_data.get('unit_type'):
                    auto_tag_names.append(m_data['unit_type'])

                all_tag_names = list(set(auto_tag_names + explicit_tags))
                tags = []
                for tag_name in all_tag_names:
                    tag, _ = Tag.objects.get_or_create(
                        slug=slugify(tag_name),
                        defaults={'name': tag_name},
                    )
                    tags.append(tag)
                obj.tags.set(tags)

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Done. Created {mini_count} catalog miniatures.'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'  Tags in database: {Tag.objects.count()}'
        ))

