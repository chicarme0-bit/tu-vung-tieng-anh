import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthForm mode="register" />;
}
