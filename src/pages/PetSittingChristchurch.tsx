import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingChristchurch() {
  const city = getCityBySlug("christchurch");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
