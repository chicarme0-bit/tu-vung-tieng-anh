import { SettingsPanel } from "@/components/dashboard/settings-panel";

export const dynamic = "force-static";

export default function SettingsPage() {
  return <SettingsPanel currentHint={null} />;
}
