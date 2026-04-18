import { Redirect } from "expo-router";
import { useAuth } from "@/src/auth/auth-context";

export default function Index() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? ("/(tabs)" as any) : "/onboarding"} />;
}

