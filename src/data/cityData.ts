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
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find(c => c.slug === slug);
}
