export interface CityData {
  slug: string;
  name: string;
  maoriName: string;
  heroDescription: string;
  neighborhoods: string[];
  parks: string[];
  vetInfo: string;
  localContext: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export const cities: CityData[] = [
  {
    slug: "auckland",
    name: "Auckland",
    maoriName: "Tamaki Makaurau",
    heroDescription: "New Zealand\u2019s largest city is home to thousands of pet-loving families. Whether you live in Ponsonby, Remuera, or out on the North Shore, finding a trusted local pet sitter has never been easier.",
    neighborhoods: ["Ponsonby", "Grey Lynn", "Remuera", "Mt Eden", "Devonport", "Takapuna", "Mission Bay", "Howick", "Henderson", "Manukau"],
    parks: ["Cornwall Park", "Western Springs", "Meola Reef Dog Park", "Barry Curtis Park", "Long Bay Regional Park", "Bastion Point"],
    vetInfo: "Auckland has excellent emergency vet care available 24/7, including Auckland Emergency Veterinary Clinic in Grey Lynn and After Hours Veterinary Clinic in Newmarket.",
    localContext: "Auckland pet owners love the outdoor lifestyle \u2014 from beach walks at Takapuna to forest trails in the Waitakere Ranges. Our local sitters know the best dog-friendly spots, understand the humid summer climate, and can navigate Auckland traffic to get your pet to their vet appointment on time.",
    metaTitle: "Pet Sitting in Auckland \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Auckland, NZ. Local, vetted, 100% NZ-based sitters for dogs, cats and all pets. Daily photo updates. Book your Auckland pet sitter today!",
    metaKeywords: "pet sitting auckland, dog sitter auckland, cat sitter auckland, pet care auckland, house sitting auckland, pet sitter near me auckland"
  },
  {
    slug: "wellington",
    name: "Wellington",
    maoriName: "Te Whanganui-a-Tara",
    heroDescription: "The capital city punches well above its weight when it comes to pet-friendly living. From the wind-swept hills of Kelburn to the harbourside paths of Oriental Bay, Wellington pets live their best lives.",
    neighborhoods: ["Kelburn", "Thorndon", "Mt Victoria", "Island Bay", "Karori", "Newtown", "Miramar", "Petone", "Brooklyn", "Hataitai"],
    parks: ["Otari-Wilton Bush", "Botanic Garden", "Zealandia", "Red Rocks Reserve", "Makara Peak Mountain Bike Park", "Waitangi Park"],
    vetInfo: "Wellington is well served by veterinary clinics, including Wellington After Hours Veterinary Emergency Centre and numerous clinics across the suburban centres.",
    localContext: "Wellington is famously hilly and windy \u2014 your pet sitter needs to know the sheltered walk routes and the best cafes that welcome dogs. Our local sitters understand the unique Wellington lifestyle, from navigating steep streets to knowing which beaches are off-leash friendly.",
    metaTitle: "Pet Sitting in Wellington \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Wellington, NZ. Local, vetted, 100% NZ-based sitters who know the capital. Daily photo updates. Book your Wellington pet sitter today!",
    metaKeywords: "pet sitting wellington, dog sitter wellington, cat sitter wellington, pet care wellington, house sitting wellington, pet sitter near me wellington"
  },
  {
    slug: "christchurch",
    name: "Christchurch",
    maoriName: "Otautahi",
    heroDescription: "The Garden City is a paradise for pets with its wide open spaces and beautiful parks. Whether you are in Merivale, Riccarton, or Sumner, Christchurch has a growing community of dedicated pet sitters ready to care for your furry family.",
    neighborhoods: ["Merivale", "Riccarton", "Sumner", "Fendalton", "Cashmere", "St Albans", "Lyttelton", "New Brighton", "Papanui", "Halswell"],
    parks: ["Hagley Park", "Bottle Lake Forest", "Groynes Park", "Spencer Park", "Travis Wetland", "Victoria Park"],
    vetInfo: "Christchurch has reliable emergency vet services, including the Canterbury Veterinary Emergency Centre and After Hours Vet Christchurch, available for urgent pet care needs.",
    localContext: "Christchurch pets enjoy the flattest city in NZ \u2014 perfect for long walks and bike rides alongside your dog. Our local sitters know the best off-leash areas, understand the Canterbury weather extremes from frosty mornings to hot nor-westers, and are familiar with the city\u2019s rebuilt pet-friendly amenities.",
    metaTitle: "Pet Sitting in Christchurch \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Christchurch, NZ. Local, vetted, 100% NZ-based sitters in the Garden City. Daily photo updates. Book your Christchurch pet sitter today!",
    metaKeywords: "pet sitting christchurch, dog sitter christchurch, cat sitter christchurch, pet care christchurch, house sitting christchurch, pet sitter near me christchurch"
  },
  {
    slug: "hamilton",
    name: "Hamilton",
    maoriName: "Kirikiriroa",
    heroDescription: "The heart of the Waikato is a thriving hub for pet owners. With the mighty Waikato River running through the city and plenty of green spaces, Hamilton is a wonderful place to raise pets \u2014 and find great sitters.",
    neighborhoods: ["Hamilton East", "Hillcrest", "Rototuna", "Dinsdale", "Chartwell", "Flagstaff", "Nawton", "Hamilton Lake", "Claudelands", "Fairfield"],
    parks: ["Hamilton Gardens", "Hamilton Lake Domain", "Waikato River Trails", "Taitua Arboretum", "Claudelands Park", "Minogue Park"],
    vetInfo: "Hamilton has several excellent veterinary clinics including Hamilton Veterinary Centre and after-hours services through Waikato Veterinary Emergency Clinic.",
    localContext: "Hamilton pet owners enjoy a relaxed pace of life with easy access to green spaces and river walks. Our local sitters understand the Waikato climate, know the best riverside walking trails, and are familiar with Hamilton\u2019s pet-friendly community events and dog parks.",
    metaTitle: "Pet Sitting in Hamilton \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Hamilton, NZ. Local, vetted, 100% NZ-based sitters in the Waikato. Daily photo updates. Book your Hamilton pet sitter today!",
    metaKeywords: "pet sitting hamilton, dog sitter hamilton, cat sitter hamilton nz, pet care hamilton, house sitting hamilton nz, pet sitter near me hamilton"
  },
  {
    slug: "tauranga",
    name: "Tauranga",
    maoriName: "Tauranga Moana",
    heroDescription: "The sunny Bay of Plenty is one of NZ\u2019s fastest-growing cities and a fantastic place for pets. Beach walks at Mount Maunganui, bush trails, and a warm climate make Tauranga a pet paradise.",
    neighborhoods: ["Mount Maunganui", "Papamoa", "Bethlehem", "Otumoetai", "Welcome Bay", "Greerton", "Pyes Pa", "Te Puke", "Tauriko", "Gate Pa"],
    parks: ["Mount Maunganui Beach", "McLaren Falls Park", "Memorial Park", "Kulim Park", "Waimapu Estuary Walk", "Papamoa Hills Regional Park"],
    vetInfo: "Tauranga is served by excellent vet clinics including Tauranga Veterinary Centre and emergency after-hours care at Bay of Plenty Veterinary Emergency Centre.",
    localContext: "Tauranga pets enjoy the best weather in NZ with stunning beaches and coastal walks. Our local sitters know which beaches allow dogs, understand the summer heat safety precautions, and are familiar with the relaxed Bay of Plenty lifestyle that your pets love.",
    metaTitle: "Pet Sitting in Tauranga \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Tauranga, NZ. Local, vetted, 100% NZ-based sitters in the Bay of Plenty. Daily photo updates. Book your Tauranga pet sitter today!",
    metaKeywords: "pet sitting tauranga, dog sitter tauranga, cat sitter tauranga, pet care tauranga, house sitting tauranga, pet sitter near me tauranga"
  },
  {
    slug: "dunedin",
    name: "Dunedin",
    maoriName: "Otepoti",
    heroDescription: "The Edinburgh of the South has a vibrant and caring pet community. With rugged coastlines, stunning wildlife, and a close-knit community, Dunedin pets are surrounded by nature and love.",
    neighborhoods: ["St Clair", "Roslyn", "Maori Hill", "North East Valley", "South Dunedin", "Port Chalmers", "St Kilda", "Caversham", "Mornington", "Andersons Bay"],
    parks: ["Botanic Garden", "Tunnel Beach", "Signal Hill Reserve", "Ross Creek Reservoir", "Woodhaugh Gardens", "Chingford Park"],
    vetInfo: "Dunedin has reliable veterinary services including Dunedin Veterinary Centre and emergency care through After Hours Veterinary Dunedin for urgent needs.",
    localContext: "Dunedin pets experience the unique southern climate with cool winters and mild summers. Our local sitters understand the hilly terrain, know the best coastal walks, and appreciate the close-knit community feel that makes Dunedin special for pet owners.",
    metaTitle: "Pet Sitting in Dunedin \u2014 Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Dunedin, NZ. Local, vetted, 100% NZ-based sitters in Otago. Daily photo updates. Book your Dunedin pet sitter today!",
    metaKeywords: "pet sitting dunedin, dog sitter dunedin, cat sitter dunedin, pet care dunedin, house sitting dunedin, pet sitter near me dunedin"
  },
  {
    slug: "sunshine-coast",
    name: "Sunshine Coast",
    maoriName: "",
    heroDescription: "The Sunshine Coast is one of Queensland's most pet-friendly regions. From the beaches of Noosa to the hinterland of Maleny, finding a trusted local pet sitter for your furry family is easy.",
    neighborhoods: ["Noosa Heads", "Maroochydore", "Caloundra", "Mooloolaba", "Buderim", "Nambour", "Coolum Beach", "Peregian Beach", "Maleny", "Montville"],
    parks: ["Noosa National Park", "Maroochy Bushland Botanic Garden", "Mooloolah River National Park", "Kondalilla National Park", "Mary Cairncross Scenic Reserve", "Cotton Tree Park"],
    vetInfo: "The Sunshine Coast has excellent veterinary care including Sunshine Coast Animal Emergency Service and numerous local clinics across the region.",
    localContext: "Sunshine Coast pets enjoy a subtropical lifestyle with stunning beaches, hinterland trails, and year-round warm weather. Our local sitters know the best off-leash beaches, understand tick and snake safety, and are familiar with the relaxed coastal lifestyle your pets love.",
    metaTitle: "Pet Sitting on Sunshine Coast — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters on the Sunshine Coast, QLD. Local, vetted sitters for dogs, cats and all pets. Daily photo updates. Book your Sunshine Coast pet sitter today!",
    metaKeywords: "pet sitting sunshine coast, dog sitter sunshine coast, cat sitter sunshine coast, pet care sunshine coast qld, pet sitter near me sunshine coast"
  }
  {
    slug: "napier",
    name: "Napier",
    maoriName: "Ahuriri",
    heroDescription: "The Art Deco Capital of the world is also a wonderful place for pets. With warm Hawke's Bay sunshine, coastal walks, and a relaxed seaside lifestyle, Napier pet owners enjoy a vibrant community of trusted local sitters.",
    neighborhoods: ["Ahuriri", "Bluff Hill", "Marewa", "Taradale", "Greenmeadows", "Westshore", "Hospital Hill", "Napier South", "Maraenui", "Bay View"],
    parks: ["Marine Parade", "Bluff Hill Domain", "Park Island", "Anderson Park", "Centennial Gardens", "Ahuriri Estuary Walk"],
    vetInfo: "Napier has reliable veterinary services including Napier Veterinary Centre and Hawke's Bay Veterinary Emergency services for after-hours urgent care.",
    localContext: "Napier pets thrive in the warm, dry Hawke's Bay climate with stunning coastal walks along Marine Parade and the Ahuriri estuary. Our local sitters know the best dog-friendly beaches, understand the summer heat precautions, and are familiar with the relaxed Art Deco city lifestyle that makes Napier special for pet families.",
    metaTitle: "Pet Sitting in Napier — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Napier, NZ. Local, vetted, 100% NZ-based sitters in Hawke's Bay. Daily photo updates. Book your Napier pet sitter today!",
    metaKeywords: "pet sitting napier, dog sitter napier, cat sitter napier, pet care napier, house sitting napier, pet sitter near me napier"
  },
  {
    slug: "nelson",
    name: "Nelson",
    maoriName: "Whakatū",
    heroDescription: "New Zealand's sunniest city is a pet lover's dream. Nestled between golden beaches and lush national parks, Nelson offers an outdoor lifestyle that pets and their owners adore.",
    neighborhoods: ["The Wood", "Stoke", "Tahunanui", "Atawhai", "Richmond", "Enner Glynn", "Maitai", "Tōtaranui", "Britannia Heights", "Monaco"],
    parks: ["Tahunanui Beach Reserve", "Miyazu Gardens", "Maitai Valley Walk", "Grampians Reserve", "Isel Park", "Queens Gardens"],
    vetInfo: "Nelson is well served by veterinary clinics including Nelson Veterinary Centre and after-hours emergency services available through the Tasman region.",
    localContext: "Nelson pets enjoy the most sunshine hours in NZ with beautiful beaches at Tahunanui and bush walks in the Maitai Valley. Our local sitters understand the region's mild climate, know the best off-leash areas, and appreciate the creative, outdoorsy community that defines Nelson living.",
    metaTitle: "Pet Sitting in Nelson — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Nelson, NZ. Local, vetted, 100% NZ-based sitters in NZ's sunniest city. Daily photo updates. Book your Nelson pet sitter today!",
    metaKeywords: "pet sitting nelson, dog sitter nelson, cat sitter nelson nz, pet care nelson, house sitting nelson nz, pet sitter near me nelson"
  },
  {
    slug: "new-plymouth",
    name: "New Plymouth",
    maoriName: "Ngāmotu",
    heroDescription: "Taranaki's coastal gem offers pets an incredible lifestyle with stunning mountain views and beautiful walkways. From the Coastal Walkway to the slopes of Mount Taranaki, New Plymouth is a paradise for active pets and their families.",
    neighborhoods: ["Fitzroy", "Merrilands", "Vogeltown", "Westown", "Brooklands", "Bell Block", "Strandon", "Welbourn", "Moturoa", "Highlands Park"],
    parks: ["Coastal Walkway", "Pukekura Park", "Brooklands Park", "East End Reserve", "Kawaroa Park", "Fitzroy Beach"],
    vetInfo: "New Plymouth has excellent veterinary care including Taranaki Veterinary Centre and emergency after-hours services available for urgent pet care needs.",
    localContext: "New Plymouth pets love the iconic Coastal Walkway — one of NZ's best urban walks. Our local sitters know the Taranaki weather patterns, from mountain mist to sunny coast days, understand the best dog-friendly beaches, and are part of the tight-knit Taranaki pet community.",
    metaTitle: "Pet Sitting in New Plymouth — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in New Plymouth, NZ. Local, vetted, 100% NZ-based sitters in Taranaki. Daily photo updates. Book your New Plymouth pet sitter today!",
    metaKeywords: "pet sitting new plymouth, dog sitter new plymouth, cat sitter new plymouth, pet care new plymouth, house sitting new plymouth, pet sitter near me new plymouth"
  },
  {
    slug: "palmerston-north",
    name: "Palmerston North",
    maoriName: "Te Papa-i-oea",
    heroDescription: "The student city with a big heart for pets. Home to Massey University's renowned veterinary school, Palmerston North has one of NZ's most pet-savvy communities and plenty of green spaces for furry friends.",
    neighborhoods: ["Hokowhitu", "Terrace End", "Kelvin Grove", "Awapuni", "Milson", "Highbury", "Roslyn", "Fitzherbert", "Takaro", "Cloverlea"],
    parks: ["Victoria Esplanade", "Lido Aquatic Centre Gardens", "Bledisloe Park", "Ahimate Park", "Memorial Park", "Manawatū River Walkway"],
    vetInfo: "Palmerston North is home to Massey University Veterinary Teaching Hospital — one of the best in the Southern Hemisphere — plus numerous local clinics and 24/7 emergency care.",
    localContext: "Palmerston North is uniquely pet-friendly thanks to Massey University's vet school creating a community that truly understands animal care. Our local sitters benefit from this expertise, know the beautiful Manawatū River trails, and understand the region's variable weather from windy days to calm riverside walks.",
    metaTitle: "Pet Sitting in Palmerston North — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Palmerston North, NZ. Local, vetted, 100% NZ-based sitters in the Manawatū. Daily photo updates. Book your Palmy pet sitter today!",
    metaKeywords: "pet sitting palmerston north, dog sitter palmerston north, cat sitter palmerston north, pet care palmerston north, house sitting palmerston north, pet sitter near me palmerston north"
  },
  {
    slug: "queenstown",
    name: "Queenstown",
    maoriName: "Tāhuna",
    heroDescription: "The adventure capital of the world is also home to pet owners who love the great outdoors. Surrounded by mountains, lakes, and trails, Queenstown pets live an extraordinary alpine lifestyle.",
    neighborhoods: ["Frankton", "Kelvin Heights", "Arthurs Point", "Sunshine Bay", "Fernhill", "Queenstown Hill", "Lake Hayes Estate", "Jacks Point", "Shotover Country", "Arrowtown"],
    parks: ["Queenstown Gardens", "Frankton Arm Walk", "Ben Lomond Track", "Lake Hayes Walk", "Queenstown Trail", "Arrowtown Bush Creek"],
    vetInfo: "Queenstown has reliable veterinary services including Queenstown Vet Centre and Remarkables Vet Centre, with emergency services available in the wider Otago region.",
    localContext: "Queenstown pets enjoy an unparalleled mountain and lakeside lifestyle. Our local sitters understand the alpine climate with cold winters and warm summers, know the best walking trails around Lake Wakatipu, and are experienced with both resident pets and those visiting with travelling families.",
    metaTitle: "Pet Sitting in Queenstown — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Queenstown, NZ. Local, vetted, 100% NZ-based sitters in the adventure capital. Daily photo updates. Book your Queenstown pet sitter today!",
    metaKeywords: "pet sitting queenstown, dog sitter queenstown, cat sitter queenstown, pet care queenstown, house sitting queenstown, pet sitter near me queenstown"
  },
  {
    slug: "rotorua",
    name: "Rotorua",
    maoriName: "Te Rotorua-nui-a-Kahumatamomoe",
    heroDescription: "The geothermal heart of New Zealand offers pets a unique living experience. With beautiful lakes, ancient forests, and a strong Māori cultural heritage, Rotorua is a special place for pet-loving families.",
    neighborhoods: ["Ōhinemutu", "Kuirau", "Glenholme", "Fenton Park", "Lynmore", "Ngongotahā", "Holdens Bay", "Kawaha Point", "Western Heights", "Fairy Springs"],
    parks: ["Kuirau Park", "Government Gardens", "Redwoods Whakarewarewa Forest", "Lake Rotorua Walkway", "Sulphur Point", "Tikitapu (Blue Lake)"],
    vetInfo: "Rotorua is served by several veterinary clinics including Rotorua Veterinary Centre and Lakes Veterinary Services, with emergency care available for urgent needs.",
    localContext: "Rotorua pets enjoy unique surroundings — from forest walks in the famous Redwoods to lakeside strolls. Our local sitters understand the geothermal hazards to keep pets safe, know the best trails in Whakarewarewa Forest, and appreciate the warm, community-oriented lifestyle that Rotorua is known for.",
    metaTitle: "Pet Sitting in Rotorua — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Rotorua, NZ. Local, vetted, 100% NZ-based sitters in the Bay of Plenty. Daily photo updates. Book your Rotorua pet sitter today!",
    metaKeywords: "pet sitting rotorua, dog sitter rotorua, cat sitter rotorua, pet care rotorua, house sitting rotorua, pet sitter near me rotorua"
  },
  {
    slug: "whangarei",
    name: "Whangarei",
    maoriName: "Whangārei",
    heroDescription: "Northland's largest city is a subtropical paradise for pets. With beautiful harbour walks, bush-clad hills, and a warm climate year-round, Whangarei pet owners enjoy an enviable outdoor lifestyle.",
    neighborhoods: ["Tikipunga", "Kamo", "Onerahi", "Morningside", "Regent", "Woodhill", "Raumanga", "Maunu", "Whau Valley", "Riverside"],
    parks: ["Whangarei Falls", "Hatea River Walk", "AH Reed Memorial Kauri Park", "Mair Park", "Parihaka Reserve", "Town Basin Marina Walk"],
    vetInfo: "Whangarei has reliable veterinary services including Whangarei Veterinary Centre and Northland emergency vet services available for after-hours urgent pet care.",
    localContext: "Whangarei pets enjoy a subtropical climate with lush surroundings. Our local sitters know the best walking spots from Whangarei Falls to the Hatea Loop, understand the warm Northland weather and its effects on pets, and are part of the friendly, relaxed Northland community.",
    metaTitle: "Pet Sitting in Whangarei — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Whangarei, NZ. Local, vetted, 100% NZ-based sitters in Northland. Daily photo updates. Book your Whangarei pet sitter today!",
    metaKeywords: "pet sitting whangarei, dog sitter whangarei, cat sitter whangarei, pet care whangarei, house sitting whangarei, pet sitter near me whangarei"
  },
  {
    slug: "hastings",
    name: "Hastings",
    maoriName: "Heretaunga",
    heroDescription: "The fruit bowl of New Zealand is also a wonderful place for pets. With warm Hawke's Bay weather, rural charm meets urban convenience, and a growing community of pet lovers who care deeply about their animals.",
    neighborhoods: ["Havelock North", "Flaxmere", "St Leonards", "Mahora", "Parkvale", "Raureka", "Akina", "Camberley", "Tomoana", "Karamu"],
    parks: ["Cornwall Park", "Windsor Park", "Frimley Park", "Havelock North Village Green", "Te Mata Peak", "Tuki Tuki River Trail"],
    vetInfo: "Hastings has excellent veterinary care including Hastings Veterinary Centre and Hawke's Bay emergency veterinary services for urgent after-hours pet care.",
    localContext: "Hastings pets enjoy the best of both worlds — rural Hawke's Bay charm with all the amenities of a thriving town. Our local sitters know the walking trails around Te Mata Peak, understand the hot Hawke's Bay summers, and are familiar with the orchard-lined streets and community parks that make Hastings a great place for pet families.",
    metaTitle: "Pet Sitting in Hastings — Trusted Local Sitters | ZiggySitters",
    metaDescription: "Find trusted pet sitters in Hastings, NZ. Local, vetted, 100% NZ-based sitters in Hawke's Bay. Daily photo updates. Book your Hastings pet sitter today!",
    metaKeywords: "pet sitting hastings, dog sitter hastings nz, cat sitter hastings, pet care hastings, house sitting hastings nz, pet sitter near me hastings"
  }
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find(c => c.slug === slug);
}
