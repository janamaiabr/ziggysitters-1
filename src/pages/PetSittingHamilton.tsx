import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingHamilton() {
  const city = getCityBySlug("hamilton");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
