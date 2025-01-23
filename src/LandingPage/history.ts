import { commands, Uri } from "vscode";
import { LandingPageProject } from "./LandingPageModel";
import { parseURI } from "./utils";

/**
 * Workspace bookmark in MRU list provided in {@link RecentlyOpenedItems.workspaces}.
 * (Schema guessed from debugger.)
 */
interface RecentWorkspace
{
  /** If this workspace bookmark refers to a workspace file, this property describes the path to it. */
  workspace:
  {
    /** Path to workspace file. */
    configPath?:Uri;
    /** Some ID (???). */
    id?:string;
  },
  /** If this workspace bookmark refers to a folder, this property is present (only). */
  folderUri?:Uri;
}

/**
 * File bookmark in MRU list provided in {@link RecentlyOpenedItems.files}.
 * 
 * (Schema guessed from debugger.)
 */
interface RecentFile
{  
  fileUri:Uri;
  label?:string;
}

/**
 * Model for results of command [_workbench.getRecentlyOpened](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/actions/workspaceCommands.ts#L311).
 * 
 * (Schema guessed from debugger.)
 */
interface RecentlyOpenedItems
{
  workspaces:RecentWorkspace[];
  files:RecentFile[];
}

/**
 * Reads the most recently used items from VS Code and returns it 
 * as Landingpage Model presentation. Can include files, folders or workspaces.
 * 
 * @returns Items from VS Code's history.
 */
export async function importVscRecentList():Promise<LandingPageProject[]>
{
  const recentWorkspaces: RecentlyOpenedItems = await commands.executeCommand("_workbench.getRecentlyOpened");
  
  let result:LandingPageProject[]=[];
  let mruCounter=0;
  for(let recentWorkspace of recentWorkspaces.workspaces)
  {
    mruCounter++;
    if (recentWorkspace.folderUri)
    {
      let nameParts = parseURI(recentWorkspace.folderUri);
      result.push({
        guid:'MRU-'+mruCounter,
        path:recentWorkspace.folderUri.toString(),
        label:nameParts.basename,
        icon:'folder'
      });  
    }
    else if (recentWorkspace.workspace?.configPath)
    {
      let nameParts = parseURI(recentWorkspace.workspace.configPath);
      result.push({
        guid:'MRU-'+mruCounter,
        path:recentWorkspace.workspace.configPath.toString(),
        label:nameParts.basename,
        icon:'workspace'
      });  
    }
  }
  for(let recentFile of recentWorkspaces.files)
  {
    mruCounter++;
    let nameParts = parseURI(recentFile.fileUri);
    result.push({
      guid:'MRU-'+mruCounter,
      path:recentFile.fileUri.toString(),
      label:recentFile.label||nameParts.basename+'.'+nameParts.ext,
      //icon:'file'
    });    
  }

    // console.log("👽 :=",result);

  return result;
}