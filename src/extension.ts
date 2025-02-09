// The module 'vscode' contains the VS Code extensibility API
import { join } from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';
import { handleMessageFromWebview, registerContext, resetModel, syncModelInWebview } from './LandingPage/communication';
import { LandingPageModel } from './LandingPage/LandingPageModel';
import { importVscRecentList } from './LandingPage/history';
import { LandingPageTemplate2 } from './LandingPage/LandingPageTemplate2';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) 
{
	registerContext(context);

	let landingpageWebviewPanel:vscode.WebviewPanel|null = null;
	let model:LandingPageModel = {groups:[]};

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('vsc-landingpage.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showWarningMessage('💎 Hello from vsc-landingpage!');
	// });
	// context.subscriptions.push(disposable);

	const cmdReset = vscode.commands.registerCommand('vsc-landingpage.reset', (...args) => {
		console.log('vsc-landingpage.reset',args);
		vscode.window.showWarningMessage("Reset content of landingpage? This will remove all custom bookmarks and groups. This cannot be undone.", "Yes", "No")
							.then(answer => { if (answer === "Yes") { 
								resetModel(model).then(()=>{
									if (landingpageWebviewPanel) {syncModelInWebview(landingpageWebviewPanel!, model);}
								});								
							 }});
	});
	context.subscriptions.push(cmdReset);

	const cmdReload = vscode.commands.registerCommand('vsc-landingpage.reload', (...args) => {
		console.log('vsc-landingpage.reload',args);
		// vscode.window.showWarningMessage("Reset content of landingpage? This will remove all custom bookmarks and groups. This cannot be undone.", "Yes", "No")
		// 					.then(answer => { if (answer === "Yes") { 
		// 						resetModel(model);
		// 					 }});
		if (landingpageWebviewPanel) {syncModelInWebview(landingpageWebviewPanel!, model);}
	});
	context.subscriptions.push(cmdReload);

	//console.log(`Creating vsc-landingpage.showWelcomePage`);

	const cmdShowWelcomePage = vscode.commands.registerCommand('vsc-landingpage.showWelcomePage', async() => 
	{
		try 
		{
			if (landingpageWebviewPanel)
			{
				landingpageWebviewPanel.reveal();
				return;
			}

			const panelIconPath = {
					light: vscode.Uri.file(join(context.extensionPath, 'assets', 'icon.png')),
					dark: vscode.Uri.file(join(context.extensionPath, 'assets',  'icon.png'))
			};

			landingpageWebviewPanel = window.createWebviewPanel(
					'vsc-landingpage',
					'Landingpage',
					vscode.ViewColumn.One,
					{
							enableScripts: true,
							// retainContextWhenHidden: true,							
					}
			);

			landingpageWebviewPanel.iconPath = panelIconPath;

			/** Webview-accessible path to src/assets which is for example required to load custom cursors.  */
			const assetPath:vscode.Uri = landingpageWebviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src','assets'));

			// const communication = new LandingPageCommunication();
			// webviewPanel.onDidDispose(()=>{communication.dispose();});
			// const model:LandingPageModel = JSON.parse(JSON.stringify(demoModel));
			// model.groups[0].label='ModelX!';

			model = context.globalState.get<LandingPageModel>('landingPageModel')|| {groups:[]};

			landingpageWebviewPanel.webview.onDidReceiveMessage(async message => await handleMessageFromWebview(message, landingpageWebviewPanel!, model), undefined, context.subscriptions);
			landingpageWebviewPanel.webview.html = new LandingPageTemplate2().makeHTML(assetPath); // getWebviewContent(await gerRecentProjects(), context, webviewPanel);

			landingpageWebviewPanel.onDidDispose(()=>{landingpageWebviewPanel=null;});

			importVscRecentList(); //refresh VS Code's mru items
			
		}
		catch (err: any) 
		{
			console.error(`vsc-landingpage: Exception opening extension: ${JSON.stringify(err.message)}`);
		}

		//vscode.window.showInformationMessage('Starting the Landinpage');
	});
	context.subscriptions.push(cmdShowWelcomePage);
	
	
	console.log('vsc-landingpage is now active!');
	if (vscode.workspace.getConfiguration('vsc-landingpage').get<boolean>('autoshowOnStartup')===true && !vscode.workspace.workspaceFolders)
	{
		vscode.commands.executeCommand('vsc-landingpage.showWelcomePage');
	}
}

// This method is called when your extension is deactivated
export function deactivate() 
{

}


