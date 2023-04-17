import * as vscode from 'vscode'
import { onRunEnded, onRunStarted, runScript, stopAllScripts } from './source-runner/extension'

const header = `> Play this document as a notebook with the [Ziffers & Sonic Pi extension for VS Code](https://marketplace.visualstudio.com/items?itemName=amiika.vscode-ziffers\n`

export const serializer: vscode.NotebookSerializer = {
	serializeNotebook: (book: vscode.NotebookData) =>
		Buffer.from(
			[
				header,
				...book.cells.map((cell) =>
					cell.kind === vscode.NotebookCellKind.Markup
						? `${cell.value}`
						: `\`\`\`\n${cell.value}\n\`\`\``,
				),
			].join('\n'),
		),
	deserializeNotebook: (content) => {
		const string = Buffer.from(content).toString().replace(header, '')

		if (string.length === 0) {
			return new vscode.NotebookData([
				new vscode.NotebookCellData(
					vscode.NotebookCellKind.Code,
					`# Write Ziffers or Sonic Pi code`,
					'sonic-pi',
				),
			])
		}

		let cells: vscode.NotebookCellData[] = []

		let bufferKind: vscode.NotebookCellKind = vscode.NotebookCellKind.Markup
		let bufferContents: string[] = []
		string.split('\n').forEach((line) => {
			if (
				line.startsWith('#') &&
				bufferKind !== vscode.NotebookCellKind.Code &&
				bufferContents.length &&
				bufferContents.join('\n').trim().length
			) {
				cells.push(new vscode.NotebookCellData(bufferKind, bufferContents.join('\n'), 'markdown'))
				bufferKind = vscode.NotebookCellKind.Markup
				bufferContents = []
				bufferContents.push(line)
			} else if (line === '```' && bufferKind !== vscode.NotebookCellKind.Code) {
				cells.push(new vscode.NotebookCellData(bufferKind, bufferContents.join('\n'), 'markdown'))
				bufferKind = vscode.NotebookCellKind.Code
				bufferContents = []
			} else if (line === '```') {
				cells.push(new vscode.NotebookCellData(bufferKind, bufferContents.join('\n'), 'sonic-pi'))
				bufferKind = vscode.NotebookCellKind.Markup
				bufferContents = []
			} else {
				bufferContents.push(line)
			}
		})

		if (bufferContents.length) {
			cells.push(
				new vscode.NotebookCellData(
					bufferKind,
					bufferContents.join('\n'),
					bufferKind === vscode.NotebookCellKind.Markup ? 'markdown' : 'sonic-pi',
				),
			)
		}

		return new vscode.NotebookData(cells)
	},
}

type CellWorkingCopy = {
	content: string
	execution: vscode.NotebookCellExecution
	cell: vscode.NotebookCell
	hasEnded: boolean
}

const endExecution = (cell: CellWorkingCopy, reason: string) => {
	if (!cell.hasEnded) {
		cell.execution.end(true)
		console.log('ending cell', cell, ' because ', reason)
	}
	cell.hasEnded = true
}

type NotebookWorkingCopy = {
	executionHistory: Map<string, CellWorkingCopy>
	notebook: vscode.NotebookDocument
}

const getKey = (thing: vscode.NotebookCell | vscode.NotebookDocument) =>
	((thing as vscode.NotebookDocument).uri ?? (thing as vscode.NotebookCell).document.uri).toString()

export class NotebookController {
	private workingCopies = new Map<string, NotebookWorkingCopy>()
	private controller: vscode.NotebookController
	private pendingExecutions: (() => void)[] = []
	private sentExecutions: Map<number, () => void> = new Map()

	private disposables = new Set<{ dispose: () => void }>()

	constructor(id: string, notebookType: string, label: string) {
		this.controller = vscode.notebooks.createNotebookController(
			id,
			notebookType,
			label,
			this.handler.bind(this),
		)

		this.disposables.add(this.controller)

		this.disposables.add(
			onRunStarted((num) => {
				if (this.pendingExecutions.length) {
					const started = this.pendingExecutions.shift()!
					this.sentExecutions.set(num, started)
				}
			}),
		)

		this.disposables.add(
			onRunEnded((num) => {
				this.sentExecutions.get(num)?.()
			}),
		)

		this.controller.supportedLanguages = ['sonic-pi']
	}

	dispose() {
		for (const disposable of this.disposables.values()) {
			disposable.dispose()
		}
		this.disposables.clear()
	}

