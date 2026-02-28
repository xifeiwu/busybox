/**
 * A basic server contains frequently used function
 */
import {Command} from 'commander';
import {selectOption} from '../../modules/lib/node/readline';
import {getInstanceByShortCutAsync, getDbTableList, showCreateTable} from '../../modules/lib/db/service';
const program = new Command();
program.name('db').description('db command');

program
  .command('list-tables <dbKey>')
  .description('list tables of database')
  .action(async dbKey => {
    const sequelize = await getInstanceByShortCutAsync(dbKey);
    const tables = await getDbTableList(sequelize);
    console.log(tables);
  });
program
  .command('desc-tables [dbKey] [tables...]')
  .description('list tables of database')
  .action(async (dbKey, tables) => {
    console.log(dbKey, tables);
    const sequelize = await getInstanceByShortCutAsync({dbKey});
    const tableList = await getDbTableList(sequelize);
    if (tables.length > 0) {
      const notExistTables = tables.filter(it => !tableList.includes(it));

      if (notExistTables.length > 0) {
        console.error(`Table ${notExistTables.join(', ')} not found in database ${dbKey}`);
        tables = tables.filter(it => tableList.includes(it));
      }
    }
    if (tables.length === 0) {
      const {label} = await selectOption<{label: string}>(
        tableList.map(it => {
          return {
            label: it,
          };
        }),
        {
          tips: ['Please select target table'],
        }
      );
      tables = [label];
    }
    for (const table of tables) {
      const desc = await showCreateTable(sequelize, table);
      console.log(desc);
      console.log();
    }
  });

program.parse(process.argv);
