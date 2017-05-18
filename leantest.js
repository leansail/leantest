/**
 * Created by leansail on 2017/5/18.
 */
var program = require('commander');

program
    .version('0.0.1')
    .command('config','set mysql,redis conn options')
    .command('table','generate table define file')
    .command('data','generate data tsv file')
    .parse(process.argv);