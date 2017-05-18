/**
 * Created by leansail on 2017/5/18.
 */
var program = require('commander');
var config = require('./lib/config');
var log = require('./lib/log');

program
    .arguments('<type> <alias>')
    .option('-r, --remove', 'remove alias')
    .option('-H, --host <host>','mysql host')
    .option('-P, --port <port>','mysql port')
    .option('-u, --user <user>','mysql username')
    .option('-p, --pass <pass>','mysql password')
    .option('-D, --database <database>','mysql database')
    .action(function (type, alias) {
        if (program.remove) {
            return config.delete_config(type, alias)
                .then(function () {
                    log.info('success');
                }).catch(function (err) {
                    log.error(err.message);
                });
        }
        var options;
        if (type == 'mysql') {
            options = {
                host: program.host || 'localhost',
                port: program.port || '3306',
                user: program.user || 'root',
                password: program.pass || '123456',
                database: program.database || 'test'
            }
        } else if (type == 'redis') {
            options = {
                host: program.host || 'localhost',
                port: program.port || 6379,
                password: program.pass,
                db: program.database || 0
            }
        } else {
            return log.error('type must be mysql or redis');
        }
        config.update_config(type,alias,options)
            .then(function () {
                log.info('success');
            }).catch(function (err) {
                log.error(err.message);
            });
    })
    .parse(process.argv);

