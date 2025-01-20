import * as vscode from 'vscode';
import { findFirst, LandingPageGroup, LandingPageModel, LandingPageProject, ScanResult } from './LandingPageModel';
import { group } from 'console';


interface MessageFromWebview
{
	command:'documentReady'|'rename'|'createBookmark'|'createGroup'|'remove'|'open'|'move';

	//text?:string;
  /** GUID value of model fragment this command refers to. */
	guid?:string;
  /** For command createBookmark: if true, a folder picker is shown, else a filepicker is shown.  */
  pickFolder?:boolean;  
  /** If true, comman `remove` will not show a confirmation dialog. */
  dontAsk?:boolean;

  guid2?:string;
  pos?:'before'|'after';
}

interface MessageToWebview
{
  command:string;
  model:LandingPageModel;
}

// export class LandingPageCommunication
// {
//   private webviewPanel:vscode.WebviewPanel|undefined;
//   private model:LandingPageModel=demoModel;

//   public LandingPageCommunication(webviewPanel:vscode.WebviewPanel)
//   {
//     this.webviewPanel=webviewPanel;
//   }

  // public dispose()
  // {
  //   this.webviewPanel=undefined;
  // }

  function sendMessageToWebview(message:MessageToWebview, webviewPanel:vscode.WebviewPanel):void
  {
    // console.log('main: send message to view',message, this.webviewPanel);
    webviewPanel.webview.postMessage(message);
  }

  let landingPageExtContext: vscode.ExtensionContext;
  export function registerContext(ctx: vscode.ExtensionContext):void
  {
    landingPageExtContext = ctx;
  }

  function saveModel(model:LandingPageModel):void
  {
    landingPageExtContext.globalState.update('landingPageModel',model);
  }
  

  export async function handleMessageFromWebview(message:MessageFromWebview,webviewPanel:vscode.WebviewPanel, sharedModel:LandingPageModel):Promise<void>
  {
    // console.log('main: handle message',this);
    switch(message.command)
    {
      case 'documentReady':
        sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel); // when webview is ready, send model to it
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
              let name = uri.fsPath.split(/[\\\/]/).pop()||'error';

              let pos = name.lastIndexOf('.');
              let basename=name; let ext='';
              if (pos>0) //file
              {
                basename = name.substring(0,pos);
                ext = name.substring(pos+1);
              }
              //else //folder
              
              const p:LandingPageProject =     {guid:crypto.randomUUID(), label:basename, path:uri.toString()};
              if (ext.length===0)              {p.icon = 'folder';}
              else if (ext==='code-workspace') {p.icon = 'workspace';}
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
        sharedModel.groups.push({guid:crypto.randomUUID(),label:'Group',projects:[]});
        console.log('updated model > created Group',sharedModel);
        sendMessageToWebview({command:'syncModel',model:sharedModel}, webviewPanel);
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
            foundDrag.ownerGroup!.projects.splice(fromPos!,1); //remove from old parent

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
      default:
        console.log('Unhandled message from webview: ',message);
        // vscode.window.showWarningMessage(`got unknown msg: ${JSON.stringify(message)}`);
        return;
    }

  }


// }
