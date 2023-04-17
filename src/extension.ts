import * as vscode from 'vscode'
import {
	ArgumentsCompletionItemProvider,
	CommandCompletionItemProvider,
	FxCompletionItemProvider,
	SampleCompletionItemProvider,
	SynthCompletionItemProvider,
	ScaleCompletionItemProvider,
} from './completionItems'
import { HoverProvider } from './HoverProvider'
import { serializer, NotebookController } from './notebook'
import { activate as activate_runner } from './source-runner/extension'

const selector = { language: 'sonic-pi' }

export function activate(context: vscode.ExtensionContext) {
	activate_runner(context)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.checkInstall', () => {
			void vscode.commands.executeCommand('setContext', 'sonicPiInstalled', true)
			void vscode.window.showInformationMessage('All Good!')
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.openExamples', () => {
			void vscode.commands.executeCommand(
				'vscode.openFolder',
				vscode.Uri.joinPath(context.extensionUri, 'examples'),
			)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.openTutorial', () => {
			void vscode.commands.executeCommand(
				'vscode.openWith',
				vscode.Uri.joinPath(context.extensionUri, 'tutorial', '1_Welcome to Sonic Pi.pibook'),
				'ziffers-book',
			)
		}),
	)

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			selector,
			new SampleCompletionItemProvider(),
			...SampleCompletionItemProvider.triggerCharacters,
		),
		vscode.languages.registerCompletionItemProvider(
			selector,
			new SynthCompletionItemProvider(),
			...SynthCompletionItemProvider.triggerCharacters,
		),
		vscode.languages.registerCompletionItemProvider(
			selector,
			new ScaleCompletionItemProvider(),
			...ScaleCompletionItemProvider.triggerCharacters,
		),
		vscode.languages.registerCompletionItemProvider(
			selector,
			new FxCompletionItemProvider(),
			...FxCompletionItemProvider.triggerCharacters,
		),
		vscode.languages.registerCompletionItemProvider(
			selector,
			new ArgumentsCompletionItemProvider(),
			...ArgumentsCompletionItemProvider.triggerCharacters,
		),
		vscode.languages.registerHoverProvider(selector, new HoverProvider()),
		vscode.languages.registerCompletionItemProvider(selector, new CommandCompletionItemProvider()),
		vscode.workspace.registerNotebookSerializer('ziffers-book', serializer, { transientOutputs: true }),
	)

	const notebookController = new NotebookController('ziffers-book-kernel', 'ziffers-book', 'Ziffers Player')

	context.subscriptions.push(notebookController)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.runCell', async () => {
			const cellUri = vscode.window.activeTextEditor?.document.uri
			if (cellUri) {
				void notebookController.playCellFromURI(cellUri.toString())
			}
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.stopNotebook', async () => {
			const cellUri = vscode.window.activeTextEditor?.document.uri
			if (cellUri) {
				notebookController.stopNotebook(cellUri.toString())
			}
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('ziffers-vscode-sonic-pi.newNotebook', async () => {
			await vscode.commands.executeCommand('workbench.action.files.newUntitledFile', {
				viewType: 'ziffers-book',
			})
		}),
	)
}
export function deactivate() {}
