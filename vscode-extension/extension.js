// extension.js
const vscode = require("vscode");
const { diagnose } = require("./diagnostics");

let inProgrammaticEdit = false;

function activate(context) {
  // ── Diagnostics (構文エラー検出) ──
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("noshift");
  context.subscriptions.push(diagnosticCollection);

  function updateDiagnostics(document) {
    if (document.languageId !== "noshift") return;

    const text = document.getText();
    const errors = diagnose(text);
    const diagnostics = errors.map((e) => {
      const range = new vscode.Range(
        e.line,
        e.column,
        e.line,
        e.endColumn,
      );
      const diag = new vscode.Diagnostic(
        range,
        e.message,
        vscode.DiagnosticSeverity.Error,
      );
      diag.source = "NoShift.js";
      return diag;
    });
    diagnosticCollection.set(document.uri, diagnostics);
  }

  // 現在開いている .nsjs ファイルを即座にチェック
  for (const editor of vscode.window.visibleTextEditors) {
    updateDiagnostics(editor.document);
  }

  // ファイルを開いた・切り替えたとき
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) updateDiagnostics(editor.document);
    }),
  );

  // テキストが変更されたとき (デバウンス付き)
  let diagnosticTimer;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId !== "noshift") return;
      if (diagnosticTimer) clearTimeout(diagnosticTimer);
      diagnosticTimer = setTimeout(() => updateDiagnostics(e.document), 300);
    }),
  );

  // ファイルを閉じたとき
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri);
    }),
  );

  // ^[ を入力したとき ^] を自動補完
  const bracketDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
    if (inProgrammaticEdit) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const doc = e.document;
    if (doc.languageId !== "noshift") return;
    if (e.contentChanges.length !== 1) return;

    const change = e.contentChanges[0];
    if (change.text !== "[") return;

    const insertPos = change.range.start;
    const prevPos = insertPos.translate(0, -1);
    const prevChar = doc.getText(new vscode.Range(prevPos, insertPos));
    if (prevChar !== "^") return;

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

  context.subscriptions.push(bracketDisposable);

  // vscode-icons がインストールされている場合、.nsjs のファイルアイコン関連付けを設定する
  registerVscodeIconsAssociation();
}

/**
 * vscode-icons (vscode-icons-team.vscode-icons) が有効な場合、
 * vsicons.associations.files に以下の関連付けを追加する (初回のみ)。
 *   - .nsjs 拡張子       → javascript アイコン
 *   - nsjsconfig.json   → javascript アイコン (同じ見た目に統一)
 *   - nsjslinter.json   → javascript アイコン
 */
async function registerVscodeIconsAssociation() {
  const vsiconsExt = vscode.extensions.getExtension("vscode-icons-team.vscode-icons");
  if (!vsiconsExt) return;

  const config = vscode.workspace.getConfiguration("vsicons.associations");
  const files = config.get("files") ?? [];

  const hasNsjs = files.some(
    (e) => Array.isArray(e.extensions) && e.extensions.includes("nsjs") && !e.filename
  );
  const hasConfig = files.some(
    (e) => Array.isArray(e.extensions) && e.extensions.includes("nsjsconfig.json") && e.filename
  );
  const hasLinter = files.some(
    (e) => Array.isArray(e.extensions) && e.extensions.includes("nsjslinter.json") && e.filename
  );

  if (hasNsjs && hasConfig && hasLinter) return;

  const updated = [...files];
  if (!hasNsjs) {
    updated.push({ icon: "javascript", extensions: ["nsjs"], format: "svg" });
  }
  if (!hasConfig) {
    updated.push({ icon: "javascript", extensions: ["nsjsconfig.json"], format: "svg", filename: true });
  }
  if (!hasLinter) {
    updated.push({ icon: "javascript", extensions: ["nsjslinter.json"], format: "svg", filename: true });
  }

  try {
    await config.update("files", updated, vscode.ConfigurationTarget.Global);
  } catch {
    // 設定の更新に失敗した場合は無視する
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
