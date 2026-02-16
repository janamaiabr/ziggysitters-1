import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingHastings() {
  const city = getCityBySlug("hastings");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
