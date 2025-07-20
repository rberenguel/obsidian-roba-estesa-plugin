# Obsidian Privacy Plugin - Plan

## 1. Core Concept

A client-side plugin for Obsidian to enhance user privacy through three main features:
1.  **Transient Obfuscation**: A blurred overlay that appears during note transitions.
2.  **Granular Redaction**: A mechanism to mark and hide specific blocks of content within a note.
3.  **Full-Note Privacy**: A way to automatically redact the entire content of designated notes by default.

---

## 2. Feature Breakdown

### Feature 1: Transition Overlay

* **Trigger**: Activates on the `active-leaf-change` event.
* **Implementation**: Injects a top-level `div` element with CSS properties like `position: fixed`, `z-index: 9999`, and `backdrop-filter: blur(50px)`.
* **Behavior**: The overlay appears instantly on note switch and fades out after a configurable delay (e.g., 300ms).

### Feature 2: Granular Content Redaction

This method separates privacy metadata from the content for non-invasive redaction of specific paragraphs or list items.

* **Marking Syntax**: Uses a YAML list in the frontmatter (`privacy: [id1, id2]`) to reference standard Obsidian block IDs (`^id1`) placed at the end of lines in the note content.
* **Implementation Logic**:
    1.  On note load, read the `privacy` array from the frontmatter using `app.metadataCache`.
    2.  A `MarkdownPostProcessor` scans rendered HTML elements.
    3.  If an element's `data-block-id` matches an ID from the list, it's wrapped in a redaction component with a "slide-to-reveal" mechanism.
* **User Experience**: Essential helper commands (`Privacy: Mark block as private` and `Privacy: Unmark block as private`) will automate the creation of block IDs and the modification of the frontmatter.

### Feature 3: Automatic Full-Note Privacy

This feature redacts an entire note's content (except the title) based on predefined rules, covering it with a single redaction block.

* **Activation Rules**: A note is considered private by default if it meets any of the user-configured conditions:
    1.  **Tag**: Contains a specific tag (e.g., `#private`).
    2.  **Frontmatter**: Contains a specific key set to true (e.g., `stealth: true`).
    3.  **Folder**: Is located within a designated private folder (e.g., `Journal/private/`).
* **Implementation Logic**:
    1.  On note load, before processing individual blocks, the plugin checks if the note's metadata or path matches any of the activation rules.
    2.  If a rule is matched, the plugin forgoes the granular redaction and instead injects a single, full-page `div` over the note's content view.
    3.  This single `div` acts as the redaction block and contains its own "slide-to-reveal" component to unlock the entire note.

---

## 3. Plugin Structure & Files

* `manifest.json` (Plugin metadata)
* `main.ts` (Entry point, event listeners, settings)
* `styles.css` (Global styles)
* `src/`
    * `RedactionManager.ts` (Handles both full-note and granular redaction logic)
    * `SliderComponent.ts` (Reusable slide-to-reveal component)
    * `SettingsTab.ts` (UI for plugin settings)
    * `commands.ts` (Logic for the UX helper commands)

---

## 4. Settings

A settings tab should provide the following options:

* **Global Toggle**: Enable/Disable the entire plugin.
* **Transition Overlay**:
    * Toggle to enable/disable.
    * Slider for blur amount.
    * Number input for auto-hide delay.
* **Content Redaction**:
    * Dropdown for default redaction style (`Solid Block`, `Blur`, etc.).
* **Automatic Full-Note Privacy**:
    * Toggle to enable/disable this feature.
    * Text input for the privacy tag (e.g., `private`).
    * Text input for the frontmatter key (e.g., `stealth`).
    * A UI to add and remove folders to the private list.

---

## 5. Development Phases

1.  **MVP**: Implement granular, frontmatter-based redaction with the essential helper commands. Use a simple "click-to-reveal" mechanism.
2.  **V1.0**: Implement the note transition overlay and the automatic full-note privacy feature. Replace "click-to-reveal" with the final "slide-to-reveal" component. Build the complete settings tab.
3.  **Post-1.0**: Conduct a performance review. Add any further refinements based on usage.
