import SettingsForm from "@/app/components/admin/SettingsForm";
import { SettingsService } from "@/app/lib/services/settingsService";

export default async function AdminSettingsPage() {
  const settings = await SettingsService.getSettings();

  return (
    <div>
      <h1
        style={{
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        Settings
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Store details shown to customers and used on invoices.
      </p>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 30,
        }}
      >
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
