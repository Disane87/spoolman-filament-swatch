export type HostedConfig = {
  contract_version: number;
  mode: "hosted";
  app_key: string;
  spoolman_base_url: string;
  app_base_path: string;
};

type HostedWindow = Window & {
  __SPOOLMAN_HOSTED__?: HostedConfig;
  __SPOOLMAN_HOSTED_THEME__?: "light" | "dark";
};

export const getHostedConfig = () => (window as HostedWindow).__SPOOLMAN_HOSTED__ ?? null;

export const isHostedMode = () => Boolean(getHostedConfig() || new URLSearchParams(window.location.search).get("spoolman_hosted"));

export const getHostedTheme = () => {
  const hostedTheme = (window as HostedWindow).__SPOOLMAN_HOSTED_THEME__;
  if (hostedTheme === "light" || hostedTheme === "dark") {
    return hostedTheme;
  }

  const queryTheme = new URLSearchParams(window.location.search).get("spoolman_theme");
  return queryTheme === "light" || queryTheme === "dark" ? queryTheme : null;
};
