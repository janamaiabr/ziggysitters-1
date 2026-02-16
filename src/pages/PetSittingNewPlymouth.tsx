import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingNewPlymouth() {
  const city = getCityBySlug("new-plymouth");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
