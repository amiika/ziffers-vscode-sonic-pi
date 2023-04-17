import * as vscode from 'vscode'
import { getValidArgumentsAtPosition } from './argsParser'
import { samples, synths, fx, commands, scales } from './builtins/builtins'

export class CommandCompletionItemProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		if (document.lineAt(position.line).firstNonWhitespaceCharacterIndex < position.character) {
			return []
		}
		return commands.map((command) => ({
			label: command.token,
		}))
	}
}

export class SampleCompletionItemProvider implements vscode.CompletionItemProvider {
	static triggerCharacters = [' ']

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const line = document.lineAt(position.line).text
		const last = line.split(',').pop() as string
		if (!(/sample/.test(last) || /sample:/.test(last) || /[A-Z]:/.test(last))) {
			return []
		}
		return samples.map((sample) => ({
			label: sample.id,
			insertText: ':' + sample.id,
			detail: sample.name,
			documentation: sample.detail,
		}))
	}
}

export class SynthCompletionItemProvider implements vscode.CompletionItemProvider {
	static triggerCharacters = [' ']

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const line = document.lineAt(position.line).text
		const last = line.split(',').pop() as string
		if (!(/synth/.test(last) || /synth:/.test(last))) {
			return []
		}
		return synths.map((synth) => ({
			label: synth.id,
			insertText: ':' + synth.id,
			detail: synth.name,
			documentation: synth.detail,
		}))
	}
}

export class ScaleCompletionItemProvider implements vscode.CompletionItemProvider {
	static triggerCharacters = [' ']

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const line = document.lineAt(position.line).text
		const last = line.split(',').pop() as string
		if (!(/scale/.test(last) || /scale:/.test(last))) {
			return []
		}
		return scales.map((scale) => ({
			label: scale.id,
			insertText: ':' + scale.id,
			detail: scale.name,
			documentation: scale.detail,
		}))
	}
}

export class FxCompletionItemProvider implements vscode.CompletionItemProvider {
	static triggerCharacters = [' ']

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const line = document.lineAt(position.line).text
		const last = line.split(',').pop() as string
		if (!(/with_fx/.test(last) || /with_fx:/.test(last))) {
			return []
		}
		return fx.map((fx) => ({
			label: fx.id,
			insertText: ':' + fx.id,
			detail: fx.name,
			documentation: fx.detail,
		}))
	}
}

export class ArgumentsCompletionItemProvider implements vscode.CompletionItemProvider {
	static triggerCharacters = [' ']

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext,
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		return getValidArgumentsAtPosition(document, position).map((item) => ({
			...item,
			insertText: item.label + ': ',
		}))
	}
}
