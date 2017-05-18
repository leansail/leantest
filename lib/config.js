/**
 * Created by leansail on 2017/5/18.
 */
var fs=require('fs');
var path=require('path');

var config_file_path=path.join(__dirname,'config.json');
var config=init_config(config_file_path);

function init_config(file_path) {
    if(fs.existsSync(file_path)){
        return require('./config.json');
    }else {
        return {mysql:{},redis:{}};
    }
}

function update_config(type,alias,options) {
    config[type][alias]=options;
    return save_config();
}

function delete_config(type,alias) {
    if(config[type]&&config[type][alias]){
        delete config[type][alias];
        return save_config();
    }else {
        return Promise.resolve();
    }
}

function save_config() {
    return new Promise(function (resolve,reject) {
        fs.writeFile(config_file_path, JSON.stringify(config),function (err) {
            return err?reject(err):resolve();
        });
    })
}

function get_config(type,alias) {
    if(config[type]&&config[type][alias]){
        return config[type][alias];
    }else {
        return null;
    }
}

module.exports={
    update_config:update_config,
    delete_config:delete_config,
    get_config:get_config
}