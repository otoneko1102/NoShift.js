// シンプルなロガーユーティリティ（ANSI エスケープコードを使用）

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

export function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

export function error(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

export function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

export function warn(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

export function step(message) {
  console.log(`${colors.cyan}→${colors.reset} ${message}`);
}

export function dim(message) {
  console.log(`${colors.dim}${message}${colors.reset}`);
}

export function bold(text) {
  return `${colors.bright}${text}${colors.reset}`;
}

export function highlight(text) {
  return `${colors.cyan}${text}${colors.reset}`;
}

export function errorCode(code, message) {
  console.error(
    `${colors.red}error ${code}:${colors.reset} ${message}`,
  );
}
