import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingAuckland() {
  const city = getCityBySlug("auckland");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
