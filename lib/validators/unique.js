const Request = require.main.require('./kldit/lib/Request');
const { MQL, MQLtoMySQL } = require.main.require('mql-mysql');

module.exports = async function (cms, fieldName, value, rule, db) // types: 
// full-query: uses the entire query to check if it's unique
// table-query: uses the table query removing joins
// table: just look if in the table exists anyother with the same value
//print_r( $result ); exit;
{
    const type = rule.type !== undefined ? rule.type : "table";
    const request = Request.createRequestFromTarget(
        cms.mapName,
        cms.map,
        cms.path,
        cms.ids,
        db);

    const mql = await request.matrixQueryForSelect(cms);
    const field = request.column(fieldName).field;
    mql[field.from()].addColumn(fieldName, undefined, value, MQL.EQUAL_TO);
    
    var temp = mql.tables[mql.target];

    var id;
    
    if(mql[mql.target].column( temp.id ))
    {
        id = mql.data[mql.target][temp.id].value;
        mql[mql.target].addColumn(temp.id, undefined, undefined, MQL.GET);
    }
    
    if(type != "full-query")
    {
        var from = field.from();
        mql.target = from;
        {
            let _tmp_0 = mql.tables;

            for(var key in _tmp_0)
            {
                var obj = _tmp_0[key];

                if(key != from)
                {
                    mql.removeTable(key);
                }
            }
        }
        var data = mql.data[from];

        // TODO: Revise this portion of code
        mql.data[from] = {};
        var table = from == cms.mapName ? cms.map.tables.main : cms.map.tables[from];
        var where = undefined !== table.where ? table.where : [];
        
        for(var key in data)
        {
            var item = data[key];

            if(type == "table-query" && -1 !== where.indexOf(key) || key == fieldName)
            {
                mql.data[from][key] = item;
            }
        }
        console.log( table );
        mql[from].addColumn(table.id, undefined, "", MQL.GET);
    }
    
    const [rows, fields] = await MQLtoMySQL.select(mql, db);
    
    if(rows && rows.length > 0)
    {
        for(var item of rows)
        {
            if(item.id != id) return false;
        }

        return true;
    }
    else return true;

    return !(rows.length > 0);
};
