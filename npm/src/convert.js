// ESM wrapper  re-exports from the CJS core module.
// The actual logic lives in convert.cjs so both ESM and CJS consumers share
// the same implementation without duplication.
import convertNsjsToJs from "./convert.cjs";
export const checkUppercaseWarnings = convertNsjsToJs.checkUppercaseWarnings;
export const diagnose = convertNsjsToJs.diagnose;
export default convertNsjsToJs;
