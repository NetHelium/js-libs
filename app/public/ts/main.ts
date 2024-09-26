import { githubIcon, loadIcons, moonIcon, sunIcon } from "@net-helium/ui/icons";
import "@net-helium/ui/components/icon";

// Load icons that can be used with the `nh-icon` component
loadIcons({ github: githubIcon, "dark-mode": moonIcon, "light-mode": sunIcon });

const themeButton = document.querySelector<HTMLButtonElement>("#theme-switch")!;
const nhIcon = themeButton.querySelector("nh-icon")!;

// Switch between light and dark themes
themeButton.addEventListener("click", () => {
  if (document.documentElement.classList.contains("dark-theme")) {
    document.documentElement.classList.remove("dark-theme");
    nhIcon.name = "light-mode";
  } else {
    document.documentElement.classList.add("dark-theme");
    nhIcon.name = "dark-mode";
  }
});
