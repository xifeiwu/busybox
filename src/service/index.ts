import path from 'path';

export const srcDir = path.resolve(__dirname, '..');
export const DIR_PROJECT = path.resolve(__dirname, '../..');
/** dir to locate output of tsc */
export const DIR_JS_DIST = path.join(DIR_PROJECT, 'dist');