	stopNotebook(cellUri: string) {
		for (const notebookWorkingCopy of this.workingCopies.values()) {
			const cellWorkingCopy = notebookWorkingCopy.executionHistory.get(cellUri)
			if (cellWorkingCopy) {
				for (const entry of notebookWorkingCopy.executionHistory.values()) {
					endExecution(entry, 'stopNotebook')
				}
			}
			stopAllScripts()
			notebookWorkingCopy.executionHistory.clear()
		}
	}

	async playCellFromURI(cellUri: string) {
		let notebook: vscode.NotebookDocument | undefined = undefined
		let cell: vscode.NotebookCell | undefined = undefined
		for (const notebookWorkingCopy of this.workingCopies.values()) {
			const cellWorkingCopy = notebookWorkingCopy.executionHistory.get(cellUri)
			if (cellWorkingCopy) {
				notebook = notebookWorkingCopy.notebook
				cell = cellWorkingCopy.cell
			}
		}

		if (!notebook || !cell) {
			throw Error(
				'Can not find cell... please use the run button for first play of a cell rather than keybindings!',
			)
		}

		const executed = this.queueCell(notebook, cell)
		await this.triggerPlay(notebook)
		endExecution(executed, 'playcellFromURI')
	}

	private async handler(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument): Promise<void> {
		const workingCopy: NotebookWorkingCopy = this.workingCopies.get(getKey(notebook)) ?? {
			executionHistory: new Map<string, CellWorkingCopy>(),
			notebook,
		}

		this.workingCopies.set(notebook.uri.toString(), workingCopy)

		const cellWorkingCopies = cells.map((cell) => this.queueCell(notebook, cell))
		await this.triggerPlay(notebook)
		cellWorkingCopies.forEach((e) => endExecution(e, 'handler'))
	}

	private queueCell(notebook: vscode.NotebookDocument, cell: vscode.NotebookCell): CellWorkingCopy {
		const workingCopy: NotebookWorkingCopy = this.workingCopies.get(getKey(notebook)) ?? {
			executionHistory: new Map<string, CellWorkingCopy>(),
			notebook,
		}

		const existingRun = workingCopy.executionHistory.get(getKey(cell))
		if (existingRun) {
			endExecution(existingRun, 'queue found existing')
		}

		const execution = this.controller.createNotebookCellExecution(cell)
		execution.start()
		const scriptAsRun = cell.document.getText()
		const cellWorkingCopy = {
			content: scriptAsRun,
			execution,
			cell,
			hasEnded: false,
		}

		workingCopy.executionHistory.set(getKey(cell), cellWorkingCopy)

		execution.token.onCancellationRequested(async () => {
			endExecution(cellWorkingCopy, 'stopping')

			await this.runScript(silenceScript(scriptAsRun))

			workingCopy.executionHistory.delete(getKey(cell))
		})
		return cellWorkingCopy
	}

	private async triggerPlay(notebook: vscode.NotebookDocument): Promise<void> {
		const workingCopy: NotebookWorkingCopy = this.workingCopies.get(getKey(notebook)) ?? {
			executionHistory: new Map<string, CellWorkingCopy>(),
			notebook,
		}

		const cells = notebook.getCells()

		const scriptToPlay = cells
			.map((cell) => workingCopy.executionHistory.get(getKey(cell))?.content)
			.filter((x): x is string => x !== undefined)
			.join('\n')

		workingCopy.executionHistory.clear()
		await this.runScript(scriptToPlay)
	}

	private runScript(script: string): Promise<void> {
		return new Promise((c) => {
			let hasResolved = false
			const resolve = () => {
				if (!hasResolved) c()
				hasResolved = true
			}
			this.pendingExecutions.push(resolve)
			runScript(script)
		})
	}
}

const silenceScript = (script: string): string => {
	const regexp = /live_loop :([a-zA-Z0-9_]+) do/g
	const loops = script.match(regexp)
	let stops = ''
	console.log(loops)
	if (loops) {
		for (const loop of loops) {
			stops += 'stop_thread ' + '"' + loop + '"' + '\n'
		}
	}
	const zregexp = /z[0-9]+/g
	const zloops = script.match(zregexp)
	if (zloops) {
		for (const loop of zloops) {
			stops += 'stop_thread ' + '"' + loop + '"' + '\n'
		}
	}
	console.log(stops)
	return stops
}
