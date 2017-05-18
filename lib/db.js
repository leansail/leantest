/**
 * Created by newchama on 2017/5/5.
 */
var mysql = require('mysql');
var child_process = require('child_process');
var fs=require('fs');
var path=require('path');

var db;

function DB(conn_options) {
    this.conn_options=conn_options;
    this.pool = mysql.createPool(conn_options);
    db=this;
}

DB.prototype ={
    query:query,
    exec_sql_files:exec_sql_files,
    import_from_tsv:import_from_tsv,
    export_table_def:export_table_def
}

/**
 * 执行查询
 * @param sql
 * @param params
 * @returns {Promise}
 */
function query(sql, params) {
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            }
            connection.query(sql, params, function (error, results, fields) {
                connection.release();
                if (error) {
                    return reject(error);
                }
                if (results[0] instanceof Array) {
                    results.splice(results.length - 1, 1);
                }
                var data = {results: results};
                if (fields) {
                    data.fields = [];
                    for (var i = 0; i < fields.length; i++) {
                        if (fields[i] && fields[i] instanceof Array) {
                            var field = [];
                            for (var j = 0; j < fields[i].length; j++) {
                                field.push(fields[i][j].name);
                            }
                            data.fields.push(field);
                        } else if (fields[i]) {
                            data.fields.push(fields[i].name);
                        }
                    }
                }
                return resolve(data);
            });
        });
    });
}

/**
 * 执行sql文件
 * @param file_path 文件路径
 * @returns {Promise}
 */
function exec_sql_files(file_path) {
    var cmd = "mysql -h" + db.conn_options.host
        + " -P" + db.conn_options.port
        + " -u" + db.conn_options.user
        + " -p" + db.conn_options.password
        + " --default-character-set=utf8 < " + file_path;
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, function (err, stderr, stdout) {
            err ? reject(err) : resolve();
        });
    });
}

/**
 * 导出到tsv文件
 * @param sql
 * @param params
 * @param path tsv文件路径
 * @returns {Promise}
 */
function export_to_tsv(sql, params, path) {
    var query_sql = mysql.format(sql, params);
    var cmd = "mysql -h" + db.conn_options.host
        + " -P" + db.conn_options.port
        + " -u" + db.conn_options.user
        + " -p" + db.conn_options.password
        + " -D" + db.conn_options.database
        + " --default-character-set=utf8"
        + ' -e "' + query_sql + '"'
        + " |sed 's/NULL/\\\\N/g'"
        + " > "
        + '"' + path + '"';
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, function (err, stderr, stdout) {
            err ? reject() : resolve();
        });
    });
}

/**
 * 从tsv导入数据
 * @param path 文件路径
 * @param table_name 表名
 * @param columns 列名
 * @returns {Promise}
 */
function import_from_tsv(path, table_name, columns) {
    var sql = "load data local infile '" + path + "'"
        + " replace"
        + " into table " + table_name
        + " ignore 1 lines"
        + " (" + columns + ");"
    return query(sql);
}

/**
 * 导出表定义
 * @param schema_name schema名
 * @param table_names 表名，用逗号分隔
 * @param dir 文件存放目录
 * @returns {Promise}
 */
function export_table_def(schema_name,table_names,dir) {
    var sql = "select TABLE_NAME as table_name,group_concat(COLUMN_NAME) as columns"
        + " from information_schema.COLUMNS"
        + " where TABLE_SCHEMA='" + schema_name + "' and TABLE_NAME in('"+table_names.join("','")+"')"
        + " group by TABLE_NAME;";
    return query(sql)
        .then(function (data) {
            return new Promise(function (resolve,reject) {
                fs.writeFile(path.join(dir,'tables.json'),JSON.stringify(data.results),function (err) {
                    return err?reject(err):resolve();
                });
            });
        });
}

module.exports = DB;