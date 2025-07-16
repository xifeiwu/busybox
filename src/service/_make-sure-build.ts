/**
 * If .ts file not imported by this project, it will not compiled to .js file by tsc command.
 * The script run in child process is not imported directly by main script, it will not included in the dist folder.
 * So they should imported manually here
 */
import {start} from '../../modules/lib/node/utils/run-script/run-in-cp/child';
