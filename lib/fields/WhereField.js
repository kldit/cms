const CustomField = require('./CustomField');
const { MQL } = require('mql-mysql');
const util = require.main.require('./kldit/lib/util');

/**
 * @author Orlando Leite
 *
 * WhereField class
 */
module.exports = class WhereField extends CustomField
{
    setup(request, mapName, map, path, mapId, field, db = null)
    {
        this.request = request;
        
        var value = this._prepareValue({});
        
        if( value )
        {
            if(Array.isArray(value))
            {
                request.setColumn(this.table, this.column, this.name, value, this, MQL.WHERE_RULE);
            }
            else if(String.isString(value))
            {
                if(value.substr(0, 1) == '%' || value.substr(value.length - 1, 1) == '%')
                {
                    request.setColumn(this.table, this.column, this.name, value, this, MQL.LIKE);
                }
                else
                {
                    if(value.indexOf('%') !== false)
                        value = value.replace("\\%", "%");
                    
                    request.setColumn(this.table, this.column, this.name, value, this, MQL.EQUAL_TO);
                }
            }
            else
            {
                // console.log( "v", value );
                request.setColumn(this.table, this.column, this.name, value, this, MQL.EQUAL_TO);
            }
        }
        else
        {
            request.setColumn(this.table, this.column, this.name, value, this, MQL.EQUAL_TO);
        }
    }
    
    _prepareValue(cms)
    {
        var temp;
        
        if(Array.isArray(this.value))
        {
            temp = [util.renderJsLine(this.value[0], cms)];
            temp.push(util.renderJsLine(this.value[1], cms));
        }
        else if(String.isString(this.value))
        {
            temp = util.renderJsLine(this.value, cms);
        }
        else
        {
            temp = this.value;
        }
        
        return temp;
    }

    update(cms)
    {
        var value = this._prepareValue(cms);
        this.request.setColumn(
            this.table,
            this.column,
            this.name,
            value,
            this,
            Array.isArray(value) ? MQL.IGNORE : MQL.EQUAL_TO);
    }

    insert(cms)
    {
        var value = _prepareValue(cms);
        
        this.request.setColumn(
            this.table,
            this.column,
            this.name,
            value,
            this,
            Array.isArray(value) ? MQL.IGNORE : MQL.EQUAL_TO);
    }

    updateEditView(cms)
    {
        return null;
    }
}
