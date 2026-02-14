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
    "nav.classes": "Classes",
    "nav.cli": "CLI Reference",
    "nav.config": "Configuration",
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
    "home.monthlyDownloads": "Monthly Downloads",
    "home.lastPublished": "Last Published",
    "home.install": "Install",
    "home.links": "Links",
    "home.copied": "Copied!",

    // Getting Started
    "gs.title": "Getting Started",
    "gs.installTitle": "Installation",
    "gs.installDesc": "Install globally via npm:",
    "gs.createTitle": "Create a Project",
    "gs.createDesc": "Scaffold a new NoShift.js project:",
    "gs.createNote":
      "This creates a project directory with <code>nsjsconfig.json</code>, <code>src/</code> folder, and installs dependencies.",
    "gs.configTitle": "Configuration",
    "gs.configDesc":
      "The project config file <code>nsjsconfig.json</code> controls compiler options:",
    "gs.configRootDir": "Source file directory (default: <code>src</code>)",
    "gs.configOutDir": "Output directory (default: <code>dist</code>)",
    "gs.configWarnUppercase":
      "Warn about uppercase characters in source code (default: <code>true</code>)",
    "gs.configCapitalizeInStrings":
      "Enable <code>^3</code> capitalize modifier inside string literals (default: <code>true</code>)",
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
    "syntax.tableNote":
      "This symbol mapping is based on the NoShift.js developer's keyboard (JIS layout).",
    "syntax.tableShifted": "Shifted Key",
    "syntax.tableNoshift": "NoShift.js",
    "syntax.escapeTitle": "Escaping in Strings",
    "syntax.escapeDesc":
      "Inside string literals (<code>^2...^2</code>, <code>^7...^7</code>, <code>^@...^@</code>), <code>^</code> sequences are <strong>not</strong> converted to shifted symbols. This allows you to include literal <code>^</code> characters:",
    "syntax.templateTitle": "Template Literals",
    "syntax.templateDesc":
      "Template literals use <code>^@</code> (backtick) and template expressions use <code>^4^[</code> (<code>${</code>) to start and <code>^]</code> (<code>}</code>) to end:",
    "syntax.capitalizeTitle": "Capitalize Modifier",
    "syntax.capitalizeDesc":
      "<code>^3</code> capitalizes the next character. Useful for class names, constants, etc.:",
    "syntax.commentTitle": "Comments",
    "syntax.commentDesc":
      "Line comments use <code>//</code> as usual. Block comments use <code>/^:</code> to open and <code>^:/</code> to close:",
    "syntax.helloTitle": "Hello World",
    "syntax.helloInput": "Input:",
    "syntax.helloOutput": "Output:",

    // Classes
    "classes.title": "Classes",
    "classes.introDesc":
      "In NoShift.js, class names and other identifiers that need uppercase letters use the <code>^3</code> capitalize modifier.",
    "classes.basicTitle": "Basic Class",
    "classes.basicDesc":
      "Use <code>^3</code> before each character that should be uppercase:",
    "classes.inheritTitle": "Inheritance",
    "classes.inheritDesc":
      "Extends works the same way — just capitalize the parent class name:",
    "classes.methodTitle": "Methods & Properties",
    "classes.methodDesc":
      "Method names that contain uppercase letters also use <code>^3</code>:",
    "classes.staticTitle": "Static Members",
    "classes.staticDesc": "Static methods and properties work as expected:",

    // CLI
    "cli.title": "CLI Reference",
    "cli.introDesc":
      "The <code>nsc</code> command-line tool compiles and manages NoShift.js projects.",
    "cli.compileTitle": "nsc",
    "cli.compileDesc":
      "Compile all <code>.nsjs</code> files from <code>rootdir</code> to <code>outdir</code> as defined in <code>nsjsconfig.json</code>.",
    "cli.watchTitle": "nsc watch",
    "cli.watchDesc": "Watch for file changes and recompile automatically.",
    "cli.runTitle": "nsc run &lt;file&gt;",
    "cli.runDesc":
      "Compile and execute a <code>.nsjs</code> file directly without writing output files.",
    "cli.createCmdTitle": "nsc create [name]",
    "cli.createCmdDesc":
      "Scaffold a new NoShift.js project. Use <code>--no-prettier</code> to skip Prettier setup.",
    "cli.initTitle": "nsc init",
    "cli.initDesc":
      "Create a <code>nsjsconfig.json</code> in the current directory with default settings.",
    "cli.cleanTitle": "nsc clean",
    "cli.cleanDesc":
      "Delete the output directory (<code>outdir</code>) defined in <code>nsjsconfig.json</code>.",
    "cli.versionTitle": "nsc version",
    "cli.versionDesc":
      "Display the current version of noshift.js. Also available as <code>nsc -v</code> or <code>nsc --version</code>.",
    "cli.helpTitle": "nsc help",
    "cli.helpDesc":
      "Show help information. Also available as <code>nsc -h</code> or <code>nsc --help</code>. Includes a link to the documentation site.",

    // Config
    "config.title": "Configuration",
    "config.introDesc":
      "NoShift.js uses a <code>nsjsconfig.json</code> file in the project root to configure compilation behavior.",
    "config.fileTitle": "Config File",
    "config.fileDesc":
      "Create <code>nsjsconfig.json</code> manually or generate it with <code>nsc init</code> or <code>nsc create</code>.",
    "config.optionsTitle": "Options",
    "config.rootdirLabel": "rootdir",
    "config.rootdirDesc": "Source file directory (default: <code>src</code>)",
    "config.outdirLabel": "outdir",
    "config.outdirDesc": "Output directory (default: <code>dist</code>)",
    "config.warnuppercaseLabel": "warnuppercase",
    "config.warnuppercaseDesc":
      "Warn about uppercase characters in source code (default: <code>true</code>)",
    "config.capitalizeinstringsLabel": "capitalizeinstrings",
    "config.capitalizeinstringsDesc":
      "Enable <code>^3</code> capitalize modifier inside string literals (default: <code>true</code>)",
    "config.exampleTitle": "Example",
    "config.defaultTitle": "Default Configuration",
    "config.defaultDesc":
      "If <code>nsjsconfig.json</code> is not found, the following defaults are used:",
    "config.disableCapitalizeTitle": "Disable Capitalize in Strings",
    "config.disableCapitalizeDesc":
      "To treat <code>^3</code> as a literal caret + 3 inside strings:",

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
    "nav.classes": "クラス",
    "nav.cli": "CLI リファレンス",
    "nav.config": "設定",
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
    "home.monthlyDownloads": "月間ダウンロード数",
    "home.lastPublished": "最終公開日",
    "home.install": "インストール",
    "home.links": "リンク",
    "home.copied": "コピーしました！",

    // Getting Started
    "gs.title": "はじめに",
    "gs.installTitle": "インストール",
    "gs.installDesc": "npm でグローバルにインストール:",
    "gs.createTitle": "プロジェクト作成",
    "gs.createDesc": "新しい NoShift.js プロジェクトを作成:",
    "gs.createNote":
      "プロジェクトディレクトリ、<code>nsjsconfig.json</code>、<code>src/</code> フォルダが作成され、依存パッケージがインストールされます。",
    "gs.configTitle": "設定",
    "gs.configDesc":
      "プロジェクト設定ファイル <code>nsjsconfig.json</code> でコンパイラオプションを制御します:",
    "gs.configRootDir":
      "ソースファイルのディレクトリ（デフォルト: <code>src</code>）",
    "gs.configOutDir": "出力ディレクトリ（デフォルト: <code>dist</code>）",
    "gs.configWarnUppercase":
      "ソースコード内の大文字を警告する（デフォルト: <code>true</code>）",
    "gs.configCapitalizeInStrings":
      "文字列リテラル内で <code>^3</code> 大文字化修飾子を有効にする（デフォルト: <code>true</code>）",
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
    "syntax.tableNote":
      "この変換表は NoShift.js 開発者のキーボード（JIS 配列）が基準です。",
    "syntax.tableShifted": "Shift 記号",
    "syntax.tableNoshift": "NoShift.js",
    "syntax.escapeTitle": "文字列内のエスケープ",
    "syntax.escapeDesc":
      "文字列リテラル（<code>^2...^2</code>、<code>^7...^7</code>、<code>^@...^@</code>）内では、<code>^</code> シーケンスは Shift 記号に<strong>変換されません</strong>。これにより、リテラルの <code>^</code> 文字を含めることができます:",
    "syntax.templateTitle": "テンプレートリテラル",
    "syntax.templateDesc":
      "テンプレートリテラルは <code>^@</code>（バッククォート）を使い、テンプレート式は <code>^4^[</code>（<code>${</code>）で開始し、<code>^]</code>（<code>}</code>）で終了します:",
    "syntax.capitalizeTitle": "大文字化修飾子",
    "syntax.capitalizeDesc":
      "<code>^3</code> は次の文字を大文字にします。クラス名や定数に便利です:",
    "syntax.commentTitle": "コメント",
    "syntax.commentDesc":
      "行コメントは通常通り <code>//</code> を使います。ブロックコメントは <code>/^:</code> で開始、<code>^:/</code> で終了します:",
    "syntax.helloTitle": "Hello World",
    "syntax.helloInput": "入力:",
    "syntax.helloOutput": "出力:",

    // Classes
    "classes.title": "クラス",
    "classes.introDesc":
      "NoShift.js では、クラス名や大文字が必要な識別子に <code>^3</code> 大文字化修飾子を使います。",
    "classes.basicTitle": "基本的なクラス",
    "classes.basicDesc": "大文字にしたい文字の前に <code>^3</code> を付けます:",
    "classes.inheritTitle": "継承",
    "classes.inheritDesc": "extends も同様に、親クラス名を大文字化します:",
    "classes.methodTitle": "メソッドとプロパティ",
    "classes.methodDesc":
      "大文字を含むメソッド名も <code>^3</code> を使います:",
    "classes.staticTitle": "静的メンバー",
    "classes.staticDesc": "静的メソッドやプロパティも同様に書けます:",

    // CLI
    "cli.title": "CLI リファレンス",
    "cli.introDesc":
      "<code>nsc</code> コマンドラインツールで NoShift.js プロジェクトのコンパイルと管理を行います。",
    "cli.compileTitle": "nsc",
    "cli.compileDesc":
      "<code>nsjsconfig.json</code> で定義された <code>rootdir</code> から <code>outdir</code> へすべての <code>.nsjs</code> ファイルをコンパイルします。",
    "cli.watchTitle": "nsc watch",
    "cli.watchDesc": "ファイルの変更を監視し、自動的にリコンパイルします。",
    "cli.runTitle": "nsc run &lt;file&gt;",
    "cli.runDesc":
      "出力ファイルを書き出さずに、<code>.nsjs</code> ファイルを直接コンパイル・実行します。",
    "cli.createCmdTitle": "nsc create [name]",
    "cli.createCmdDesc":
      "新しい NoShift.js プロジェクトをスキャフォールドします。<code>--no-prettier</code> で Prettier 設定をスキップできます。",
    "cli.initTitle": "nsc init",
    "cli.initDesc":
      "現在のディレクトリにデフォルト設定の <code>nsjsconfig.json</code> を作成します。",
    "cli.cleanTitle": "nsc clean",
    "cli.cleanDesc":
      "<code>nsjsconfig.json</code> で定義された出力ディレクトリ（<code>outdir</code>）を削除します。",
    "cli.versionTitle": "nsc version",
    "cli.versionDesc":
      "noshift.js の現在のバージョンを表示します。<code>nsc -v</code> または <code>nsc --version</code> でも利用可能。",
    "cli.helpTitle": "nsc help",
    "cli.helpDesc":
      "ヘルプ情報を表示します。<code>nsc -h</code> または <code>nsc --help</code> でも利用可能。ドキュメントサイトへのリンクも含まれます。",

    // Config
    "config.title": "設定",
    "config.introDesc":
      "NoShift.js はプロジェクトルートの <code>nsjsconfig.json</code> ファイルでコンパイル動作を設定します。",
    "config.fileTitle": "設定ファイル",
    "config.fileDesc":
      "<code>nsjsconfig.json</code> を手動で作成するか、<code>nsc init</code> または <code>nsc create</code> で生成します。",
    "config.optionsTitle": "オプション",
    "config.rootdirLabel": "rootdir",
    "config.rootdirDesc":
      "ソースファイルのディレクトリ（デフォルト: <code>src</code>）",
    "config.outdirLabel": "outdir",
    "config.outdirDesc": "出力ディレクトリ（デフォルト: <code>dist</code>）",
    "config.warnuppercaseLabel": "warnuppercase",
    "config.warnuppercaseDesc":
      "ソースコード内の大文字を警告する（デフォルト: <code>true</code>）",
    "config.capitalizeinstringsLabel": "capitalizeinstrings",
    "config.capitalizeinstringsDesc":
      "文字列リテラル内で <code>^3</code> 大文字化修飾子を有効にする（デフォルト: <code>true</code>）",
    "config.exampleTitle": "例",
    "config.defaultTitle": "デフォルト設定",
    "config.defaultDesc":
      "<code>nsjsconfig.json</code> が見つからない場合、以下のデフォルトが使用されます:",
    "config.disableCapitalizeTitle": "文字列内の大文字化を無効化",
    "config.disableCapitalizeDesc":
      "文字列内で <code>^3</code> をリテラルの <code>^</code> + <code>3</code> として扱う場合:",

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
