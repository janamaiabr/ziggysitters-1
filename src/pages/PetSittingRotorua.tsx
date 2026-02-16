import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingRotorua() {
  const city = getCityBySlug("rotorua");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
