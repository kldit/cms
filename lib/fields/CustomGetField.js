/**
 * @author Orlando Leite
 *
 * CustomGetField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { util } = require('@kldit/mvc');

module.exports = class CustomGetField extends SimpletextField
{
    insert(cms) {}

    update(cms) {}

    select(cms, quick = false)
    {
        if(this._isSelectable(Array()))
        {
            this.request.setCustomColumn(this.fieldName, this.field.get);
        }
    }

    _prepareValue(value)
    {
        if(undefined !== this.field.subtype)
        {
            if(this.field.subtype == "datetime")
            {
                // return date(this.field.format, value);
                // TODO: Check this line. Usually it needs a format 
                // to load correctly the values.
                return new Date(value);
            }
            else return value;
        }
        else return value;
    }

    listView(id, cms)
    {
        cms.values[this.fieldName + "_formatted"] = this._prepareValue(cms.values[this.fieldName]);
        var temp = {};
        temp.type = "text";
        temp["list-class"] = util.renderJsLine(this.field["list-class"], cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.value = util.renderJsLine(this.field.value, cms);
        temp.class = util.renderJsLine(this.field.class, cms);
        
        return temp;
    }

    editView(cms)
    {
        var temp = super.editView(cms);
        temp.type = "staticsimpletext";
        return temp;
    }
    
    orderBy()
    {
        if( this.field["order-by-column"] )
            return this.from() + "." + this.column();
        else
            return super.orderBy();
    }
}
