# Roba estesa: an Obsidian (soft) privacy plugin

An Obsidian plugin to enhance user privacy through transient obfuscation and granular content redaction. Ideal for screen sharing, presentations, or working in public spaces where you want to selectively hide parts of your notes.

> **Roba Estesa** is a Catalan expression for laundry hanging out to dry, used as a code phrase to warn that there are people present who shouldn't overhear a private conversation. It represents the act of marking certain information as "not for everyone" while it remains in plain view.

---

## Features

### 1. Granular Block Redaction

Hide specific paragraphs, bullet points, or lines of text within a note.

-   **How to Use:**
    1.  Place your cursor on the line you want to hide and run the `Mark block as private` command. This will add a block ID (e.g., `^a1b2c3`) to the end of the line and update the frontmatter.
    2.  Redacted blocks are hidden behind a "Slide to reveal" component.
    3.  Clicking on the redacted block reveals the original text for editing.
-   **Manual Usage:** You can manually add a block ID (`^your-id`) to any line and add `your-id` to the `privacy` list in your note's YAML frontmatter.

**Example:**
```yaml
---
privacy:
  - a1b2c3
---

This is a public paragraph.

This paragraph is sensitive and should be hidden. ^a1b2c3

- This list item is public.
- This list item should also be hidden. ^d4e5f6
```

### 2. Full Privacy Mode

A toggleable mode that hides entire notes based on tags, folders, or frontmatter keys. This mode is designed for situations where you need maximum privacy, like during a live presentation.

-   **How to Use:**
    -   Click the **eye-off** icon in the left-hand ribbon to enable Full Privacy Mode.
    -   Click the **eye** icon to disable it.
-   **Activation:** When enabled, any note will be completely hidden if it:
    -   Contains a specific tag (e.g., `#private`).
    -   Is inside a designated folder (e.g., `Journal/Private/`).
    -   Contains a specific frontmatter key (e.g., `private: true`).
    -   *All triggers are configurable in the plugin settings.*

### 3. Note Transition Overlay

To prevent content from flashing during navigation, a brief, blurred overlay covers the workspace when switching between notes.

-   This feature is only active when **Full Privacy Mode** is enabled.

---

## Settings

The plugin's behavior can be customized in the settings tab:

-   **Content Redaction:** Choose the default appearance of redacted blocks (`Solid Block` or `Blur`).
-   **Full-Note Privacy:**
    -   Enable or disable the feature entirely.
    -   Define the tags, frontmatter key, and folder paths that trigger full-note redaction.
-   **Transition Overlay:**
    -   Enable or disable the overlay.
    -   Configure the blur amount and duration.

---

## Installation

### Manual Installation

1.  Download the latest release files (`main.js`, `styles.css`, `manifest.json`) from the **Releases** page of the GitHub repository (or the zip file, contains all of these).
2.  Find your Obsidian vault's plugins folder by going to `Settings` > `About` and clicking `Open` next to `Override config folder`. Inside that folder, navigate into the `plugins` directory.
3.  Create a new folder named `roba-estesa`.
4.  Copy the `main.js`, `manifest.json`, and `styles.css` files into the new `roba-estesa` folder.
5.  In Obsidian, go to **Settings** > **Community Plugins**.
6.  Make sure "Restricted mode" is turned off. Click the "Reload plugins" button.
7.  Find "Roba Estesa" in the list and **enable** it.
