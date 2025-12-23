import type {
  ActionCapability,
  CapabilityDiscoveryResult,
  ConnectorContext,
  ActionExecuteParams,
  ActionResult,
  AuthLevel,
  RiskLevel,
  Rollbackability,
} from "../../shared/types";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "";

export interface GitHubConnector {
  id: string;
  name: string;
  generateOAuthUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  discoverCapabilities(accessToken: string): Promise<CapabilityDiscoveryResult>;
  getActions(): ActionCapability[];
  executeAction<I, O>(actionId: string, params: ActionExecuteParams<I>): Promise<ActionResult<O>>;
}

const GITHUB_SCOPES = [
  "repo",
  "read:org",
  "admin:repo_hook",
  "read:user",
];

const GITHUB_ACTIONS: ActionCapability[] = [
  {
    id: "github.repo.get_settings",
    version: "1.0.0",
    authLevel: "READ",
    supportedModes: ["AUTO", "PLAN_ONLY", "READ_ONLY"],
    rollback: "NO",
    risk: "LOW",
    limitations: ["Requires repo access"],
  },
  {
    id: "github.repo.get_branch_protection",
    version: "1.0.0",
    authLevel: "READ",
    supportedModes: ["AUTO", "PLAN_ONLY", "READ_ONLY"],
    rollback: "NO",
    risk: "LOW",
    limitations: ["Requires repo access"],
  },
  {
    id: "github.repo.set_branch_protection",
    version: "1.0.0",
    authLevel: "WRITE_HIGH",
    supportedModes: ["AUTO", "PLAN_ONLY"],
    rollback: "YES",
    risk: "MED",
    limitations: ["Requires admin access to repository"],
  },
  {
    id: "github.repo.enable_vulnerability_alerts",
    version: "1.0.0",
    authLevel: "WRITE_LOW",
    supportedModes: ["AUTO", "PLAN_ONLY"],
    rollback: "YES",
    risk: "LOW",
    limitations: ["Requires write access"],
  },
  {
    id: "github.repo.enable_automated_security_fixes",
    version: "1.0.0",
    authLevel: "WRITE_LOW",
    supportedModes: ["AUTO", "PLAN_ONLY"],
    rollback: "YES",
    risk: "LOW",
    limitations: ["Requires write access"],
  },
  {
    id: "github.security.apply_baseline",
    version: "1.0.0",
    authLevel: "WRITE_HIGH",
    supportedModes: ["AUTO", "PLAN_ONLY"],
    rollback: "YES",
    risk: "MED",
    policyConstraints: ["Requires approval for MED+ risk"],
    limitations: ["Affects multiple repository settings"],
  },
  {
    id: "github.security.verify_baseline",
    version: "1.0.0",
    authLevel: "READ",
    supportedModes: ["AUTO", "PLAN_ONLY", "READ_ONLY"],
    rollback: "NO",
    risk: "LOW",
    limitations: [],
  },
  {
    id: "github.security.rollback_baseline",
    version: "1.0.0",
    authLevel: "WRITE_HIGH",
    supportedModes: ["AUTO"],
    rollback: "NO",
    risk: "HIGH",
    policyConstraints: ["Requires explicit approval"],
    limitations: ["May not restore all previous settings"],
  },
];

export function generateOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: GITHUB_SCOPES.join(" "),
    state,
    allow_signup: "false",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
  };
}

export async function discoverCapabilities(
  accessToken: string
): Promise<CapabilityDiscoveryResult> {
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!userResponse.ok) {
    throw new Error("Failed to fetch GitHub user info");
  }

  const user = await userResponse.json();

  const scopeHeader = userResponse.headers.get("x-oauth-scopes") || "";
  const grantedScopes = scopeHeader.split(",").map((s) => s.trim());

  const readableScopes: string[] = [];
  const writableScopes: string[] = [];
  const missingScopes: string[] = [];

  if (grantedScopes.includes("repo") || grantedScopes.includes("public_repo")) {
    readableScopes.push("repos", "commits", "branches", "pull_requests");
    writableScopes.push("repos", "branches", "settings");
  } else {
    missingScopes.push("repo");
  }

  if (grantedScopes.includes("read:org")) {
    readableScopes.push("organizations", "teams", "members");
  } else {
    missingScopes.push("read:org");
  }

  if (grantedScopes.includes("admin:repo_hook")) {
    writableScopes.push("webhooks");
  }

  const availableActions = GITHUB_ACTIONS.filter((action) => {
    if (action.authLevel === "READ") return true;
    if (action.authLevel === "WRITE_LOW" && writableScopes.length > 0) return true;
    if (action.authLevel === "WRITE_HIGH" && grantedScopes.includes("repo"))
      return true;
    return false;
  });

  return {
    actions: availableActions,
    readableScopes,
    writableScopes,
    missingScopes,
    metadata: {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      grantedScopes,
    },
  };
}

export function getActions(): ActionCapability[] {
  return GITHUB_ACTIONS;
}

