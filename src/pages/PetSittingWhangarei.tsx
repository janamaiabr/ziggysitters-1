import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingWhangarei() {
  const city = getCityBySlug("whangarei");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
