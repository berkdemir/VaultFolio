import { SiteFile } from "./builder";

export interface DeployConfig {
  githubToken: string;
  githubRepo: string;   // "owner/repo"
  githubBranch?: string; // defaults to "gh-pages"
}

export interface DeployResult {
  success: boolean;
  message: string;
  url?: string;
}

/**
 * Deploys generated site files to a GitHub Pages branch via the GitHub Contents API.
 * Each file is created/updated individually using base64-encoded content.
 */
export async function deploySite(
  files: SiteFile[],
  config: DeployConfig
): Promise<DeployResult> {
  if (!config.githubToken || !config.githubRepo) {
    return { success: false, message: "GitHub token and repository are required." };
  }

  const [owner, repo] = config.githubRepo.split("/");
  if (!owner || !repo) {
    return { success: false, message: "Repository must be in owner/repo format." };
  }

  const branch = config.githubBranch ?? "gh-pages";

  try {
    await ensureBranchExists(owner, repo, branch, config.githubToken);

    for (const file of files) {
      await upsertFile(owner, repo, branch, file, config.githubToken);
    }

    const url = `https://${owner}.github.io/${repo}/`;
    return { success: true, message: `Deployed ${files.length} files.`, url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Deploy failed: ${message}` };
  }
}

async function ensureBranchExists(
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<void> {
  const branchUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
  const res = await githubFetch(branchUrl, token);

  if (res.status === 404) {
    // Create branch from the default branch HEAD
    const defaultRef = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
      token
    );
    if (!defaultRef.ok) {
      throw new Error("Could not find default branch to base gh-pages on.");
    }
    const refData = await defaultRef.json();
    const sha: string = refData.object.sha;

    const createRes = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      token,
      "POST",
      { ref: `refs/heads/${branch}`, sha }
    );
    if (!createRes.ok) {
      throw new Error(`Failed to create branch: ${createRes.statusText}`);
    }
  }
}

async function upsertFile(
  owner: string,
  repo: string,
  branch: string,
  file: SiteFile,
  token: string
): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;

  // Check if file exists to get its SHA (required for updates)
  let sha: string | undefined;
  const existing = await githubFetch(apiUrl + `?ref=${branch}`, token);
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const encoded = btoa(unescape(encodeURIComponent(file.content)));
  const body: Record<string, string> = {
    message: `VaultFolio: update ${file.path}`,
    content: encoded,
    branch,
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(apiUrl, token, "PUT", body);
  if (!res.ok) {
    throw new Error(`Failed to upload ${file.path}: ${res.statusText}`);
  }
}

function githubFetch(
  url: string,
  token: string,
  method = "GET",
  body?: unknown
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
