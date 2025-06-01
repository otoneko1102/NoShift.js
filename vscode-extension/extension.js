// extension.js
const path = require("path");
const vscode = require("vscode");

let inProgrammaticEdit = false;

function activate(context) {
  const disposable = vscode.workspace.onDidChangeTextDocument((e) => {
    if (inProgrammaticEdit) { return; }

    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    const doc = e.document;
    if (doc.languageId !== "noshift") { return; }
    if (e.contentChanges.length !== 1) { return; }

    const change = e.contentChanges[0];
    if (change.text !== "[") { return; }

    const insertPos = change.range.start;
    const prevPos = insertPos.translate(0, -1);
    const prevChar = doc.getText(new vscode.Range(prevPos, insertPos));
    if (prevChar !== "^") { return; }

    const afterBracketPos = insertPos.translate(0, 1);
    inProgrammaticEdit = true;

    editor
      .edit((editBuilder) => {
        editBuilder.insert(afterBracketPos, "^]");
      })
      .then((success) => {
        if (success) {
          const newCursor = new vscode.Position(
            afterBracketPos.line,
            afterBracketPos.character + 1
          );
          editor.selection = new vscode.Selection(newCursor, newCursor);
        }
      })
      .finally(() => {
        setTimeout(() => {
          inProgrammaticEdit = false;
        }, 0);
      });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  // 特にクリーンアップ不要
}

module.exports = { activate, deactivate };
