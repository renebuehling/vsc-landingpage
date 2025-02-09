# Landingpage

Use this extension to create and organise bookmarks to folders, files and workspaces in a personal startup page. VS Code's default *recently used* list is a strict temporal list without reflecting your personal working status. But you might want to keep shortcuts to your currently active projects still in sight even when you work on other things for a while.

Landingpage extension shows both, VS code's recently used files and folders as well as custom bookmarks which can be organised in groups, renamed, ordered and colorized. 

## Features

### Startup: Default List

Landingpage is automatically opened when a VS Code window is opened without folders or workspace context. This can be enabled/disabled in extension's settings.

By default a list appears which mirrors most recently used files in Visual Studio Code. This is identical to menu items in *File > Open Recent* menu.

![Default Landingpage](doc/img/startup.png)

One item that points to a file, folder or workspace is called **bookmark** in this documentation. 

Click on a bookmark to open the linked file, folder or workspace in the current window. If a target is already already open in another VS Code window, that window may be focussed instead.

### Use custom groups to pin projects

To organize your bookmarks in a specific order or thematic collections use **groups**:

- Create a new group by clicking the plus button in toolbar. 
- Switch to move tool in toolbar.
- Drag and drop the bookmarks into your group.

![Create a group](doc/img/create-group.gif)

#### Direct import from File System

You can also add items which are not yet in the MRU list using **file or folder picker**:

- Switch to Reader Tool.
- Point to a group header.
- Click on the file or folder button to add a bookmark to a file, workspace file or directory.

![Add from file system](doc/img/add-folder.gif)

> **Group *Recent* is read-only.** Its content is populated from Visual Studio's recently used items. You cannot add any entries here. See also: [Understanding 'Recent'](#recent)


### Rearrange bookmarks per Drag and Drop

Use drag and drop in move mode to customize the order to your needs: 

- Switch to Move Tool.
- Drag bookmarks and drop on other bookmarks to move them forwards or backwards.
- Drop bookmarks to group labels to add them to the end of that group. This can also be used to move bookmarks into yet empty groups.

![Rearrange using Drag and Drop](doc/img/move-bookmark.gif)

> **Group *Recent* is read-only.** You can drag bookmarks *from* Recent *to* other groups, but not the other way around. The order of bookmarks within Recent group cannot be changed. See also: [Understanding 'Recent'](#recent)

### Customize Appearance

#### Rename Bookmarks and Groups

Bookmark and Group labels are freely customizable texts. 

//HACK: Next: continue documentation of rename, then colorize


### Remove items per Delete Tool


<a name="recent"></a>


### Understanding *Recent* Group





Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**



## Build local .vsix file

`vsce package` oder npm package script.