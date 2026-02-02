import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingWellington() {
  const city = getCityBySlug("wellington");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
