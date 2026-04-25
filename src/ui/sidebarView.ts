import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import type VaultFolioPlugin from "../main";
import type { PublishedNote } from "../parser";

export const SIDEBAR_VIEW_TYPE = "vaultfolio-sidebar";

export class VaultFolioSidebarView extends ItemView {
  plugin: VaultFolioPlugin;
  private notes: PublishedNote[] = [];
  private isLoading = false;

  constructor(leaf: WorkspaceLeaf, plugin: VaultFolioPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SIDEBAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "VaultFolio";
  }

  getIcon(): string {
    return "layout";
  }

  async onOpen(): Promise<void> {
    this.isLoading = true;
    this.render();
    await this.refresh(false);
  }

  async onClose(): Promise<void> {
    // nothing to clean up
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  private async refresh(notify: boolean): Promise<void> {
    this.isLoading = true;
    this.notes = await this.plugin.parser.getPublishedNotes();
    this.isLoading = false;
    this.render();
    if (notify) {
      new Notice(`Refreshed. ${this.notes.length} note${this.notes.length === 1 ? "" : "s"} found.`);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  private render(): void {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("vaultfolio-sidebar");

    this.renderHeader(root);
    this.renderNoteList(root);
    this.renderFooter(root);
  }

  private renderHeader(root: HTMLElement): void {
    // Row 1: title + refresh button
    const header = root.createDiv({ cls: "vaultfolio-header" });

    const titleEl = header.createEl("span", { cls: "vaultfolio-title" });
    titleEl.innerHTML = 'VAULT<span style="color:#FF4D00">FOLIO</span>';

    const refreshBtn = header.createEl("button", {
      cls: "vaultfolio-icon-btn",
      attr: { "aria-label": "Refresh notes" },
    });
    refreshBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>`;

    refreshBtn.addEventListener("click", async () => {
      refreshBtn.addClass("vaultfolio-spinning");
      await this.refresh(true);
      refreshBtn.removeClass("vaultfolio-spinning");
    });

    // Row 2: published badge on its own line
    if (!this.isLoading) {
      const statsRow = root.createDiv({ cls: "vaultfolio-stats-row" });
      statsRow.createSpan({
        cls: "vaultfolio-note-count-badge",
        text: `${this.notes.length} published`,
      });
    }
  }

  private renderNoteList(root: HTMLElement): void {
    const container = root.createDiv({ cls: "vaultfolio-note-list" });

    if (this.isLoading) {
      container.createDiv({ cls: "vaultfolio-loading", text: "Scanning vault…" });
      return;
    }

    if (this.notes.length === 0) {
      const empty = container.createDiv({ cls: "vaultfolio-empty" });
      empty.createDiv({ cls: "vaultfolio-empty-icon", text: "📝" });
      empty.createDiv({ cls: "vaultfolio-empty-title", text: "No published notes yet" });
      empty.createDiv({
        cls: "vaultfolio-empty-sub",
        text: "Add published: true to any note in your portfolio folder",
      });
      return;
    }

    for (const note of this.notes) {
      this.renderNoteCard(container, note);
    }
  }

  private renderNoteCard(container: HTMLElement, note: PublishedNote): void {
    const card = container.createDiv({ cls: "vaultfolio-note-card" });

    card.createDiv({ cls: "vaultfolio-note-title", text: note.title });

    const date = note.frontmatter.date;
    if (typeof date === "string" && date.trim()) {
      card.createDiv({ cls: "vaultfolio-note-date", text: date.trim() });
    }

    const tags = note.frontmatter.tags;
    if (Array.isArray(tags) && tags.length > 0) {
      const tagRow = card.createDiv({ cls: "vaultfolio-tag-row" });
      for (const tag of tags) {
        tagRow.createSpan({ cls: "vaultfolio-tag", text: String(tag).toLowerCase() });
      }
    }
  }

  private renderFooter(root: HTMLElement): void {
    const footer = root.createDiv({ cls: "vaultfolio-footer" });

    const buildBtn = footer.createEl("button", {
      text: "Build Site",
      cls: ["vaultfolio-btn", "vaultfolio-btn-primary"],
    });

    const deployBtn = footer.createEl("button", {
      text: "Deploy to GitHub",
      cls: ["vaultfolio-btn", "vaultfolio-btn-secondary"],
    });

    buildBtn.addEventListener("click", async () => {
      buildBtn.disabled = true;
      deployBtn.disabled = true;
      buildBtn.setText("Building…");
      try {
        const result = await this.plugin.buildSite();
        new Notice(
          `✅ Site built successfully — ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} generated`
        );
      } catch (err) {
        new Notice(
          `❌ Build failed — ${err instanceof Error ? err.message : "check your portfolio folder"}`
        );
      } finally {
        buildBtn.disabled = false;
        deployBtn.disabled = false;
        buildBtn.setText("Build Site");
      }
    });

    deployBtn.addEventListener("click", async () => {
      buildBtn.disabled = true;
      deployBtn.disabled = true;
      try {
        deployBtn.setText("Building…");
        const buildResult = await this.plugin.buildSite();

        deployBtn.setText("Deploying…");
        const result = await this.plugin.deployFiles(buildResult.files, buildResult.imageMap);

        if (result.success) {
          new Notice(`🚀 Deployed! Visit: ${result.url ?? result.message}`);
        } else {
          const msg = result.message;
          if (msg.includes("Invalid GitHub token") || msg.includes("401")) {
            new Notice("❌ Invalid GitHub token — regenerate in GitHub settings");
          } else {
            new Notice("❌ Deploy failed — check your GitHub token and repo");
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
          new Notice("❌ Network error — check your connection");
        } else if (msg.includes("token") || msg.includes("401")) {
          new Notice("❌ Invalid GitHub token — regenerate in GitHub settings");
        } else {
          new Notice(`❌ Deploy failed — ${msg}`);
        }
      } finally {
        buildBtn.disabled = false;
        deployBtn.disabled = false;
        deployBtn.setText("Deploy to GitHub");
      }
    });
  }
}
