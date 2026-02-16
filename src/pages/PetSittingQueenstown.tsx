import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingQueenstown() {
  const city = getCityBySlug("queenstown");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
