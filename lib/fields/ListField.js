/**
 * @author Orlando Leite
 *
 * ListField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { CMS } = require('@kldit/cms');
const { util } = require('@kldit/mvc');
const { MQL, MQLtoMySQL } = require.main.require('mql-mysql');
const Request = require('@kldit/cms/lib/Request');
const dutil = require('util');

module.exports = class ListField extends SimpletextField
{
    setup(request, mapName, map, path, mapId, field, db)
    {
        super.setup(request, mapName, map, path, mapId, field, db);
        // console.log( field );
        this.listMapName = util.renderJsLine(this.field.map, field);

        // console.log( this.listMapName );
        this.listMap = CMS.config[this.listMapName].map;
        // console.log(require('util').inspect(this.field, false, null, true));

        // console.log( dutil.inspect( this.listMap, false, null, true ) );
        this.listPage = CMS.config[this.listMapName].page;
    }
    
    _createListMap( cms )
    {
        var listMap = Object.clone(this.listMap);
        var custom = cms.custom;
        
        cms.custom = this.field.custom;
        if( !cms.custom ) cms.custom = {};
        cms.custom['list-main-column'] = cms['list-main-column'];

        for(let j in listMap.tables)
        {
            let table = listMap.tables[j];

            table.id = util.renderJsLine(table.id, cms);
            table.table = util.renderJsLine(table.table, cms);

            if(table.join)
            {
                for(var i in table.join)
                {
                    table.join[i] = util.renderJsLine(table.join[i], cms);
                }
            }

            if(table.where)
            {
                for(var i in table.where)
                {
                    table.where[i] = util.renderJsLine(table.where[i], cms);
                }
            }
        }
        
        custom = cms.custom;
        
        return listMap;
    }

    usingSetupTable()
    {
        return false;
    }

    select(quick = false)
    {
        if( this.field.column )
        {
            super.select( quick );
        }
    }

    _tableList( target = 'main' )
    {
        var table = this.listMap.tables[target];
        var result = {};
        result.id = table.id;
        result.table = table.table;
        if(table.where !== undefined) result.where = table.where;
        if(table.join !== undefined) result.join = table.join;

        // console.log(result);
        return result;
    }

    _mergeReltables()
    {
        this.map = Object.clone(this.map);

        let tmp = this.listMap.tables;

        for(var key in tmp)
        {
            var item = tmp[key];

            if(key == 'main')
            {
                key = this.listMapName;
            }

            if(this.map.tables[key] === undefined)
            {
                this.map.tables[key] = item;
            }
            else
            {
                throw new Error("Related table with same name '" + key + "' on " + this.mapName + " and " + this.listMapName, 1);
            }
        }
    }

    insert(cms)
    {
        if(this._isEditable(cms))
        {
            var value = cms.values[this.fieldName];
            cms.post[this.fieldName] = this.mapId[this.mapName];
            cms['list-main-column'] = this.from() + "." + this.column();
            
            let listMap = this._createListMap( cms );

            if(value.add !== undefined && value.add.length > 0) //print_r( $selected ); print_r( $list ); exit;
            {
                var num = 0;
                var column = this.column();
                this._mergeReltables();

                var bkpValues = cms.values;

                for(var row of Object.values(value.add))
                {
                    var relName = this.fieldName + "_" + num;
                    this.map.tables[relName] = listMap.tables.main;
                    
                    let tmp = listMap.fields;

                    for(var key in tmp)
                    {
                        var field = tmp[key];
                        var classs = CMS.fields[field.type];
                        field.from = relName;
                        var obj = new classs(key);

                        cms.values = row;

                        obj.setup(this.request, this.mapName, this.map, this.path, this.mapId, field, this.db);
                        obj.insert(cms);
                    }
                    num++;
                }

                cms.values = bkpValues;
            }
        }
    }

    async update(cms)
    {
        if(this._isEditable(cms))
        {
            var value = cms.values[this.fieldName];
            cms.post[this.fieldName] = this.mapId[this.mapName];
            cms['list-main-column'] = this.from() + "." + this.column();
            
            let listMap = this._createListMap( cms );
            
            if(value.add !== undefined && value.add.length > 0)
            {
                var num = 0;
                var column = this.column();
                let table = listMap.tables.main;
                table.insert = true;
                this._mergeReltables();

                var bkpValues = cms.values;
                for(var row of Object.values(value.add))
                {
                    var addable = false;
                    for(var v of Object.values(row)) //TODO: Apply validation to all fields before submitting.
                    {
                        if(v !== undefined && "string" === typeof v && v.length > 0)
                        {
                            addable = true;
                        }
                    }

                    if(addable)
                    {
                        var relName = this.fieldName + "_" + num;
                        this.map.tables[relName] = table;

                        let tmp = listMap.fields;
                        // console.log( tmp );
                        for(var key in tmp)
                        {
                            var field = tmp[key];
                            var classs = CMS.fields[field.type];
                            field.from = relName;
                            var obj = new classs(key);

                            cms.values = row;

                            obj.setup(this.request, this.mapName, this.map, this.path, this.mapId, field, this.db);
                            obj.insert(cms);
                        }

                        num++;
                    }
                }

                cms.values = bkpValues;
            }

            if(value.delete !== undefined && value.delete.length > 0)
            {
                var deletes = value.delete.split(",");
                var erase = Array();

                for(var where of Object.values(deletes))
                {
                    erase.push(
                    {
                        id: where
                    });
                }
                console.log( this.listMap.tables.main.table, erase);
                this.db.delete(this.listMap.tables.main.table, erase);
            }
        }
    }

    listView(id, cms)
    {
        return undefined;
    }

    async _fields(target, cms)
    {
        cms['list-main-column'] = '"' + cms.values[this.fieldName] + '"';//this.from() + "." + this.column();
        
        let listMap = this._createListMap( cms );
        let request = Request.createRequestFromTarget(this.listMapName, listMap, this.path, this.mapId, this.db);
        let fields = {};
        let columns = request.visibleColumnsName;
        
        var values = cms.values;
        cms.values = {};
        for(var c of Object.values(columns))
        {
            var f = request.column(c);
            var temp = await f.field.editView(cms);
            if(temp) fields[c] = temp;
        }

        target.fields = Object.clone(fields);
        target.page = {};
        {
            let tmp = this.listPage.list.fields;

            for(var name in tmp)
            {
                var field = tmp[name];
                temp = "";
                if(field.align !== undefined) temp += " text-" + field.align;
                if(field.size !== undefined) temp += " col-md-" + field.size;
                target.page[name] = temp;
            }
        }
        
        if( cms.operation == "edit" )
        {
            for(var j of Object.values(listMap.tables.main.join))
            {
                var join = j.split("=");
                var path = join[1].split(".");
                if(!listMap.tables.main.where) listMap.tables.main.where = {};

                if(path.length > 1)
                {
                    var name = path[0] == "main" ? this.mapName : path[0];
                    if(path[1] == 'id')
                    {
                        listMap.tables.main.where[join[0]] = this.mapId[name];
                    }
                }
                else
                {
                    if(join[1].indexOf("\"") == 0 || join[1].indexOf("'") == 0)
                    {
                        join[1] = join[1].substring(1, join[1].length - 1);
                    }

                    listMap.tables.main.where[join[0]] = join[1];
                }
            }

            delete listMap.tables.main.join;
            
            request = Request.createRequestFromTarget(this.listMapName, listMap, this.path, this.mapId, this.db);
            var mql = await request.matrixQueryForSelect();
            temp = mql.tables[mql.target];
            mql[mql.target].addColumn("id", temp.id, undefined, MQL.GET);
            
            var [rows, _ignoredFields] = await MQLtoMySQL.select(mql, this.db);
            var result = [];

            if(rows)
            {
                for(var row of rows)
                {
                    var obj = {};
                    obj.id = row.id;
                    obj.fields = {};

                    for(var key in fields)
                    {
                        var f = fields[key];
                        var col = request.column(key);
                        cms.values = row;
                        temp = await col.field.editView(cms);
                        obj.fields[key] = temp;
                    }

                    result.push(obj);
                }
            }
            
            cms.values = values;
            target.rows = result;
        }
    }

    async editView(cms)
    {
        var temp = super.editView(cms);
        temp.type = "list";
        temp.class = this.field.class;
        await this._fields(temp, cms);
        temp["show-column-names"] = this.field["show-column-names"];
        temp["add-btn"] = {};
        temp["add-btn"].name = this.field["add-name"] ? this.field["add-name"] : "Adicionar";
        temp["remove-btn"] = {};
        temp["remove-btn"].name = this.field["remove-name"] ? this.field["remove-name"] : "Remover";
        return temp;
    }
}
