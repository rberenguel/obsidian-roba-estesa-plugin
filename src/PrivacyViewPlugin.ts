import { EditorView, ViewPlugin, ViewUpdate, Decoration, WidgetType } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { MarkdownView } from "obsidian";
import PrivacyPlugin from "../main";
import { RedactionSliderComponent } from "./RedactionSliderComponent";


class RedactionWidget extends WidgetType {
    constructor(
        private readonly lineText: string,
        private readonly plugin: PrivacyPlugin
    ) {
        super();
    }

    toDOM(view: EditorView): HTMLElement {
        const container = document.createElement("div");
        const contentToHide = container.createDiv();
        contentToHide.textContent = this.lineText;
        new RedactionSliderComponent(container, this.plugin.settings.redactionStyle);
        return container;
    }

    ignoreEvent() {
        return true;
    }
}

export function buildPrivacyViewPlugin(plugin: PrivacyPlugin) {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = this.buildDecorations(view);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged || update.selectionSet) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }

            buildDecorations(view: EditorView): DecorationSet {
                const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) {
                    return Decoration.none;
                }

                const fileCache = plugin.app.metadataCache.getFileCache(activeView.file);

                if (plugin.redactionManager.isFullNotePrivate(activeView.file, fileCache)) {
                    // Use Decoration.none for an empty set.
                    return Decoration.none;
                }
                
                const builder = new RangeSetBuilder<Decoration>();
                const privateBlockIds = fileCache?.frontmatter?.privacy;

                if (!privateBlockIds || !Array.isArray(privateBlockIds)) {
                    return builder.finish();
                }

                const idSet = new Set(privateBlockIds);

                for (const { from, to } of view.visibleRanges) {
                    let pos = from;
                    while (pos <= to) {
                        const line = view.state.doc.lineAt(pos);
                        const blockIdMatch = line.text.match(/\s\^([a-zA-Z0-9]+)$/);

                        if (blockIdMatch && idSet.has(blockIdMatch[1])) {
                            const selection = view.state.selection.main;
                            if (!(selection.from <= line.to && selection.to >= line.from)) {
                                builder.add(
                                    line.from,
                                    line.to,
                                    Decoration.replace({
                                        widget: new RedactionWidget(line.text, plugin),
                                    })
                                );
                            }
                        }
                        pos = line.to + 1;
                    }
                }
                return builder.finish();
            }
        },
        {
            decorations: v => v.decorations,
        }
    );
}