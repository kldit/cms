/**
 * @author Orlando Leite
 *
 * OptionsField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const { util } = require('@kldit/mvc');

//protected function dynamicOptionsFrom( $targetName )
//	{
//		if( $targetName == $this->mapName )
//		{
//			return $this->map;
//		}
//		else
//		{
//			$from = @$this->map->reltables->{@$targetName};
//			if( $from )
//				return $from;
//			else
//			{
//				$result = {};
//				$result->id = "id";
//				$result->from = $targetName;
//				$result->join = "";
//				return $result;
//			}
//		}
//	}
module.exports = class OptionsField extends SimpletextField
{
    async listView(id, cms) //print_r( $options );
    //print_r( $values );
    //print_r( $vals );
    //print_r( ':'.$temp->value );
    {
        var temp = {};
        temp["list-class"] = "";
        var options = await this._generateAllOptions(cms);

        if(this.field["list-as"] == "list")
        {
            temp.type = "list";
            temp.values = [];
        }
        else
        {
            temp.type = "text";
            temp.value = "";
        }

        var t = cms.values[this.fieldName];
        // console.log( t );
        var vals = t == null ? [] : t.toString().split(",");
        var glue = "";

        for(var v of Object.values(vals))
        {
            var a = this._optionFromValue(options, v);

            if(a)
            {
                if(this.field["list-as"] == "list")
                {
                    var item = {};
                    item.value = a.title;
                    if(a["list-class"] !== undefined) item["list-class"] = a["list-class"];
                    temp.values.push(item);
                }
                else
                {
                    temp.value += glue + a.title;
                    glue = ", ";
                    if(a["list-class"] !== undefined) temp["list-class"] += " " + a["list-class"];
                }
            }
            else //print_r( $v );
            //print_r( $options );exit;
            {}
        }

        return temp;
    }

    _usingSetupTable()
    {
        return this.field.subtype != "rows";
    }

    _optionFromValue(options, value)
    {
        for(var option of Object.values(options))
        {
            if(value == option.value)
            {
                return option;
            }
        }
    }

    async _loadDynamicOptions(cms, options, dyn) //print_r( $result );
    {
        var mql = new MQL();
        /*{
            data: Array(),
            tables: Array(),
            target: "options",
            slice: undefined,
            select: Array(),
            where: Array()
        };*/
        var list = this.mapId;
        if(cms.values && cms.values.id) list[this.mapName] = cms.values.id;

        var from = this._table(dyn.from);
        mql.addTable('options', from.table, from.id);
        // var opts = [];

        if(dyn.subtype == "multiple-columns")
        {
            for(var column of Object.values(dyn.columns))
            {
                mql.options.addColumn(column, undefined, undefined, MQL.GET);
            }
        }
        else
        {
            mql.options.addColumn(dyn.title, undefined, undefined, MQL.GET);
            mql.options.addColumn(dyn.value, undefined, undefined, MQL.GET);
            if(dyn.class) mql.options.addColumn(dyn.class, undefined, undefined, MQL.GET);
            if(dyn["list-class"]) mql.options.addColumn(dyn["list-class"], undefined, "", MQL.GET);
        }

        //mql.data.options = opts;
        //mql.tables.options = Array();

        /*for(var key in from)
        {
            var val = from[key];
            mql.tables.options[key] = val;
        }*/

        // TODO: Fix/port this portion of the code
        if(from.join && from.join.length) //print_r( $value );
        {
            var temp = from.join[0].split(":");
            var join = temp[1].split("=");
            var path = join[1].split(".");
            var value = list[path[0]];

            if(value) mql.options.addColumn(join[0], undefined, value, MQL[temp[0].toUpperCase()]);
        }

        if(from.where)
        {
            {
                let tmp = from.where;
                // console.log( tmp );
                for(var key in tmp) //
                {
                    var rule = tmp[key];
                    // console.log( cms.values );

                    if(Array.isArray(rule))
                    {
                        var temp = [util.renderJsLine(rule[0], cms)];
                        if(rule.length > 1) temp.push(util.renderJsLine(rule[1], cms));
                        mql.options.setColumn(key, key, temp, MQL.WHERE_RULE);
                    }
                    else
                    {
                        var value = util.renderJsLine(rule, cms);
                        // console.log(rule, cms.values);
                        // console.log( value );

                        if(!isNaN(value)) // is number
                        {
                            value = Number(value);
                        }
                        else if(value.substr(0, 1) == "%" || value.substr(-1, 1) == "%") //$request->setColumn( $this->table, $this->column, $this->name, $this->value, $this, MatrixQuery::LIKE );
                        {
                            mql.options.setColumn(key, key, value, MQL.LIKE);
                        }
                        else //Aplicar resoluçào diretamente no MySQL fazendo conferencia com is_numeric.
                        {
                            var val = isNaN(value) ? value.replace("\\%", "%") : value;
                            mql.options.addColumn(key, key, val, MQL.EQUAL_TO);
                        }
                    }
                }
            }
        }

        // console.log(util.inspect(mql, false, null, true));

        if(cms.values && cms.values[this.fieldName] !== undefined)
        {
            if(mql.where && mql.where.length)
            {
                var value = cms.values[this.fieldName];
                var vals = value.split(",");
                value = "\"" + vals.join("\",\"") + "\"";
                if(value !== undefined)
                {
                    if(!mql.where) mql.where = [];

                    mql.where.push(["OR", "options." + dyn.value + " IN (" + value + ")"]);
                }
            }
        }

        if( from.order )
        {
            for( var i in from.order )
            {
                mql.addOrderBy( i, from.order[i] );
            }
        }

        var [rows, fields] = await MQLtoMySQL.select(mql, this.db);

        if(dyn.subtype == "multiple-columns") //print_r( MatrixQuery::select( $mql ) );
        {
            for(var key in rows)
            {
                var option = rows[key];
                cms.option = option;
                var opt = {};
                opt.title = util.renderJsLine(dyn.title, cms);
                opt.value = util.renderJsLine(dyn.value, cms);
                if(dyn.class) opt.class = util.renderJsLine(dyn.class, cms);
                if(dyn["list-class"]) opt["list-class"] = util.renderJsLine(dyn["list-class"], cms);
                options.push(opt);
            }

            delete cms.option;
        }
        else
        {
            for(var key in rows)
            {
                var item = rows[key];
                opt = {};
                opt.title = item[dyn.title];
                opt.value = item[dyn.value];
                if(dyn.class) opt.class = item[dyn.class];
                if(dyn["list-class"]) opt["list-class"] = item[dyn["list-class"]];
                options.push(opt);
            }
        }
    }

    async _generateAllOptions(cms)
    {
        var values = cms.values;
        var options = Array();

        for(var opt of Object.values(this.field.options))
        {
            if(opt.type != undefined && opt.type == "dynamic")
            {
                await this._loadDynamicOptions(cms, options, opt);
            }
            else
            {
                var temp = {};

                for(var k in opt) //if( is_numeric( $v ) ) $temp->{$k} += 0;
                {
                    var v = opt[k];
                    temp[k] = v;
                }

                options.push(temp);
            }
        }

        return options;
    }

    async select(cms, quick = false)
    {
        if(this._isSelectable(cms))
        {
            if(this.field.subtype == "columns")
            {
                var options = await this._generateAllOptions(cms);

                for(var option of Object.values(options))
                {
                    var from = option.from ? option.from : this.from();
                    var custom = new CustomField(from, option.value, option.value, undefined);
                    custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);
                    this.request.setupTable(this.mapName, this.map, from);
                }
            }
            else if(this.field.subtype == "rows") //$options = $this->_generateAllOptions( array() );
            //print_r( $sql );
            //$relName = $this->fieldName.'_'.$num;
            //				$num++;
            //				
            //				$rel = {};
            //				$rel->id = $from->id;
            //				$rel->table = $from->table;
            //				$rel->join = $from->join;
            //				$this->map->reltables->{$relName} = $rel;
            //				
            //				$custom = new CustomField( $relName, $this->column(), $line['id'] );
            //				$custom->set( $this->request, $this->mapName, $this->map, $this->path, $this->mapId, NULL, $this->db );
            //				
            //				$this->request->setupTable( $this->mapName, $this->map, $relName );
            {
                from = this.from();
                var sql = "GROUP_CONCAT(DISTINCT " + from + "." + this.column() + " SEPARATOR ',')";
                this.request.setCustomColumn(this.fieldName, sql);
                var table = this._table(from);
                sql = "GROUP_CONCAT(DISTINCT " + from + "." + table.id + " SEPARATOR ',')";
                this.request.setCustomColumn(this.fieldName + "_ids", sql);
                this.request.setupTable(this.mapName, this.map, from);
            }
            else
            {
                super.select(quick);
            }
        }
    }

    async insert(values)
    {
        if(this._isEditable(values))
        {
            if(this.field.subtype == "columns")
            {
                var list = values[this.fieldName];
                var selected = list.split(",");
                var options = await this._generateAllOptions(cms);

                for(var option of Object.values(options))
                {
                    var from = option.from ? option.from : this.from();
                    var value = -1 !== selected.indexOf(option.value) ? 1 : 0;
                    var custom = new SetField(from, option.value, option.value, value);
                    custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);
                    this.request.setupTable(this.mapName, this.map, from);
                }
            }
            else if(this.field.subtype == "rows")
            {
                var num = 0;
                list = values[this.fieldName];

                if(list != "") //print_r( $selected ); print_r( $list ); exit;
                {
                    selected = list.split(",");
                    var column = this.column();

                    for(var value of Object.values(selected)) //New
                    //Old
                    //$custom = new CustomField( $relName, $this->column(), $line['id'] );
                    //$custom->set( $this->request, $this->mapName, $this->map, $this->path, $this->mapId, NULL, $this->db );
                    {
                        var relName = this.fieldName + "_" + num;
                        from = option.from ? option.from : this.from();
                        var table = this._table(from);
                        this.map.tables[relName] = table;
                        custom = new SetField(relName, column, column, value);
                        custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);
                        this.request.setupTable(this.mapName, this.map, relName);
                        num++;
                    }
                }
            }
            else
            {
                value = values[this.fieldName];
                if(value == "") value = undefined;
                this.request.setColumn(this.cfrom, this.field.column, this.fieldName, value, this, MQL.SET);
            }
        }
    }

    async update(cms)
    {
        var values = cms.values;

        if(this._isEditable(cms))
        {
            var from = this.from();

            if(this.field.subtype == "columns")
            {
                var list = values[this.fieldName];
                var selected = list.split(",");
                var options = await this._generateAllOptions(cms);

                for(var option of Object.values(options))
                {
                    var value = -1 !== selected.indexOf(option.value) ? 1 : 0;
                    var custom = new SetField(from, option.value, option.value, value);
                    custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);
                    this.request.setupTable(this.mapName, this.map, from);
                }
            }
            else if(this.field.subtype == "rows") //It needs to get the current values, edit it and put new values
            //print_r( count( $result ) );
            {
                var t = this._table(from);
                var result = this._currentValue( cms );
                list = values[this.fieldName];
                selected = list.split(",");

                for(var key in selected)
                {
                    var sel = selected[key];
                    var index = Object.searchPropertyValue( result, sel );

                    if(index !== false)
                    {
                        delete selected[key];
                        delete result[index];
                    }
                }

                if(selected.length > 0)
                {
                    var num = 0;
                    var column = this.column();

                    for(var sel of Object.values(selected)) //Copy table
                    //New
                    {
                        var relName = this.fieldName + "_" + num;
                        var table = {};
                        table.id = t.id;
                        table.table = t.table;
                        table.join = t.join;
                        cms.map.tables[relName] = table;
                        custom = new SetField(relName, column, column, sel);
                        custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);

                        if(result.length > 0)
                        {
                            var key = key(result);
                            custom = new WhereField(relName, table.id, table.id, key);
                            custom.set(this.request, this.mapName, this.map, this.path, this.mapId, undefined, this.db);
                            delete result[key];
                        }
                        else
                        {
                            table.insert = true;
                        }

                        this.request.setupTable(this.mapName, this.map, relName);
                        num++;
                    }
                }

                if(result.length > 0)
                {
                    list = Object.keys(result);

                    for(var where of Object.values(list))
                    {
                        var erase = Array();
                        erase[t.id] = where;
                        this.db.delete(t.table, [
                        {
                            id: where
                        }]);
                    }
                }
            }
            else
            {
                super.insert(cms);
            }
        }
    }

    _currentValue( cms )
    {
        // console.log( cms );
        var cvalues = cms.currentValues;
        var temp = cvalues[this.fieldName];

        if(temp != "")
        {
            var cids = cvalues[this.fieldName + "_ids"].split(",");
            var cvals = temp.split(",");
            temp = {};

            for(var key in cids)
            {
                var id = cids[key];
                temp[id] = cvals[key];
            }

            return temp;
        }
        else return {};
    }

    _applyValidations(target)
    {
        if(this.field.validation && this.field.validation['on-change'] == true)
        {
            if(!target.events) target.events = {};
            target.events.change = [
                ['validation', this._validateUrl(), 'post', this.fieldName]
            ];
        }
    }

    async _baseEditView(cms)
    {
        var temp = await super._baseEditView(cms);
        temp.options = await this._generateAllOptions(cms);
        this._applyValidations(temp);
        return temp;
    }

    _baseOptionsEditView(temp, cms)
    {
        if(this.field.static)
        {
            temp.type = "staticsimpletext";

            if(undefined !== temp.value)
            {
                for(var option of Object.values(temp.options))
                {
                    if(temp.value == option.value)
                    {
                        temp.value = option.title;
                        break;
                    }
                }
            }
        }
        else
        {
            temp.type = "options";
        }

        if(undefined !== temp.value)
        {
            if(this.field.subtype == "columns")
            {
                temp.value = Array();

                for(var option of Object.values(temp.options))
                {
                    if(cms.values[option.value])
                    {
                        temp.value.push(option.value);
                    }
                }
            }
            else if(this.field.subtype == "rows")
            {
                temp.value = temp.value.toString().split(",");
            }
        }
    }

    async editView(cms)
    {
        var temp = await this._baseEditView(cms);
        temp["html-before"] = this.field["html-before"];
        if(cms.values[this.fieldName] && this.field.subtype == "column")
        {
            temp.value = true;
        }
        else
        {
            temp.value = cms.values[this.fieldName];

            if(!isNaN(temp.value))
            {
                temp.value = Number(temp.value);
            }
        }
        this._baseOptionsEditView(temp, cms);
        return temp;
    }

    async updateEditView(cms)
    {
        var temp = await this._baseEditView(cms);
        var upvals = cms.updateValues; //CMS.globalValue("UPDATE_VALUES");

        if(upvals && upvals[this.fieldName])
        {
            temp.value = upvals[this.fieldName];
        }

        return temp;
    }

};
