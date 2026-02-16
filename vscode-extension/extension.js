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

  // 以前のバージョンで汚染された vscode-icons 設定をクリーンアップ
  cleanupVscodeIconsSettings();
}

/**
 * 以前のバージョンの拡張機能が vsicons.associations.files と
 * vsicons.customIconFolderPath に書き込んだ設定をクリーンアップする。
 * これらの設定はバージョン変更時にパスが無効になり、アイコン表示が壊れる原因だった。
 * contributes.languages[].icon のフォールバック機能で十分対応できるため削除する。
 */
async function cleanupVscodeIconsSettings() {
  try {
    const assocConfig = vscode.workspace.getConfiguration("vsicons.associations");
    const files = assocConfig.get("files") ?? [];

    // noshift / javascript 関連の nsjs エントリを除去
    const cleaned = files.filter((e) => {
      if (!Array.isArray(e.extensions)) return true;
      if ((e.icon === "noshift" || e.icon === "javascript") &&
          (e.extensions.includes("nsjs") ||
           e.extensions.includes("nsjsconfig.json") ||
           e.extensions.includes("nsjslinter.json"))) {
        return false;
      }
      return true;
    });

    if (cleaned.length !== files.length) {
      if (cleaned.length === 0) {
        await assocConfig.update("files", undefined, vscode.ConfigurationTarget.Global);
      } else {
        await assocConfig.update("files", cleaned, vscode.ConfigurationTarget.Global);
      }
    }

    // customIconFolderPath が noshift-vscode のパスを指している場合はリセット
    const vsiconsConfig = vscode.workspace.getConfiguration("vsicons");
    const customPath = vsiconsConfig.get("customIconFolderPath") ?? "";
    if (customPath.includes("noshift-vscode") || customPath.includes("noshift.js")) {
      await vsiconsConfig.update("customIconFolderPath", undefined, vscode.ConfigurationTarget.Global);
    }
  } catch {
    // 設定の更新に失敗した場合は無視する (vscode-icons 未インストール時など)
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
