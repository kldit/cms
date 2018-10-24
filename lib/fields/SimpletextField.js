/**
 * @author Orlando Leite
 *
 * SimpletextField class
 */
const { MQL } = require('mql-mysql');
const CMS = require.main.require('./kldit/lib/CMS');
const util = require.main.require('./kldit/lib/util');

module.exports = class SimpletextField
{
    // protected fieldName, request, mapName, map, path, mapId, field, cfrom, db;

    constructor(fieldName)
    {
        this.fieldName = fieldName;
        this.defaultValidator = 'not-empty';
    }

    from()
    {
        return this.field.from ? this.field.from : this.mapName;
    }
    
    set searchField( value )
    {
        this._searchField = true;
    }

    _prepareValue(value)
    {
        if(this.field.textcase)
        {
            var textcase = this.field.textcase.toLowerCase();
            if(textcase == 'lower')
                value = value.toLowerCase();
            else if(textcase == 'upper')
                value = value.toUpperCase();
        }

        return value;
    }

    _table(targetName)
    {
        if(targetName == this.mapName)
        {
            return this.map.tables.main;
        }
        else
        {
            var from = this.map.tables[targetName];

            if(from)
                return from;
            else
            {
                var result = {
                    id: 'id',
                    table: targetName,
                    join: ''
                };

                return result;
            }
        }
    }

    setup(request, mapName, map, path, mapId, field, db)
    {
        this.request = request;
        this.mapName = mapName;

        this.map = map;
        this.path = path;
        this.mapId = mapId;
        this.field = field;
        this.db = db;

        this.cfrom = this.from();

        var temp = request.setColumn(this.cfrom, this.field.column, this.fieldName, null, this);
        
        if(this._usingSetupTable() && !temp)
        {
            if( !this.map.tables[this.cfrom == this.mapName ? "main" : this.cfrom] )
            {
                throw new Error( "Table '" + this.cfrom + "' not found on map ");
            }
            request.setupTable(mapName, map, this.cfrom);
        }
    }

    _usingSetupTable()
    {
        return true;
    }

    setFrom(values, operation)
    {
        // this.field.from = values[0];
    }

    column()
    {
        return this.field.column ? this.field.column : this.fieldName;
    }

    colname()
    {
        return this.field.column ? this.field.column + ' AS ' + this.fieldName : this.field.column;
    }

    _isEditable(cms)
    {
        var ignore = util.renderJsLine(this.field.ignore, cms);
        var visible = util.renderJsLine(this.field.visible, cms);

        var disabled = Boolean.parse(util.renderJsLine(this.field.disabled, cms));
        var statics = util.renderJsLine(this.field.statics, cms);

        return statics !== true && ignore !== true && visible != 'hidden' && disabled != true;
    }

    _isSelectable(cms)
    {
        var ignore = util.renderJsLine(this.field.ignore, cms);

        return ignore !== true;
    }

    select(cms, quick = false)
    {
        if(this._isSelectable(cms))
            this.request.setColumnFlag(this.cfrom, this.fieldName, MQL.GET);
    }

    insert(cms)
    {
        if(this._isEditable(cms))
        {
            var value = cms.values[this.fieldName];
            value = this._prepareValue(value);

            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, value, this, MQL.SET);
        }
    }

    update(cms)
    {
        if(this._isEditable(cms))
        {
            var value = cms.values[this.fieldName];
            value = this._prepareValue(value);

            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, value, this, MQL.SET);
        }
    }

    delete()
    {
        return '';
    }

    validationUpdates()
    {
        if(this.field.validation && this.field.validation.updates)
            return this.field.validation.updates;
        else
            return [];
    }

    async validate(cms, fullValidation = false)
    {
        var value = cms.values[this.fieldName];
        value = this._prepareValue(value);
        if(this._isEditable(cms) && (value !== undefined || fullValidation))
        {
            var required = this.field.required == null ? false : util.renderJsLine(this.field.required, cms);

            if(value == null) value = '';
            if(required == true || value != '')
            {
                var validation = this.field.validation;

                if(validation)
                {
                    for(var key in validation.rules)
                    {
                        var rule = validation.rules[key];

                        var result = true;

                        if(CMS.validators[key] == null)
                        {
                            console.log( validation.rules );
                            throw new Error('Error: Validator \'' + key + '\' not found.');
                        }
                        else
                        {
                            var func = CMS.validators[key];
                            result = await func(cms, this.fieldName, value, rule, this.db);

                            if(result === false)
                            {
                                return {
                                    'success': false,
                                    'icon': rule.icon,
                                    'class': rule.class,
                                    'message': rule.message
                                };
                            }
                        }
                    }
                    
                    if(validation.success && !fullValidation)
                    {
                        rule = validation.success;

                        return {
                            'success': true,
                            'icon': rule.icon,
                            'class': rule.class,
                            'message': rule.message
                        };
                    }
                    else
                    {
                        return null;
                    }
                }
                else
                {
                    return null;
                }
            }
        }
        else
        {
            return null;
        }
    }

    submit(value)
    {
        return value;
    }

    doSelectAndSearch(searchValues, quick = false)
    {
        var name = this.select(quick);
        var whereTarget = '';

        if(this.field.rel != null)
        {
            whereTarget = this.field.rel + '.' + name;
        }
        else
            whereTarget = this.sql.nickname + '.' + name;

        this.sql.custom['where'] +=
            (this.sql.custom['where'] == '' ? ' ( ' : ' OR ') +
            whereTarget + ' LIKE \'%' + searchValues.join('%') + '%\'';
        /*foreach( searchValues AS value )
        {
            
        }*/

        this.doSelect(quick);
    }

    listView(id, cms)
    {
        var temp = {};
        temp.type = 'text';
        temp['list-class'] = util.renderJsLine(this.field['list-class'], cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);

        if(this.field.mask)
            temp.mask = util.renderJsLine(this.field.mask, cms);

        temp.maskOptions = util.renderJsLine(this.field['mask-options'], cms); //this.field.{'mask-options'};
        // console.log( this.fieldName, cms );throw new Error("stop listview");
        temp.value = cms.values[this.fieldName];

        return temp;
    }

    _applyValidations(target)
    {
        if(this.field.validation && this.field.validation['on-change'] == true)
        {
            if(!target.events) target.events = {};
            
            target.events.formChange = [
                ['validation', this._validateUrl(), 'post', this.fieldName]
            ];
        }
    }
    
    _validateUrl()
    {
        var id = this.mapId && this.mapId[this.mapName] ? '/' + this.mapId[this.mapName] : '';
        
        if( this._searchField )
            return 'list-content/search-validate/' + this.mapName + id;
        else
        {
            return 'edit-content/validate/' + this.mapName + id;
        }
    }

    _baseEditView(cms)
    {
        var temp = {};
        temp.id = this.fieldName;
        temp.class = util.renderJsLine(this.field.class, cms);
        temp.title = util.renderJsLine(this.field.title, cms);
        temp.placeholder = util.renderJsLine(this.field.placeholder, cms);
        temp.help = util.renderJsLine(this.field.help, cms);
        temp.visible = util.renderJsLine(this.field.visible, cms);

        if(this.field.disabled) //echo $this->fieldName.': '.$this->field->disabled.' '.filter_var( parse_bracket_instructions( @$this->field->disabled, $values ), FILTER_VALIDATE_BOOLEAN )."\n";
        {
            var value = util.renderJsLine(this.field.disabled, cms);

            temp.disabled = Boolean.parse(value);
        }

        temp.readonly = util.renderJsLine(this.field.readonly, cms);
        return temp;
    }

    editView(cms)
    {
        var temp = this._baseEditView(cms);
        temp.static = util.renderJsLine(this.field.static, cms);
        temp["html-before"] = this.field["html-before"];
        if(temp.static) temp.type = "staticsimpletext";
        else temp.type = "simpletext";
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.mask = util.renderJsLine(this.field.mask, cms);
        temp.maskOptions = this.field["mask-options"];
        temp.autocomplete = util.renderJsLine(this.field.autocomplete, cms);
        temp.textcase = util.renderJsLine(this.field.textcase, cms);
        temp.value = cms.values[this.fieldName];
        this._applyValidations(temp);

        return temp;
    }

    updateEditView(cms)
    {
        var temp = this._baseEditView(cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.mask = util.renderJsLine(this.field.mask, cms);
        temp.maskOptions = this.field["mask-options"];
        temp.autocomplete = util.renderJsLine(this.field.autocomplete, cms);
        temp.textcase = util.renderJsLine(this.field.textcase, cms);
        var upvals = cms.updateValues;

        if(upvals && upvals[this.fieldName])
        {
            temp.value = upvals[this.fieldName];
        }

        return temp;
    }

    _searchMode(value)
    {
        switch(this.field['search-mode'])
        {
        case 'like':
            return 'LIKE \'%' + value + '%\'';
            break;

        case 'equal':
            return '= \'' + value + '\'';
            break;

        case 'more-equal':
            return '>= \'' + value + '\'';
            break;

        case 'less-equal':
            return '<= \'' + value + '\'';
            break;

        default:
            return null;
            break;
        }
    }

    search(request, cms)
    {
        var value = this._prepareValue(cms.search[this.fieldName]);
        var where = '', wglue = '';

        if(value !== undefined)
        {
            for(var field of this.field.fields)
            {
                var column = request.column(field);
                // print_r( field );exit;
                // console.log( field );
                where += wglue + column.field.from() + '.' + column['field'].column() + ' ' + this._searchMode(value);
                wglue += ' OR ';
            }
            
            // console.log( where );
            return '(' + where + ')';
        }
        else
        {
            return null;
        }
    }
    
    orderBy()
    {
        return this.fieldName;
    }
}
