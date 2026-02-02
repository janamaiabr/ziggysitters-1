import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingDunedin() {
  const city = getCityBySlug("dunedin");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
