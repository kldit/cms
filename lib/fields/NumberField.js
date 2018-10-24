/**
 * @author Orlando Leite
 *
 * NumberField class
 **/
const SimpletextField = require.main.require('./kldit/lib/fields/SimpletextField');
const { MQL } = require('mql-mysql');
const util = require.main.require('./kldit/lib/util');

module.exports = class NumberField extends SimpletextField
{
    _prepareValue(value)
    {
        if(this.field.subtype == "real" || this.field.subtype == "decimal" || this.field.subtype == "money")
        {
            value = Number(value);
        }
        else
        {
            value = Math.round(value);
        }

        if( isNaN( value ) )
        {
            value = 0;
        }

        console.log( value );

        return value;
    }

    insert(cms)
    {
        if(this.field.static != true)
        {
            var value = cms.values[this.fieldName];
            value = this._prepareValue(value);
            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, value, this, MQL.SET);
        }
    }

    update(cms)
    {
        if(this.field.static != true)
        {
            var value = cms.values[this.fieldName];
            value = this._prepareValue(value);
            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, value, this, MQL.SET);
        }
    }

    listView(id, cms)
    {
        var temp = {};
        temp.type = "number";
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.subtype = util.renderJsLine(this.field.subtype, cms);
        temp.thousands = util.renderJsLine(this.field.thousands, cms);
        temp.decimal = util.renderJsLine(this.field.decimal, cms);
        temp.allowZero = util.renderJsLine(this.field["allow-zero"], cms);
        temp.allowNegative = util.renderJsLine(this.field["allow-negative"], cms);
        temp.affixesStay = util.renderJsLine(this.field["affixes-stay"], cms);
        temp.showPositiveSign = util.renderJsLine(this.field["show-positive-sign"], cms);
        temp["state-classes"] = util.renderJsLine(this.field["state-classes"], cms);
        temp["list-class"] = util.renderJsLine(this.field["list-class"], cms);
        temp.value = values[this.fieldName];
        return temp;
    }

    editView(cms)
    {
        var temp = {};
        if(this.field.static) temp.type = "staticnumber";
        else temp.type = "number";
        temp.id = util.renderJsLine(this.fieldName, cms);
        temp.subtype = util.renderJsLine(this.field.subtype, cms);
        temp.thousands = util.renderJsLine(this.field.thousands, cms);
        temp.decimal = util.renderJsLine(this.field.decimal, cms);
        temp.allowZero = util.renderJsLine(this.field["allow-zero"], cms);
        temp.allowNegative = util.renderJsLine(this.field["allow-negative"], cms);
        temp.affixesStay = util.renderJsLine(this.field["affixes-stay"], cms);
        temp.showPositiveSign = util.renderJsLine(this.field["show-positive-sign"], cms);
        temp["state-classes"] = util.renderJsLine(this.field["state-classes"], cms);
        temp.readonly = util.renderJsLine(this.field.readonly, cms);
        temp.visible = util.renderJsLine(this.field.visible, cms);
        temp.class = util.renderJsLine(this.field.class, cms);
        temp.title = util.renderJsLine(this.field.title, cms);
        temp.placeholder = util.renderJsLine(this.field.placeholder, cms);
        temp.help = util.renderJsLine(this.field.help, cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.value = cms.values[this.fieldName];
        this._applyValidations(temp);
        return temp;
    }

    updateEditView(cms)
    {
        var temp = {};
        temp.subtype = util.renderJsLine(this.field.subtype, cms);
        temp.thousands = util.renderJsLine(this.field.thousands, cms);
        temp.decimal = util.renderJsLine(this.field.decimal, cms);
        temp.allowZero = util.renderJsLine(this.field["allow-zero"], cms);
        temp.allowNegative = util.renderJsLine(this.field["allow-negative"], cms);
        temp.affixesStay = util.renderJsLine(this.field["affixes-stay"], cms);
        temp.showPositiveSign = util.renderJsLine(this.field["show-positive-sign"], cms);
        temp["state-classes"] = util.renderJsLine(this.field["state-classes"], cms);
        temp.readonly = util.renderJsLine(this.field.readonly, cms);
        temp.class = util.renderJsLine(this.field.class, cms);
        temp.title = util.renderJsLine(this.field.title, cms);
        temp.placeholder = util.renderJsLine(this.field.placeholder, cms);
        temp.help = util.renderJsLine(this.field.help, cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        return temp;
    }
}
