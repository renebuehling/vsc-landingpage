import * as vscode from 'vscode';
import { findFirst, LandingPageGroup, LandingPageModel, LandingPageProject, ScanResult } from './LandingPageModel';
import { importVscRecentList } from './history';
import { parseURI } from './utils';

/** 
 * Model for data sent from landingpage2.html to communictations.ts 
 */
interface MessageFromWebview
{
	command:'documentReady'|'rename'|'createBookmark'|'createGroup'|'remove'|'open'|'move'|'patch'|'openSettings';

	//text?:string;
  /** GUID value of model fragment this command refers to. */
	guid?:string;
  /** For command createBookmark: if true, a folder picker is shown, else a filepicker is shown.  */
  pickFolder?:boolean;  
  /** If true, comman `remove` will not show a confirmation dialog. */
  dontAsk?:boolean;

  /** For command 'move' the GUID of the element the dragged element (GUID) is placed relative to. */
  guid2?:string;
  /** If given, command 'move' will create a copy and assign this GUID to the cloned node. */
  cloneGUID?:string;
  /** For command 'move' the insertion relation to drop target (GUID2). */
  pos?:'before'|'after';

  /** For command 'patch' the name of the field to update. */
  field?:'shade'|'layout';
  /** For command 'patch' the new value to assign to the field. */
  value?:any;
}

/** 
 * Model to send information/commands to landingpage2.html 
 */
interface MessageToWebview
{
  /** Signal ID to send to webview. */
  command:string;
  /** Data model to render. */
  model:LandingPageModel;
  /** If true, the webview does not sync existing dom elements, but recreates the whole render tree. */
  forceRebuild?:boolean;
}

function sendMessageToWebview(message:MessageToWebview, webviewPanel:vscode.WebviewPanel):void
{
  // console.log('main: send message to view',message, this.webviewPanel);
  webviewPanel.webview.postMessage(message);
}

/**
 * Pointer to the extension context, required to {@link saveModel}.
 */
let landingPageExtContext: vscode.ExtensionContext;
/**
 * Stores the context instance into {@link landingPageExtContext}.
 * Called from extension's activate function in `extension.ts`.
 * @param ctx Context for this extension.
 */
export function registerContext(ctx: vscode.ExtensionContext):void
{
  landingPageExtContext = ctx;
}
/**
 * Permanently store the landingpage model in extension's storage.
 * @param model Current model status.
 */
function saveModel(model:LandingPageModel):void
{
  // console.log('Save',model);
  landingPageExtContext.globalState.update('landingPageModel',model);
}

/**
 * Loads the most recently used (mru) entries from Visual Studio Code itself
 * as bookmarks in the landingpage model.
 * 
 * These bookmarks have limited interaction options as they are managaged via
 * VS Code and therefore updated automatically. Local changes would be replaced/lost.
 * 
 * The mru bookmarks are basically modelled similar to custom bookmarks, but they
 * are stored inside a {@link LandingPageGroup} with `guid`=`@vsc-mru`. This guid
 * is used to identify these "sealed" items in frontend.
 * 
 * @param sharedModel Model to inject mru bookmarks into.
 */
async function populateVscMru(sharedModel:LandingPageModel):Promise<void>
{
  let mruFound = findFirst('@vsc-mru',sharedModel);
  let mruGroup:LandingPageGroup;
  if(mruFound) //MRU list already yet in model -> use that
  {
    mruGroup=mruFound.target as LandingPageGroup;
  }
  else //MRU list not yet in model -> create now
  {
    mruGroup={guid:'@vsc-mru',label:'Recent',projects:[], layout:'list'};
    sharedModel.groups.push(mruGroup);
  }
  mruGroup.projects=await importVscRecentList();
}

/**
 * Removes content from given model instance, saves changes and show a reload request message.
 * @param sharedModel Model to reset.
 */
export async function resetModel(sharedModel:LandingPageModel):Promise<void>
{
  sharedModel.groups=[];
  await populateVscMru(sharedModel);
  saveModel(sharedModel);
  vscode.window.showInformationMessage('Model reset. Please close and reopen landingpage view.');
}

