// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

const QOI = require('qoijs') as any
import * as fastpng from 'fast-png'
//function decode (arrayBuffer, byteOffset, byteLength, outputChannels) {

class QOICustomDocument implements vscode.CustomDocument {
	statusBarItem: vscode.StatusBarItem;
	base: string;

	constructor (public uri: vscode.Uri) {
		let bytes = fs.readFileSync(this.uri.fsPath);
		const KB = bytes.byteLength / 1024;
		let info = QOI.decode(bytes, 0, bytes.byteLength, 4) as {width:number,height:number,colorspace:number,channels:number,data:Uint8Array}
		let obytes = fastpng.encode(info, { zlib: { level: 1 } })
		let base = Buffer.from(obytes).toString('base64');
		this.base = base

		this.statusBarItem = vscode.window.createStatusBarItem('qoi_size', vscode.StatusBarAlignment.Right, 0)
		this.statusBarItem.text = `${info.width}x${info.height}     ${KB|0}KB`
		this.statusBarItem.show()
	}
	dispose(): void {
		this.statusBarItem.hide()
	}

}

class QOIImageEditorProvider implements vscode.CustomReadonlyEditorProvider<QOICustomDocument> {
	constructor(
		private readonly _context: vscode.ExtensionContext
	) { }

	static readonly viewType = 'korge-vscode.qoi';

	openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): QOICustomDocument | Thenable<QOICustomDocument> {
		//throw new Error(`Error[1]: ${uri}`);
		return Promise.resolve(new QOICustomDocument(uri));
	}
	resolveCustomEditor(document: QOICustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
		//throw new Error(`Error[1]: ${document}`);
		try {
			webviewPanel.webview.html = `
				<html>
				<body>
				<img src="data:image/png;base64,${document.base}" />
				</body>
				</html>
			`

			//throw new Error(`Error: ${image}`);
		} catch (e) {
			console.error(e)
			webviewPanel.webview.html = `
			<html>
			<body>
			Error: ${e}
			</body>
			</html>
			`
		}

	}

}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "korge-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('korge-vscode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from korge-vscode!');
	});

	context.subscriptions.push(disposable);
	let disposable2 = vscode.window.registerCustomEditorProvider(QOIImageEditorProvider.viewType, new QOIImageEditorProvider(context));
	//context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class Dependency extends vscode.TreeItem {
}