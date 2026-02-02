import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingTauranga() {
  const city = getCityBySlug("tauranga");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
