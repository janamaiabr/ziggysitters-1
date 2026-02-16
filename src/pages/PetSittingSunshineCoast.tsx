import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingSunshineCoast() {
  const city = getCityBySlug("sunshine-coast");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
