import {PORT, startFullFeatureServer} from '@src/service/external';
import {Command} from 'commander';

const program = new Command();
program
  .argument('[staticDir]', 'static dir')
  .option('-p, --port <port>', 'the port used for http server')
  .action(async (staticDir, options) => {
    const {port = PORT.fullFeatureHttpServer.port} = options;
    console.log(options);
    await startFullFeatureServer([], {
      port,
      printOrigin: true,
    });
  });
program.parse(process.argv);
