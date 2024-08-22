import { loadTranslations } from "@net-helium/lib/i18n";
import handleLegacySyntax from "./legacy";
import "./hc-form";
import en from "./i18n/en.json";
import fr from "./i18n/fr.json";

// Load the translations in the i18n store
loadTranslations({ en, fr });

// Handle deprecated syntax on a specific event
window.addEventListener("load-hc-forms", () => {
  handleLegacySyntax();
});

// Handle deprecated syntax on first load
handleLegacySyntax();
