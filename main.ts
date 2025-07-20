import { App, Plugin, MarkdownView, setIcon, Notice } from "obsidian";
import { RedactionManager } from "./src/RedactionManager";
import { addPrivacyCommands } from "./src/commands";
import { PrivacySettingTab } from "./src/SettingsTab";
import { buildPrivacyViewPlugin } from "./src/PrivacyViewPlugin";

export interface PrivacyPluginSettings {
	isPrivacyModeActive: boolean; // Add this setting
	enableTransitionOverlay: boolean;
	transitionBlurAmount: number;
	transitionDelay: number;
	enableFullNotePrivacy: boolean;
	privateTags: string;
	privateFrontmatterKey: string;
	privateFolders: string;
	redactionStyle: "Solid Block" | "Blur";
}

const DEFAULT_SETTINGS: PrivacyPluginSettings = {
	isPrivacyModeActive: false,
	enableTransitionOverlay: true,
	transitionBlurAmount: 50,
	transitionDelay: 300,
	enableFullNotePrivacy: true,
	privateTags: "private",
	privateFrontmatterKey: "private",
	privateFolders: "",
	redactionStyle: "Solid Block",
};

export default class PrivacyPlugin extends Plugin {
	settings: PrivacyPluginSettings;
	private transitionOverlayEl: HTMLElement | null = null;
	redactionManager: RedactionManager;
	private ribbonIconEl: HTMLElement | null = null;
	public revealedBlockIds: Set<string> = new Set();

	constructor(app: App, manifest: any) {
		super(app, manifest);
	}

	updateRibbonIcon() {
		if (!this.ribbonIconEl) {
			return;
		}
		const isPrivacyActive = this.settings.isPrivacyModeActive;

		setIcon(this.ribbonIconEl, isPrivacyActive ? "eye-off" : "eye");

		this.ribbonIconEl.setAttribute(
			"aria-label",
			isPrivacyActive
				? "Disable full privacy mode"
				: "Enable full privacy mode",
		);
	}

	async onload() {
		await this.loadSettings();
		this.redactionManager = new RedactionManager(
			this.app,
			this.settings,
			this,
		);

		this.registerEditorExtension(buildPrivacyViewPlugin(this));
		this.addSettingTab(new PrivacySettingTab(this.app, this));

		this.transitionOverlayEl = document.createElement("div");
		this.transitionOverlayEl.id = "privacy-plugin-transition-overlay";
		document.body.appendChild(this.transitionOverlayEl);
		this.revealedBlockIds.clear();
		addPrivacyCommands(this);

		this.ribbonIconEl = this.addRibbonIcon(
			"eye",
			"Enable full privacy mode",
			async () => {
				this.settings.isPrivacyModeActive =
					!this.settings.isPrivacyModeActive;
				await this.saveSettings();

				// Update the icon immediately after the click
				this.updateRibbonIcon();

				new Notice(
					`Full privacy mode ${this.settings.isPrivacyModeActive ? "enabled" : "disabled"}.`,
				);

				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					this.redactionManager.applyFullNoteRedaction(activeView);
				}
				this.app.workspace.updateOptions();
			},
		);

		setTimeout(() => this.updateRibbonIcon(), 100);

		const handleFullNoteRedaction = () => {
			const activeView =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				setTimeout(() => {
					this.redactionManager.applyFullNoteRedaction(activeView);
				}, 100);
			}
		};

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				if (
					this.settings.isPrivacyModeActive &&
					this.settings.enableTransitionOverlay &&
					this.transitionOverlayEl
				) {
					(this.transitionOverlayEl.style as any).backdropFilter =
						`blur(${this.settings.transitionBlurAmount}px)`;
					this.transitionOverlayEl.style.opacity = "1";
					this.transitionOverlayEl.style.display = "block";

					setTimeout(() => {
						if (this.transitionOverlayEl) {
							this.transitionOverlayEl.style.opacity = "0";
							this.transitionOverlayEl.ontransitionend = () => {
								if (this.transitionOverlayEl) {
									this.transitionOverlayEl.style.display =
										"none";
									this.transitionOverlayEl.ontransitionend =
										null;
								}
							};
						}
					}, this.settings.transitionDelay);
				}
				handleFullNoteRedaction();
			}),
		);

		this.registerEvent(
			this.app.workspace.on("layout-change", handleFullNoteRedaction),
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		if (this.transitionOverlayEl) {
			this.transitionOverlayEl.remove();
			this.transitionOverlayEl = null;
		}
	}
}
