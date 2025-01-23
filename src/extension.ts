// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';
import { LandingPageTemplate } from './LandingPage/LandingPageTemplate';
import { handleMessageFromWebview, registerContext } from './LandingPage/communication';
import { demoModel, LandingPageModel } from './LandingPage/LandingPageModel';
import { importVscRecentList } from './LandingPage/history';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) 
{
	registerContext(context);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('vsc-landingpage.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showWarningMessage('💎 Hello from vsc-landingpage!');
	// });
	// context.subscriptions.push(disposable);

	const disposable = vscode.commands.registerCommand('vsc-landingpage.setColor', (...args) => {
		console.log('💧 Set Color',args);
		vscode.window.showWarningMessage('💧 Set color');
	});
	context.subscriptions.push(disposable);

	const cmdShowWelcomePage = vscode.commands.registerCommand('vsc-landingpage.showWelcomePage', async() => 
	{
		try 
		{
			// if (isTabInstanceOpen()) 
			// {
			// 	return;
			// };

			const panelIconPath = {
					light: vscode.Uri.file(join(context.extensionPath, 'assets', 'icon.png')),
					dark: vscode.Uri.file(join(context.extensionPath, 'assets',  'icon.png'))
			};

			const webviewPanel = window.createWebviewPanel(
					'vsc-landingpage',
					'Landingpage',
					vscode.ViewColumn.One,
					{
							enableScripts: true,
							// retainContextWhenHidden: true,							
					}
			);

			webviewPanel.iconPath = panelIconPath;

			// const communication = new LandingPageCommunication();
			// webviewPanel.onDidDispose(()=>{communication.dispose();});
			// const model:LandingPageModel = JSON.parse(JSON.stringify(demoModel));
			// model.groups[0].label='ModelX!';
			const model:LandingPageModel = context.globalState.get<LandingPageModel>('landingPageModel')|| {groups:[]};

			webviewPanel.webview.onDidReceiveMessage(async message => await handleMessageFromWebview(message, webviewPanel, model), undefined, context.subscriptions);
			//webviewPanel.webview.html = new LandingPageBuilder().makeHTML(); // getWebviewContent(await gerRecentProjects(), context, webviewPanel);
			webviewPanel.webview.html = new LandingPageTemplate().makeHTML(); // getWebviewContent(await gerRecentProjects(), context, webviewPanel);

			importVscRecentList();

			
		} catch (err: any) {
				// Logger.GetInstance().log(`Exception opening extension at path: ${JSON.stringify(err.message)}`);
		}
		

		//vscode.window.showInformationMessage('Starting the Landinpage');
	});
	context.subscriptions.push(cmdShowWelcomePage);


	// Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
	console.log('vsc-landingpage is now active!');
}

// This method is called when your extension is deactivated
export function deactivate() 
{

}


