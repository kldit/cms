/**
 * @author Orlando Leite
 *
 * Request class
 **/

const CMS = require.main.require('./kldit/lib/CMS');
const { MQL } = require('mql-mysql');

module.exports = class Request
{
    /*public search;
    
    private tables, tableOpts, columns,
            target, mapId, customColumns,
            mapName, map, slice;*/

    constructor(target)
    {
        this._target = target;
        this.tables = [];
        this.tablesOpts = [];
        this.customColumns = [];
        this.columns = [];
        this.orderBy = [];
    }

    set target(target)
    {
        this._target = target;
    }

    get target()
    {
        return this._target;
    }

    slice(offset, length)
    {
        this.slice = [offset, length];
    }

    setColumn(table, column, name, value, field, flag = MQL.IGNORE)
    {
        var result = true;
        if(this.tables[table] == null)
        {
            this.tables[table] = [];
            result = false;
        }

        this.columns[name] = this.tables[table][name] = {
            'value': value,
            'column': column,
            'field': field,
            'flag': flag
        };

        return result;
    }

    get columnsName()
    {
        return Object.keys(this.columns);
    }

    get visibleColumnsName()
    {
        var cols = this.columnsName;
        for(var k in cols)
        {
            var col = cols[k];

            if(col.substr(0, 8) == '_hidden_') delete cols[k];
        }

        return cols;
    }

    table(name)
    {
        return this.tablesOpts[name];
    }

    column(name)
    {
        return this.columns[name];
    }

    setupTable(mapName, map, targetName)
    {
        if(!this.tablesOpts[targetName])
        {
            var reltable = targetName == mapName ? map.tables.main : map.tables[targetName];

            if(reltable)
            {
                if(reltable.where != null)
                {
                    for(var key in reltable.where)
                    {
                        var item = reltable.where[key];
                        var field = new CMS.fields.WhereField(targetName, key + "_" + Math.floor(Math.random() * 10000), key, item);
                        field.setup(this, mapName, map, null, null, null);
                    }
                }

                if(reltable.join != null && targetName != mapName)
                {
                    for(var i in reltable.join)
                    {
                        var item = reltable.join[i];

                        var joinType = null;
                        var temp = item.split(':');
                        if(temp.length > 1)
                        {
                            joinType = temp[0];
                            temp = temp[1];
                        }
                        else
                        {
                            temp = temp[0];
                        }
                        temp = temp.split('=');
                        field = new CMS.fields.JoinField(targetName, temp[0] + "_" + Math.floor(Math.random() * 10000), temp[0], temp[1], joinType);

                        field.setup(this, mapName, map, null, this.mapId, null);

                        if(temp[1].substr(0, 1) != '"')
                        {
                            var join = temp[1].split('.');
                            if(this.tables[join[0]] == null)
                                this.setupTable(mapName, map, join[0]);
                        }
                    }
                }

                if(reltable.table !== false)
                {
                    this.tablesOpts[targetName] = {
                        'id': reltable.id,
                        'table': reltable.table,
                        'insert': reltable.insert,
                        'update': reltable.update,
                        'order': reltable.order
                    };
                }
            }
        }
    }

    tableOptions(tableName)
    {
        return this.tablesOpts[tableName];
    }
    /*
    tableGroupBy( tableName, groupBy )
    {
        if( array_search( groupBy, this.tableOpts[tableName]['group'] ) === FALSE )
            this.tableOpts[tableName]['group'][] = groupBy;
    }
    */
    setColumnFlag(table, name, flag)
    {
        this.tables[table][name]['flag'] = flag;
    }

    columnValue(table, name)
    {
        return this.tables[table][name]['value'];
    }

    columnField(table, name)
    {
        return this.tables[table][name]['field'];
    }

    setCustomColumn(name, value)
    {
        this.customColumns[name] = value;
    }

    removeColumn(table, name)
    {
        delete this.tables[table][name];
    }

    addOrderBy(column, type)
    {
        this.orderBy.push([column, type]);
    }

    _matrixQuery()
    {
        var result = new MQL();
        result.target = this.target;
        /*{
            data : [],
            tables : [],
            target : this.target,
            slice : this.slice,
            select : []
        };*/

        result.setSlice(this.slice.offset, this.slice.limit);

        for(var key in this.customColumns)
        {
            var select = this.customColumns[key];
            result['select'].push('(' + select + ') AS ' + key);
        }

        for(var tkey in this.tables)
        {
            var table = this.tables[tkey];
            if(this.tablesOpts[tkey] != null)
            {
                var topts = this.tablesOpts[tkey];
                // result.data[tkey] = [];
                result.addTable(tkey, topts.table, topts.id);
                //const util = require('util')
                //console.log( util.inspect(this.tablesOpts[tkey], false, null) );
                result.tables[tkey] = this.tablesOpts[tkey];

                for(var ckey in table)
                {
                    var column = table[ckey];
                    // console.log( column );
                    if(column.flag != 0)
                    {
                        var value = column.value !== null ? column['value'] : null;

                        // if( column['column'] == null ) print_r( ckey );
                        result[tkey].addColumn(
                            ckey,
                            column.column,
                            value,
                            column.flag);
                        /*
                        if( column['flag'] == 3 )
                        {
                            result['data'][tkey][ckey] = array( column['column'], value, '', column['field'].joinType() );
                        }
                        else if( column['flag'] == 2 )
                        {
                            result['data'][tkey][ckey] = array( column['column'], value, 2 );
                        }
                        else
                        {
                            result['data'][tkey][ckey] = array( column['column'], value );
                        }
                        */
                    }
                }
            }
        }

        // print_r( result );exit;
        return result;
    }

    async matrixQueryForSelect(cms, fields = null)
    {
        for(var tkey in this.tables)
        {
            var table = this.tables[tkey];
            for(var ckey in table)
            {
                var column = table[ckey];
                if(column.field != null)
                {
                    if(column.field === true || column.field === false) console.log(column);
                    // console.log( fields, ckey );
                    if(fields == null || fields.includes(ckey))
                    {
                        await column.field.select(cms);
                    }
                }
            }
        }

        var mql = this._matrixQuery();
        for(var order of this.orderBy)
        {
            var column = this.column(order[0]);
            mql.addOrderBy(column.field.orderBy(), order[1]);
            console.log(column.field.orderBy(), order[1]);
        }

        return mql;
    }

    async matrixQueryForInsert(cms)
    {
        for(var tkey in this.tables)
        {
            var table = this.tables[tkey];
            for(var ckey in table)
            {
                var column = table[ckey];
                if(column['field'] != null)
                {
                    await column['field'].insert(cms);
                }
            }
        }

        return this._matrixQuery();
    }

    async matrixQueryForUpdate(cms, columns = null)
    {
        for(var tkey in this.tables)
        {
            var table = this.tables[tkey];
            for(var ckey in table)
            {
                var column = table[ckey];
                if(column['field'] != null && (columns == null || columns.includes(ckey)))
                {
                    await column['field'].update(cms);
                }
            }
        }

        return this._matrixQuery();
    }

    get mapId()
    {
        return this._mapId;
    }

    set mapId(mapId)
    {
        this._mapId = mapId;
    }

    static createRequestFromTarget(mapName, map, path, mapId, db)
    {
        map = Object.clone( map );
        
        var request = new Request(path.length > 0 ? path[path.length - 1] : mapName);
        var target = map;
        request.mapId = mapId;

        var i = 0;
        while(path.length > i)
        {
            target = map.fields[path[i]];
            i++;
        }

        if(mapId)
        {
            /*foreach( mapId AS key : id )
            {
                field = new CustomField( key, 'id', id );
                field.set( request, mapName, map, null, null, null );
            }*/

            request.mapId = mapId;
        }

        if(map['force-setup-table'])
        {
            for(var t in map['force-setup-table'])
            {
                request.setupTable(mapName, map, map['force-setup-table'][t]);
            }
        }

        var objs = [];
        // console.log( target.fields );
        for(var key in target.fields)
        {
            var field = target.fields[key];

            // console.log( CMS );
            // console.log( key, field );
            var classs = CMS.fields[field.type];
            // console.log( field.title, field.type );
            var obj = new classs(key);

            obj.setup(request, mapName, map, path, mapId, field, db);
        }

        if(target.search)
        {
            var search = new Request(path.length > 0 ? path[path.length - 1] : mapName);
            var objs = [];
            // print_r( target ); exit;
            for(var key in target.search)
            {
                var field = target.search[key];
                var classs = CMS.fields[field.type];
                obj = new classs(key);
                obj.searchField = true;
                obj.setup(search, mapName, map, path, mapId, field, db);
            }

            request.search = search;
        }

        if(mapId)
        {
            for(var key in mapId)
            {
                var id = mapId[key];
                if(request.table(key) && id != null)
                {
                    var field = new CMS.fields.WhereField(key, 'id', 'id', id);
                    field.setup(request, mapName, map, null, null, null);
                }
            }
        }

        return request;
    }
}
