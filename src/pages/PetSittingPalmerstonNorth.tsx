import CityLandingPage from "@/components/city/CityLandingPage";
import { getCityBySlug } from "@/data/cityData";

export default function PetSittingPalmerstonNorth() {
  const city = getCityBySlug("palmerston-north");
  if (!city) return null;
  return <CityLandingPage city={city} />;
}
