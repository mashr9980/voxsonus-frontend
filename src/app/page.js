import { LandingPage } from "@/components/landing-page";
import { getServerAuthData } from "@/lib/server-auth";

export default async function Home() {
  return <LandingPage />;
}
