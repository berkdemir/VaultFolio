export interface VaultFolioSettings {
  portfolioFolder: string;
  githubRepo: string;
  githubToken: string;
  siteName: string;
  theme: string;
}

export const DEFAULT_SETTINGS: VaultFolioSettings = {
  portfolioFolder: "portfolio",
  githubRepo: "",
  githubToken: "",
  siteName: "My Portfolio",
  theme: "default",
};
