/**
 * Created by leansail on 2017/5/18.
 */
var program = require('commander');
var config = require('./lib/config');
var log = require('./lib/log');
var DB=require('./lib/db');

program
    .arguments('<conn_alias> <schema> <tables...>')
    .action(function (conn_alias,schema,tables) {
        var conn_options=config.get_config('mysql',conn_alias);
        if(!conn_options){
            return log.error('mysql '+conn_alias+'not exists,pls config first');
        }
        var db=new DB(conn_options);
        db.export_table_def(schema,tables,__dirname)
            .then(function () {
                log.info('success');
            })
            .catch(function (err) {
                log.error(err);
            });
    })
    .parse(process.argv);
