import { loadTranslations } from "@net-helium/lib/i18n";
import "./legacy";
import "./hc-form";
import en from "./i18n/en.json";
import fr from "./i18n/fr.json";

// Load the translations in the i18n store
loadTranslations({ en, fr });
