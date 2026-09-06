import { SettingsRepository } from "../repositories/settingsRepository";
import { StoreSettings, UpdateSettingsRequest } from "../types/settings";

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "Bhakthi Bookshelf",
  contact_email: null,
  contact_phone: null,
  address: null,
  gst_number: null,
  updated_at: new Date().toISOString(),
};

export class SettingsService {
  static async getSettings(): Promise<StoreSettings> {
    const settings = await SettingsRepository.getSettings();

    // Falls back to sane defaults if the migration hasn't been run yet,
    // rather than crashing the Settings page.
    return settings ?? DEFAULT_SETTINGS;
  }

  static async updateSettings(
    data: UpdateSettingsRequest
  ): Promise<StoreSettings> {
    if (!data.store_name || !data.store_name.trim()) {
      throw new Error("Store name is required");
    }

    const updated = await SettingsRepository.updateSettings({
      store_name: data.store_name.trim(),
      contact_email: data.contact_email?.trim() || null,
      contact_phone: data.contact_phone?.trim() || null,
      address: data.address?.trim() || null,
      gst_number: data.gst_number?.trim() || null,
    });

    if (!updated) {
      throw new Error(
        "Settings row not found. Run database/migrations/007_settings.sql first."
      );
    }

    return updated;
  }
}
