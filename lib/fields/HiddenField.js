/**
 * @author Orlando Leite
 *
 * HiddenField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { util } = require('@kldit/mvc');
const { MQL } = require('mql-mysql');

module.exports = class HiddenField extends SimpletextField
{
    listView(id, cms)
    {
        return undefined;
    }

    update(cms)
    {
        var value = undefined;
        var flag = this.field.save === false ? MQL.IGNORE : MQL.SMART_SET;
        if(this.field.value !== undefined)
        {
            value = util.renderJsLine(this.field.value, cms);
        }
        else if(cms.values[this.fieldName])
        {
            // This was the correct way when using PHP
            // value = "\"" + cms.values[this.fieldName] + "\"";
            value = cms.values[this.fieldName];
        }
        else if(this.field.default !== undefined)
        {
            value = this.field.default;
        }

        if(value !== undefined)
        {
            this.request.setColumn(this.from(), this.column(), this.fieldName, value, this, flag);
        }
    }

    insert(cms)
    {
        var value = undefined;
        var flag = this.field.save === false ? MQL.IGNORE : MQL.SMART_SET;

        if(this.field.value !== undefined)
        {
            value = util.renderJsLine(this.field.value, values);
        }
        else if(cms.values[this.fieldName])
        {
            value = "\"" + cms.values[this.fieldName] + "\"";
        }
        else if(this.field.default !== undefined )
        {
            value = this.field.default;
        }

        if(value !== undefined) //var_dump( $value );exit;
        {
            this.request.setColumn(this.from(), this.column(), this.fieldName, value, this, flag);
        }
    }

    editView(cms)
    {
        var temp = {};
        temp.type = "hidden";
        temp.id = this.fieldName;
        temp.value = cms.values[this.fieldName];
        return temp;
    }

    updateEditView(cms)
    {
        var temp = {};
        temp.type = "hidden";
        temp.id = this.fieldName;
        var upvals = cms.updateValues;

        if(upvals && upvals[this.fieldName])
        {
            temp.value = upvals[this.fieldName];
        }

        return temp;
    }
};