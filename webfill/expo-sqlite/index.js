import alasql from "alasql";


export const openDatabase = (name, version, description, size, cb) => {
    
    cb({
        transaction: (cb) => {
            cb({
                executeSql: async (query, args, cb) => {
                    await alasql.promise(`
                        CREATE localStorage DATABASE IF NOT EXISTS app_database;
                        ATTACH localStorage DATABASE app_database;
                        USE DATABASE app_database;
                    `);
                    let result = await alasql.promise(query, args ?? []);

                    if (typeof result !== 'object') result = [];

                    cb(null, {
                        insertId: 0,
                        rowsAffected: 0,
                        rows: {
                            length: result.length,
                            _array: result,
                        },
                    })

                }
            })
        }
    });

}


/*

let db = new alasql.Database();
    db.exec(`CREATE INDEXEDDB DATABASE IF NOT EXISTS ${name};
    ATTACH INDEXEDDB DATABASE ${name}; 
    USE ${name};`, [], () => {
        cb({
            transaction: (cb) => {
                db.transaction(tx => {
                    cb({
                        executeSql: (query, args, cb) => {
                            console.log("query", query);
                    
                            tx.exec(query, args, (result, error) => {
                                console.log("result", result);
                                cb({
                                    insertId: 0,
                                    rowsAffected: 0,
                                    rows: {
                                        length: result.length ?? 0,
                                        _array: result,
                                    },
                                    })
                            })
                        }
                    })
                })
            }
        });
    })

*/
