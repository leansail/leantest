/**
 * Created by leansail on 2017/5/18.
 */

var colors=require('colors');

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'magenta',
    error: 'red'
});



module.exports={
    info:function (str) {
        console.log(str.info);
    },
    warn:function (str) {
        console.log(str.warn);
    },
    debug:function (str) {
        console.log(str.debug);
    },
    error:function (str) {
        console.log(str.error);
    }
}