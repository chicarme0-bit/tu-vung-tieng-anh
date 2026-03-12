import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { requireSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireSessionUser();

  return <SettingsPanel currentHint={user.settings?.geminiKeyHint ?? null} />;
}
