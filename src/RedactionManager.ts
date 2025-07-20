import { App, MarkdownPostProcessorContext, MarkdownView, TFile, FrontMatterCache } from "obsidian";
import { RedactionSliderComponent } from "./RedactionSliderComponent";
import { PrivacyPluginSettings } from "../main";

export class RedactionManager {
    private app: App;
    private settings: PrivacyPluginSettings;

    constructor(app: App, settings: PrivacyPluginSettings) {
        this.app = app;
        this.settings = settings;
    }

    private isFullNotePrivate(file: TFile, fileCache: FrontMatterCache | null): boolean {
        if (!this.settings.enableFullNotePrivacy) {
            return false;
        }

        const privateTags = this.settings.privateTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
        const hasPrivateTag = fileCache?.tags?.some(t => privateTags.includes(t.tag.substring(1))) ?? false;
        if (hasPrivateTag) return true;

        if (fileCache?.frontmatter?.[this.settings.privateFrontmatterKey] === true) {
            return true;
        }

        const privateFolders = this.settings.privateFolders.split(",").map(f => f.trim()).filter(f => f.length > 0 && f !== '/');
        const inPrivateFolder = privateFolders.some(f => file.path.startsWith(f));
        if (inPrivateFolder) return true;

        return false;
    }

    private sanitizeForCss(path: string): string {
        return path.replace(/[^a-zA-Z0-9-]/g, '-');
    }

    public applyFullNoteRedaction(view: MarkdownView) {
        const file = view.file;
        if (!file) return;

        const fileCache = this.app.metadataCache.getFileCache(file);
        const isPrivate = this.isFullNotePrivate(file, fileCache);
        const contentEl = view.contentEl;
        const overlayId = `privacy-plugin-full-note-overlay-${this.sanitizeForCss(file.path)}`;
        let overlay = view.containerEl.querySelector(`#${overlayId}`);

        if (isPrivate) {
            if (overlay) return;

            overlay = contentEl.createDiv({ cls: "privacy-plugin-redaction-container" });
            overlay.id = overlayId;

            const previewEl = contentEl.querySelector('.markdown-preview-view');
            if (previewEl) {
                Array.from(previewEl.childNodes).forEach(node => {
                    overlay!.appendChild(node);
                });
            }

            new RedactionSliderComponent(overlay as HTMLElement, this.settings.redactionStyle);
        } else {
            if (overlay) {
                const previewEl = contentEl.querySelector('.markdown-preview-view');
                const wrapper = overlay.querySelector('.privacy-plugin-redaction-content');
                if (previewEl && wrapper) {
                    Array.from(wrapper.childNodes).forEach(node => {
                        previewEl.appendChild(node);
                    });
                }
                overlay.remove();
            }
        }
    }
}