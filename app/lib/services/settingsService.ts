import { SettingsRepository } from "../repositories/settingsRepository";
import { StoreSettings, UpdateSettingsRequest } from "../types/settings";

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "Bhakthi Bookshelf",
  contact_email: null,
  contact_phone: null,
  address: null,
  gst_number: null,
  app_commerce_enabled: false,
  kannada_ui_enabled: false,
  updated_at: new Date().toISOString(),
};

export class SettingsService {
  static async getSettings(): Promise<StoreSettings> {
    const settings = await SettingsRepository.getSettings();

    // Falls back to sane defaults if the migration hasn't been run yet,
    // rather than crashing the Settings page.
    return settings ?? DEFAULT_SETTINGS;
  }

  /**
   * Whether the Android app may show prices and sell. Read on every
   * page render (root layout); any failure means read-only, the safe
   * side for Play Store policy.
   */
  static async isAppCommerceEnabled(): Promise<boolean> {
    try {
      const settings = await SettingsRepository.getSettings();
      return settings?.app_commerce_enabled === true;
    } catch {
      return false;
    }
  }

  /**
   * Whether choosing ಕನ್ನಡ also translates the website interface (it
   * always filters books). Off unless the admin turns it on; any read
   * failure means off (English UI).
   */
  static async isKannadaUiEnabled(): Promise<boolean> {
    try {
      const settings = await SettingsRepository.getSettings();
      return settings?.kannada_ui_enabled === true;
    } catch {
      return false;
    }
  }

  static async setKannadaUiEnabled(enabled: boolean) {
    const updated = await SettingsRepository.setKannadaUiEnabled(enabled);

    if (!updated) {
      throw new Error("Settings row not found.");
    }

    console.log(
      `[settings] Kannada website interface ${enabled ? "ENABLED" : "disabled"}`
    );

    return updated.kannada_ui_enabled as boolean;
  }

  static async setAppCommerceEnabled(enabled: boolean) {
    const updated = await SettingsRepository.setAppCommerceEnabled(enabled);

    if (!updated) {
      throw new Error("Settings row not found.");
    }

    console.log(
      `[settings] in-app buying ${enabled ? "ENABLED" : "disabled"} for the Android app`
    );

    return updated.app_commerce_enabled as boolean;
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
