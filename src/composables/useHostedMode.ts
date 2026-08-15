export type HostedConfig = {
  contract_version: number;
  mode: "hosted";
  app_key: string;
  spoolman_base_url: string;
  app_base_path: string;
};

export type HostedWindow = Window & {
  __SPOOLMAN_HOSTED__?: HostedConfig;
  __SPOOLMAN_HOSTED_THEME__?: "light" | "dark";
  // Filaman-specific hosted mode globals (checked first; same HostedConfig contract)
  __FILAMAN_HOSTED__?: HostedConfig;
  __FILAMAN_HOSTED_THEME__?: "light" | "dark";
};

export const getHostedConfig = () => {
  const win = window as HostedWindow;
  return win.__FILAMAN_HOSTED__ ?? win.__SPOOLMAN_HOSTED__ ?? null;
};

export const isHostedMode = () => Boolean(getHostedConfig());

export const getHostedTheme = () => {
  const win = window as HostedWindow;
  const hostedTheme = win.__FILAMAN_HOSTED_THEME__ ?? win.__SPOOLMAN_HOSTED_THEME__;
  if (hostedTheme === "light" || hostedTheme === "dark") {
    return hostedTheme;
  }

  const params = new URLSearchParams(window.location.search);
  const queryTheme = params.get("filaman_theme") ?? params.get("spoolman_theme");
  return queryTheme === "light" || queryTheme === "dark" ? queryTheme : null;
};
