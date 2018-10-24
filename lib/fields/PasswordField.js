/**
 * @author Orlando Leite
 *
 * PasswordField class
 **/
const SimpletextField = require.main.require('./kldit/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const util = require.main.require('./kldit/lib/util');
const sha1 = require('sha1');


//It must have a column set. Without will not be inserted or updated.
module.exports = class PasswordField extends SimpletextField
{
    listView(id, cms)
    {
        var temp = {};
        temp.type = "text";
        temp["list-class"] = util.renderJsLine(this.field["list-class"], cms);
        temp.mask = this.field.mask;
        temp.value = "**********";
        return temp;
    }

    select(cms, quick = false) //$this->request->setColumnFlag( $this->cfrom, $this->fieldName, 1 );
    {}

    insert(cms)
    {
        if(this.field.column)
        {
            var value = cms.values[this.fieldName];
            value = sha1(value + util.renderJsLine(this.field.hash));
            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, "\"" + value + "\"", this, 1);
        }
    }

    update(cms)
    {
        if(this.field.column)
        {
            var value = cms.values[this.fieldName];
            value = sha1(value + util.renderJsLine(this.field.hash));
            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, "\"" + value + "\"", this, 1);
        }
    }

    validate(cms, fullValidation = false)
    {
        var value = cms.values[this.fieldName];

        if(this.field["confirm-password"])
        {
            var rule = this.field["confirm-password"];

            if(value != values[rule.target])
            {
                return {
                    icon: rule.icon,
                    class: rule.class,
                    message: rule.message
                };
            }
        }

        return super.validate(currentValues, values, force);
    }

    editView(cms) //$temp->display = @$this->field->display;
    {
        var temp = {};
        temp.type = "password";
        temp.id = this.fieldName;
        temp.mask = util.renderJsLine(this.field.mask, cms);
        temp.maskOptions = this.field["mask-options"];
        temp.title = util.renderJsLine(this.field.title, cms);
        temp.placeholder = this.field.placeholder;
        temp.help = util.renderJsLine(this.field.help, cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.readonly = util.renderJsLine(this.field.readonly, cms);
        temp.value = cms.values[this.fieldName];

        if(this.field.decimal)
        {
            temp.value = Math.floor(temp.value * 100);
        }

        this._applyValidations(temp);
        return temp;
    }
}
