export type Lang = "en" | "ja";

export const defaultLang: Lang = "en";

export const languages: Record<Lang, string> = {
  en: "English",
  ja: "日本語",
};

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang === "ja") return "ja";
  return "en";
}

export function getAlternateUrl(url: URL, targetLang: Lang): string {
  const segments = url.pathname.split("/");
  segments[1] = targetLang;
  return segments.join("/");
}

export const ui = {
  en: {
    // Site
    "site.title": "NoShift.js — Documentation",
    "site.description":
      "NoShift.js is a joke language that lets you write JavaScript without pressing the Shift key. Compile .nsjs files to plain JS.",
    "site.ogTitle": "NoShift.js — Write JS Without Shift",
    "site.ogDescription":
      "A joke language that replaces shifted symbols with ^-prefixed sequences. Compiles to plain JavaScript.",

    // Nav
    "nav.home": "Home",
    "nav.gettingStarted": "Getting Started",
    "nav.syntax": "Syntax & Symbols",
    "nav.cli": "CLI Reference",
    "nav.vscode": "VS Code Extension",
    "nav.github": "GitHub",
    "nav.npm": "npm",

    // Home
    "home.title": "NoShift.js",
    "home.tagline": "Write JavaScript without pressing the Shift key.",
    "home.description":
      "A joke language that replaces every shift-required symbol with a <code>^</code>-prefixed sequence. <code>.nsjs</code> files compile directly to plain JavaScript via the <code>nsc</code> CLI.",
    "home.getStarted": "Get Started",
    "home.viewOnGithub": "View on GitHub",
    "home.feature1Title": "No Shift Required",
    "home.feature1Desc":
      "All shifted symbols are replaced by simple <code>^</code> + key sequences based on a JIS keyboard layout.",
    "home.feature2Title": "Instant Compilation",
    "home.feature2Desc":
      "The <code>nsc</code> CLI compiles <code>.nsjs</code> files to standard JavaScript in milliseconds.",
    "home.feature3Title": "VS Code Support",
    "home.feature3Desc":
      "Syntax highlighting and auto-complete via the official VS Code extension.",
    "home.quickExample": "Quick Example",
    "home.compilesTo": "Compiles to:",
    "home.version": "Version",
    "home.weeklyDownloads": "Weekly Downloads",
    "home.lastPublished": "Last Published",
    "home.install": "Install",
    "home.links": "Links",
    "home.copied": "Copied!",

    // Getting Started
    "gs.title": "Getting Started",
    "gs.installTitle": "Installation",
    "gs.installDesc": "Install globally via npm:",
    "gs.createTitle": "Create a Project",
    "gs.createDesc": "Scaffold a new NoShift.js project interactively:",
    "gs.createNote":
      "This creates a project directory with <code>nsjsconfig.json</code>, <code>src/</code> folder, and installs dependencies.",
    "gs.configTitle": "Configuration",
    "gs.configDesc":
      "The project config file <code>nsjsconfig.json</code> controls compiler options:",
    "gs.configRootDir": "Source file directory (default: <code>src</code>)",
    "gs.configOutDir": "Output directory (default: <code>build</code>)",
    "gs.compileTitle": "Compile & Run",
    "gs.compileDesc": "Compile all <code>.nsjs</code> files:",
    "gs.runDesc": "Or run a file directly without compiling:",
    "gs.fileExt": "File Extension",
    "gs.fileExtDesc":
      "NoShift.js files use the <code>.nsjs</code> extension. Files prefixed with <code>_</code> (e.g. <code>_helper.nsjs</code>) are ignored by the compiler.",

    // Syntax
    "syntax.title": "Syntax & Symbols",
    "syntax.introTitle": "How It Works",
    "syntax.introDesc":
      "NoShift.js uses <code>^</code> (caret) as a prefix to represent shifted symbols. The mapping is based on a Japanese JIS keyboard layout.",
    "syntax.tableTitle": "Symbol Map",
    "syntax.tableShifted": "Shifted Key",
    "syntax.tableNoshift": "NoShift.js",
    "syntax.escapeTitle": "Escaping in Strings",
    "syntax.escapeDesc":
      "Inside string literals (<code>^2...^2</code>, <code>^7...^7</code>, <code>^@...^@</code>), <code>^</code> sequences are <strong>not</strong> converted to shifted symbols. This allows you to include literal <code>^</code> characters:",
    "syntax.templateTitle": "Template Literals",
    "syntax.templateDesc":
      "Template literals use <code>^@</code> (backtick) and template expressions use <code>^4^[</code> (<code>${</code>) to start and <code>^]</code> (<code>}</code>) to end:",
    "syntax.helloTitle": "Hello World",
    "syntax.helloInput": "Input:",
    "syntax.helloOutput": "Output:",

    // CLI
    "cli.title": "CLI Reference",
    "cli.introDesc":
      "The <code>nsc</code> command-line tool compiles and manages NoShift.js projects.",
    "cli.compileTitle": "nsc (compile)",
    "cli.compileDesc":
      "Compile all <code>.nsjs</code> files from <code>rootDir</code> to <code>outDir</code> as defined in <code>nsjsconfig.json</code>.",
    "cli.watchTitle": "nsc -w, --watch",
    "cli.watchDesc": "Watch for file changes and recompile automatically.",
    "cli.runTitle": "nsc run &lt;file&gt;",
    "cli.runDesc":
      "Compile and execute a <code>.nsjs</code> file directly without writing output files.",
    "cli.createCmdTitle": "nsc create [name]",
    "cli.createCmdDesc":
      "Scaffold a new NoShift.js project interactively. Prompts for language, project name, and Prettier configuration.",
    "cli.initTitle": "nsc --init",
    "cli.initDesc":
      "Create a <code>nsjsconfig.json</code> in the current directory with default settings.",
    "cli.cleanTitle": "nsc --clean",
    "cli.cleanDesc":
      "Delete the output directory (<code>outDir</code>) defined in <code>nsjsconfig.json</code>.",
    "cli.versionTitle": "nsc --version",
    "cli.versionDesc": "Display the current version of noshift.js.",

    // VS Code
    "vscode.title": "VS Code Extension",
    "vscode.introDesc":
      "The official VS Code extension provides first-class editor support for NoShift.js.",
    "vscode.installTitle": "Installation",
    "vscode.installDesc":
      "Search for <strong>NoShift.js</strong> in the VS Code Extensions marketplace, or install directly:",
    "vscode.installLink": "View on Marketplace",
    "vscode.featuresTitle": "Features",
    "vscode.feature1": "Syntax highlighting for <code>.nsjs</code> files",
    "vscode.feature2": "Auto-complete for NoShift.js <code>^</code> sequences",
    "vscode.feature3": "File icon for <code>.nsjs</code> files",
    "vscode.feature4": "Code snippets for common patterns",
    "vscode.idTitle": "Extension ID",

    // Footer
    "footer.license": "MIT License",
    "footer.madeBy": "Made by",

    // 404
    "404.title": "404 — Page Not Found",
    "404.description":
      "The page you are looking for does not exist or has been moved.",
    "404.back": "Back to Home",
  },
  ja: {
    // Site
    "site.title": "NoShift.js — ドキュメント",
    "site.description":
      "NoShift.js は Shift キーを押さずに JavaScript を書ける Joke 言語です。.nsjs ファイルを plain JS にコンパイルします。",
    "site.ogTitle": "NoShift.js — Shift 不要の JavaScript",
    "site.ogDescription":
      "Shift が必要な記号を ^ プレフィックスの配列に置換する Joke 言語。コンパイルすると JavaScript になります。",

    // Nav
    "nav.home": "ホーム",
    "nav.gettingStarted": "はじめに",
    "nav.syntax": "構文と記号",
    "nav.cli": "CLI リファレンス",
    "nav.vscode": "VS Code 拡張機能",
    "nav.github": "GitHub",
    "nav.npm": "npm",

    // Home
    "home.title": "NoShift.js",
    "home.tagline": "Shift キーを押さずに JavaScript を書こう。",
    "home.description":
      "Shift が必要な記号を <code>^</code> プレフィックスのシーケンスに置き換える Joke 言語です。<code>.nsjs</code> ファイルは <code>nsc</code> CLI で JavaScript にコンパイルされます。",
    "home.getStarted": "はじめる",
    "home.viewOnGithub": "GitHub で見る",
    "home.feature1Title": "Shift 不要",
    "home.feature1Desc":
      "すべての Shift 記号は JIS 配列に基づく <code>^</code> + キーのシーケンスに置き換わります。",
    "home.feature2Title": "即座にコンパイル",
    "home.feature2Desc":
      "<code>nsc</code> CLI が <code>.nsjs</code> ファイルをミリ秒で JavaScript にコンパイルします。",
    "home.feature3Title": "VS Code 対応",
    "home.feature3Desc":
      "公式の VS Code 拡張機能でシンタックスハイライトと自動補完が利用可能。",
    "home.quickExample": "簡単な例",
    "home.compilesTo": "コンパイル後:",
    "home.version": "バージョン",
    "home.weeklyDownloads": "週間ダウンロード数",
    "home.lastPublished": "最終公開日",
    "home.install": "インストール",
    "home.links": "リンク",
    "home.copied": "コピーしました！",

    // Getting Started
    "gs.title": "はじめに",
    "gs.installTitle": "インストール",
    "gs.installDesc": "npm でグローバルにインストール:",
    "gs.createTitle": "プロジェクト作成",
    "gs.createDesc": "対話式で新しい NoShift.js プロジェクトを作成:",
    "gs.createNote":
      "プロジェクトディレクトリ、<code>nsjsconfig.json</code>、<code>src/</code> フォルダが作成され、依存パッケージがインストールされます。",
    "gs.configTitle": "設定",
    "gs.configDesc":
      "プロジェクト設定ファイル <code>nsjsconfig.json</code> でコンパイラオプションを制御します:",
    "gs.configRootDir":
      "ソースファイルのディレクトリ（デフォルト: <code>src</code>）",
    "gs.configOutDir": "出力ディレクトリ（デフォルト: <code>build</code>）",
    "gs.compileTitle": "コンパイルと実行",
    "gs.compileDesc": "すべての <code>.nsjs</code> ファイルをコンパイル:",
    "gs.runDesc": "コンパイルせずに直接実行:",
    "gs.fileExt": "ファイル拡張子",
    "gs.fileExtDesc":
      "NoShift.js ファイルは <code>.nsjs</code> 拡張子を使います。<code>_</code> で始まるファイル（例: <code>_helper.nsjs</code>）はコンパイラに無視されます。",

    // Syntax
    "syntax.title": "構文と記号",
    "syntax.introTitle": "仕組み",
    "syntax.introDesc":
      "NoShift.js は <code>^</code>（キャレット）をプレフィックスとして Shift 記号を表現します。マッピングは日本語 JIS キーボード配列に基づいています。",
    "syntax.tableTitle": "記号マップ",
    "syntax.tableShifted": "Shift 記号",
    "syntax.tableNoshift": "NoShift.js",
    "syntax.escapeTitle": "文字列内のエスケープ",
    "syntax.escapeDesc":
      "文字列リテラル（<code>^2...^2</code>、<code>^7...^7</code>、<code>^@...^@</code>）内では、<code>^</code> シーケンスは Shift 記号に<strong>変換されません</strong>。これにより、リテラルの <code>^</code> 文字を含めることができます:",
    "syntax.templateTitle": "テンプレートリテラル",
    "syntax.templateDesc":
      "テンプレートリテラルは <code>^@</code>（バッククォート）を使い、テンプレート式は <code>^4^[</code>（<code>${</code>）で開始し、<code>^]</code>（<code>}</code>）で終了します:",
    "syntax.helloTitle": "Hello World",
    "syntax.helloInput": "入力:",
    "syntax.helloOutput": "出力:",

    // CLI
    "cli.title": "CLI リファレンス",
    "cli.introDesc":
      "<code>nsc</code> コマンドラインツールで NoShift.js プロジェクトのコンパイルと管理を行います。",
    "cli.compileTitle": "nsc（コンパイル）",
    "cli.compileDesc":
      "<code>nsjsconfig.json</code> で定義された <code>rootDir</code> から <code>outDir</code> へすべての <code>.nsjs</code> ファイルをコンパイルします。",
    "cli.watchTitle": "nsc -w, --watch",
    "cli.watchDesc": "ファイルの変更を監視し、自動的にリコンパイルします。",
    "cli.runTitle": "nsc run &lt;file&gt;",
    "cli.runDesc":
      "出力ファイルを書き出さずに、<code>.nsjs</code> ファイルを直接コンパイル・実行します。",
    "cli.createCmdTitle": "nsc create [name]",
    "cli.createCmdDesc":
      "対話式で新しい NoShift.js プロジェクトをスキャフォールドします。言語、プロジェクト名、Prettier 設定を選択できます。",
    "cli.initTitle": "nsc --init",
    "cli.initDesc":
      "現在のディレクトリにデフォルト設定の <code>nsjsconfig.json</code> を作成します。",
    "cli.cleanTitle": "nsc --clean",
    "cli.cleanDesc":
      "<code>nsjsconfig.json</code> で定義された出力ディレクトリ（<code>outDir</code>）を削除します。",
    "cli.versionTitle": "nsc --version",
    "cli.versionDesc": "noshift.js の現在のバージョンを表示します。",

    // VS Code
    "vscode.title": "VS Code 拡張機能",
    "vscode.introDesc":
      "公式の VS Code 拡張機能が NoShift.js のエディタサポートを提供します。",
    "vscode.installTitle": "インストール",
    "vscode.installDesc":
      "VS Code 拡張機能マーケットプレイスで <strong>NoShift.js</strong> を検索するか、直接インストール:",
    "vscode.installLink": "マーケットプレイスで見る",
    "vscode.featuresTitle": "機能",
    "vscode.feature1": "<code>.nsjs</code> ファイルのシンタックスハイライト",
    "vscode.feature2": "NoShift.js の <code>^</code> シーケンスの自動補完",
    "vscode.feature3": "<code>.nsjs</code> ファイルのアイコン",
    "vscode.feature4": "共通パターンのコードスニペット",
    "vscode.idTitle": "拡張機能 ID",

    // Footer
    "footer.license": "MIT ライセンス",
    "footer.madeBy": "作者",

    // 404
    "404.title": "404 — ページが見つかりません",
    "404.description":
      "お探しのページは存在しないか、移動された可能性があります。",
    "404.back": "ホームに戻る",
  },
} as const;

export type TranslationKey = keyof typeof ui.en;

export function t(lang: Lang, key: TranslationKey): string {
  return ui[lang][key] ?? ui.en[key] ?? key;
}
