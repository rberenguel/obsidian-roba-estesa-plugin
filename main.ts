import {
	App,
	Plugin,
	MarkdownView,
} from "obsidian";
import { RedactionManager } from "./src/RedactionManager";
import { addPrivacyCommands } from "./src/commands";
import { PrivacySettingTab } from "./src/SettingsTab";
import { buildPrivacyViewPlugin } from "./src/PrivacyViewPlugin";

export interface PrivacyPluginSettings {
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
	enableTransitionOverlay: true,
	transitionBlurAmount: 50,
	transitionDelay: 300,
	enableFullNotePrivacy: true,
	privateTags: "private",
	privateFrontmatterKey: "stealth",
	privateFolders: "",
	redactionStyle: "Solid Block",
};

export default class PrivacyPlugin extends Plugin {
	settings: PrivacyPluginSettings;
	private transitionOverlayEl: HTMLElement | null = null;
	redactionManager: RedactionManager;

	constructor(app: App, manifest: any) {
		super(app, manifest);
	}

	async onload() {
		await this.loadSettings();
		this.redactionManager = new RedactionManager(this.app, this.settings);

		this.registerEditorExtension(buildPrivacyViewPlugin(this));
		this.addSettingTab(new PrivacySettingTab(this.app, this));

		this.transitionOverlayEl = document.createElement("div");
		this.transitionOverlayEl.id = "privacy-plugin-transition-overlay";
		document.body.appendChild(this.transitionOverlayEl);

		addPrivacyCommands(this);

		const handleFullNoteRedaction = () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				setTimeout(() => {
					this.redactionManager.applyFullNoteRedaction(activeView);
				}, 100);
			}
		};

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				if (this.settings.enableTransitionOverlay && this.transitionOverlayEl) {
					(this.transitionOverlayEl.style as any).backdropFilter = `blur(${this.settings.transitionBlurAmount}px)`;
					this.transitionOverlayEl.style.opacity = "1";
					this.transitionOverlayEl.style.display = "block";

					setTimeout(() => {
						if (this.transitionOverlayEl) {
							this.transitionOverlayEl.style.opacity = "0";
							this.transitionOverlayEl.ontransitionend = () => {
								if (this.transitionOverlayEl) {
									this.transitionOverlayEl.style.display = "none";
									this.transitionOverlayEl.ontransitionend = null;
								}
							};
						}
					}, this.settings.transitionDelay);
				}
				handleFullNoteRedaction();
			}),
		);

		this.registerEvent(this.app.workspace.on("layout-change", handleFullNoteRedaction));
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