async function getRepoSettings(
  context: ConnectorContext,
  input: { owner: string; repo: string }
): Promise<ActionResult<Record<string, unknown>>> {
  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}`,
    {
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch repo settings: ${response.statusText}`);
  }

  const repoData = await response.json();

  return {
    output: {
      private: repoData.private,
      hasIssues: repoData.has_issues,
      hasProjects: repoData.has_projects,
      hasWiki: repoData.has_wiki,
      hasDownloads: repoData.has_downloads,
      allowSquashMerge: repoData.allow_squash_merge,
      allowMergeCommit: repoData.allow_merge_commit,
      allowRebaseMerge: repoData.allow_rebase_merge,
      deleteBranchOnMerge: repoData.delete_branch_on_merge,
      defaultBranch: repoData.default_branch,
      visibility: repoData.visibility,
    },
    evidence: {
      fetchedAt: new Date().toISOString(),
      repoFullName: repoData.full_name,
    },
    executionMode: "READ_ONLY",
  };
}

async function getBranchProtection(
  context: ConnectorContext,
  input: { owner: string; repo: string; branch: string }
): Promise<ActionResult<Record<string, unknown>>> {
  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/branches/${input.branch}/protection`,
    {
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (response.status === 404) {
    return {
      output: { protected: false },
      evidence: { fetchedAt: new Date().toISOString() },
      executionMode: "READ_ONLY",
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch branch protection: ${response.statusText}`);
  }

  const protection = await response.json();

  return {
    output: {
      protected: true,
      requiredStatusChecks: protection.required_status_checks,
      enforceAdmins: protection.enforce_admins?.enabled,
      requiredPullRequestReviews: protection.required_pull_request_reviews,
      restrictions: protection.restrictions,
      requiredLinearHistory: protection.required_linear_history?.enabled,
      allowForcePushes: protection.allow_force_pushes?.enabled,
      allowDeletions: protection.allow_deletions?.enabled,
    },
    evidence: {
      fetchedAt: new Date().toISOString(),
    },
    executionMode: "READ_ONLY",
  };
}

async function setBranchProtection(
  context: ConnectorContext,
  input: {
    owner: string;
    repo: string;
    branch: string;
    settings: Record<string, unknown>;
  },
  dryRun?: boolean
): Promise<ActionResult<Record<string, unknown>>> {
  const currentState = await getBranchProtection(context, {
    owner: input.owner,
    repo: input.repo,
    branch: input.branch,
  });

  if (dryRun) {
    return {
      output: { wouldApply: input.settings },
      evidence: { dryRun: true, currentState: currentState.output },
      snapshot: currentState.output,
      executionMode: "PLAN_ONLY",
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/branches/${input.branch}/protection`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.settings),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to set branch protection: ${response.statusText}`);
  }

  const result = await response.json();

  return {
    output: result,
    evidence: {
      appliedAt: new Date().toISOString(),
      previousState: currentState.output,
    },
    snapshot: currentState.output,
    rollbackPlan: {
      action: "github.repo.set_branch_protection",
      params: { ...input, settings: currentState.output },
    },
    executionMode: "AUTO",
  };
}

async function enableVulnerabilityAlerts(
  context: ConnectorContext,
  input: { owner: string; repo: string },
  dryRun?: boolean
): Promise<ActionResult<Record<string, unknown>>> {
  if (dryRun) {
    return {
      output: { wouldEnable: true },
      evidence: { dryRun: true },
      executionMode: "PLAN_ONLY",
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/vulnerability-alerts`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        Accept: "application/vnd.github.dorian-preview+json",
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to enable vulnerability alerts: ${response.statusText}`);
  }

  return {
    output: { enabled: true },
    evidence: { enabledAt: new Date().toISOString() },
    rollbackPlan: {
      action: "github.repo.disable_vulnerability_alerts",
      params: input,
    },
    executionMode: "AUTO",
  };
}

async function enableAutomatedSecurityFixes(
  context: ConnectorContext,
  input: { owner: string; repo: string },
  dryRun?: boolean
): Promise<ActionResult<Record<string, unknown>>> {
  if (dryRun) {
    return {
      output: { wouldEnable: true },
      evidence: { dryRun: true },
      executionMode: "PLAN_ONLY",
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/automated-security-fixes`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        Accept: "application/vnd.github.london-preview+json",
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(
      `Failed to enable automated security fixes: ${response.statusText}`
    );
  }

  return {
    output: { enabled: true },
    evidence: { enabledAt: new Date().toISOString() },
    rollbackPlan: {
      action: "github.repo.disable_automated_security_fixes",
      params: input,
    },
    executionMode: "AUTO",
  };
}

export async function executeAction<I, O>(
  actionId: string,
  params: ActionExecuteParams<I>
): Promise<ActionResult<O>> {
  const { context, input, dryRun } = params;

  switch (actionId) {
    case "github.repo.get_settings":
      return getRepoSettings(context, input as any) as Promise<ActionResult<O>>;

    case "github.repo.get_branch_protection":
      return getBranchProtection(context, input as any) as Promise<ActionResult<O>>;

    case "github.repo.set_branch_protection":
      return setBranchProtection(context, input as any, dryRun) as Promise<ActionResult<O>>;

    case "github.repo.enable_vulnerability_alerts":
      return enableVulnerabilityAlerts(context, input as any, dryRun) as Promise<ActionResult<O>>;

    case "github.repo.enable_automated_security_fixes":
      return enableAutomatedSecurityFixes(context, input as any, dryRun) as Promise<ActionResult<O>>;

    default:
      throw new Error(`Unknown action: ${actionId}`);
  }
}

export const githubConnector = {
  id: "github",
  name: "GitHub",
  generateOAuthUrl,
  exchangeCodeForToken,
  discoverCapabilities,
  getActions,
  executeAction,
};
