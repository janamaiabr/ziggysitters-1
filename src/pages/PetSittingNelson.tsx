import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingNelson() {
  const city = getCityBySlug("nelson");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