/**
 * Performs a resync/reload of the webview to reflect the given model.
 * @param webviewPanel Webview instance to update.
 * @param sharedModel Model to render.
 */
export function syncModelInWebview(webviewPanel:vscode.WebviewPanel, sharedModel:LandingPageModel):void
{
  sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel); // when webview is ready, send model to it
}

/**
 * Called when landingpage2.html in webview sends a command or request to the extension.
 * @param message Info package received from landingpage2.html.
 * @param webviewPanel Renderer instance.
 * @param sharedModel Model from webview, which contains current state of the landinpage configuration. Note that this model is not received from the webview, but from `extension.ts`.
 */
export async function handleMessageFromWebview(message:MessageFromWebview,webviewPanel:vscode.WebviewPanel, sharedModel:LandingPageModel):Promise<void>
{
  await populateVscMru(sharedModel);

  // console.log('main: handle message',this);
  switch(message.command)
  {
    case 'documentReady':
      syncModelInWebview(webviewPanel, sharedModel);
      // vscode.window.showWarningMessage(`postmessage syncmodel!: ${JSON.stringify(sharedModel)}`);
      break;
    case 'rename': // guid: ID of model element to rename
      let foundGoP = findFirst(message.guid,sharedModel);
      if (!foundGoP) {vscode.window.showWarningMessage(`GroupOrProject not found: ${message.guid}`);return;}

      vscode.window.showInputBox({value:foundGoP.target.label||'',})
      .then((value:string|undefined)=>
      {
        if (value) 
        {
          foundGoP.target.label=value;

          sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel);
          saveModel(sharedModel);
        }
      });
      break;
    case 'createBookmark':  //{guid: groupGUID to add bookmark into, pickFolder:bool show folder or file picker?}
      let foundG = findFirst(message.guid, sharedModel);
      if (!foundG) {vscode.window.showWarningMessage(`Group not found: ${message.guid}`); return;}
      vscode.window.showOpenDialog({canSelectFiles:true, canSelectFolders:message.pickFolder,canSelectMany:true, filters:{'Workspaces':['code-workspace'],'Files':['*']}})
      .then((selectedFiles:vscode.Uri[]|undefined)=>
      {
        if (selectedFiles)
        {
          for(let uri of selectedFiles)
          {            
            let nameParts = parseURI(uri);              
            
            const p:LandingPageProject =     {guid:crypto.randomUUID(), label:nameParts.basename, path:uri.toString()};
            if (!nameParts.ext)              {p.icon = 'folder';}
            else if (nameParts.ext==='code-workspace') {p.icon = 'workspace';}
            //else: unknown file type

            (foundG.target as LandingPageGroup).projects.push(p);
          }
          console.log('updated model > created Bookmark',sharedModel);
          sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel);
          saveModel(sharedModel);
        }
      });
      break;
    case 'createGroup':
      //sharedModel.groups.push({guid:crypto.randomUUID(),label:'Group',projects:[]});
      sharedModel.groups.splice(0,0,{guid:crypto.randomUUID(),label:'Group',projects:[]});
      console.log('updated model > created Group',sharedModel);
      sendMessageToWebview({command:'syncModel',model:sharedModel, forceRebuild:true}, webviewPanel);
      saveModel(sharedModel);
      break;
    case 'remove':  //{guid: item to remove}        
      let foundGoP2 = findFirst(message.guid, sharedModel);

      const performRemoval=(foundGoP2:ScanResult)=>{
        if(foundGoP2.ownerGroup) //project in group
        {
          let index = foundGoP2.ownerGroup.projects.indexOf(foundGoP2.target);
          if (index>=0) {foundGoP2.ownerGroup.projects.splice(index,1);}
        }
        else //group in model
        {
          foundGoP2.model.groups.splice(foundGoP2.model.groups.indexOf(foundGoP2.target as LandingPageGroup),1);
        }
        console.log('updated model > removed item',sharedModel);
        sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel);
        saveModel(sharedModel);
      };

      if(foundGoP2!==null)
      {
        if (message.dontAsk===true) //instant delete 
        {
          performRemoval(foundGoP2);             
        }
        else //delete with confirmation
        {
          vscode.window
          .showWarningMessage((foundGoP2.ownerGroup?`Remove bookmark to ${foundGoP2.target.label}?`:`Remove group ${foundGoP2.target.label} and all of its bookmarks?`)+" This cannot be undone.", "Yes", "No")
          .then(answer => { if (answer === "Yes") { performRemoval(foundGoP2); }});
        }
      }
      else {console.warn(`remove: item with guid "${message.guid}" not found.`,sharedModel);}        
      break;
    case 'open': // {guid: item with path to open}        
      let projectFound = findFirst(message.guid, sharedModel);
      if(projectFound!==null)
      {
        let path = (projectFound.target as LandingPageProject).path;
        if(path) 
        {
          console.log(`Trying to open ${path}`);
          vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(path)); //https://code.visualstudio.com/api/references/commands
          return;
        }
        else //group in model > cannot open group
        {
          console.warn(`open: guid "${message.guid}" points to element without path!`,sharedModel);
        }          
      }
      else {console.warn(`remove: item with guid "${message.guid}" not found.`,sharedModel);}
      break;
    case 'move': // {guid:move, guid2:relativeTo, pos:beforeOrAfterGuid2}
      let foundDrag=findFirst(message.guid, sharedModel); // item to move
      let foundDrop=findFirst(message.guid2, sharedModel); //item to move relative to
      if (foundDrag && foundDrop)
      {
        let dragIs=foundDrag.ownerGroup?'project':'group';
        let dropIs=foundDrop.ownerGroup?'project':'group';

        if (dragIs==='group')
        {
          let fromPos = foundDrag.model.groups.indexOf(foundDrag.target as LandingPageGroup);
          foundDrag.model.groups.splice(fromPos!,1); //remove from old parent

          if (dropIs==='project') // -> not possible
          {
            console.error('cannot drop group on project!');
          }
          else //if (dropIs==='group') // -> put group as sibling of other group
          {
            let toPos = foundDrop.model.groups.indexOf(foundDrop.target as LandingPageGroup);
            foundDrop.model.groups.splice(toPos!+(message.pos==='after'?1:0),0,foundDrag.target as LandingPageGroup);
          }           
        }
        else //if (dragIs==='project')
        {
          let fromPos = foundDrag.ownerGroup!.projects.indexOf(foundDrag.target);

          if (message.cloneGUID)
          {
            foundDrag.target = JSON.parse(JSON.stringify(foundDrag.target)); //clone
            foundDrag.target.guid = message.cloneGUID;
          }
          else 
          {
            foundDrag.ownerGroup!.projects.splice(fromPos!,1); //remove from old parent
          }


          if (dropIs==='project') // -> put project as sibling of other project
          {
            let toPos = foundDrop?.ownerGroup?.projects.indexOf(foundDrop.target);
            foundDrop?.ownerGroup?.projects.splice(toPos!+(message.pos==='after'?1:0),0,foundDrag!.target);
          }
          else //if (dropIs==='group') // -> add project as child of group
          {
            (foundDrop.target as LandingPageGroup).projects.push(foundDrag!.target);
          }
        }          
        saveModel(sharedModel);
      }
      break;
    case 'patch':
      let found = findFirst(message.guid,sharedModel);
      if (!found) {vscode.window.showWarningMessage(`GroupOrProject not found: ${message.guid}`);return;}
      if (message.field==='shade')
      {
        (found.target as LandingPageProject).shade=message.value;
        saveModel(sharedModel);
      }
      else if (message.field==='layout')
      {
        (found.target as LandingPageGroup).layout=message.value;
        saveModel(sharedModel);
      }
      else
      {
        console.warn(`Patch field not supported for key ${message.field}.`);
      }
      break;
    case 'openSettings':
      vscode.commands.executeCommand('workbench.action.openSettings', 'vsc-landingpage');
      break;
    default:
      console.log('Unhandled message from webview: ',message);
      // vscode.window.showWarningMessage(`got unknown msg: ${JSON.stringify(message)}`);
      return;
  }

}

