/**
 * @author Orlando Leite
 *
 * OnoffField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const { util } = require('@kldit/mvc');

module.exports = class OnoffField extends SimpletextField
{
    insert(cms)
    {
        var value = cms.values[this.fieldName];
        value = value == "true" ? "on" : "off";
        this.request.setColumn(this.cfrom, this.field.column, this.fieldName, this.field[value].value, this, MQL.SET);
    }

    update(cms)
    {
        var value = cms.values[this.fieldName];
        value = value == "true" ? "on" : "off";
        this.request.setColumn(this.cfrom, this.field.column, this.fieldName, this.field[value].value, this, MQL.SET);
    }
    /*
    _applyValidations(target)
    {
        if(this.field.validation && this.field.validation['on-change'] == true)
        {
            if(!target.events) target.events = {};
            var id = this.mapId[this.mapName] ? "/" + this.mapId[this.mapName] : "";
            target.events.change = [
                ["validation", "edit-content/validate/" + this.mapName + id, "post", this.fieldName]
            ];
        }
    }
    */
    listView(id, cms) //$temp->value = $value;
    {
        var value = cms.values[this.fieldName];
        var temp = {};
        temp.type = "text";

        if(value == this.field.on.value)
        {
            temp["list-class"] = this.field.on.class;
            temp.value = this.field.on.name;
        }
        else
        {
            temp["list-class"] = this.field.off.class;
            temp.value = this.field.off.name;
        }

        return temp;
    }

    editView(cms) //print_r( $temp );
    {
        var temp = {};
        temp.static = util.renderJsLine(this.field.static, cms);

        if(!temp.static)
        {
            temp.value = cms.values[this.fieldName];
            temp.type = "onoff";
        }
        else
        {
            temp.value = cms.values[this.fieldName] ? "Sim" : "Não";
            temp.type = "staticsimpletext";
        }

        temp["list-class"] = util.renderJsLine(this.field["list-class"], cms);
        temp.id = this.fieldName;
        temp.title = util.renderJsLine(this.field.title, cms);
        temp.display = util.renderJsLine(this.field.display, cms);
        temp.static = util.renderJsLine(this.field.static, cms);
        temp.help = util.renderJsLine(this.field.help, cms);
        temp.valid = util.renderJsLine(this.field.validateField, cms);
        temp.pre = util.renderJsLine(this.field.pre, cms);
        temp.pos = util.renderJsLine(this.field.pos, cms);
        temp.readonly = util.renderJsLine(this.field.readonly, cms);
        this._applyValidations(temp);
        temp.on = this.field.on;
        temp.off = this.field.off;
        
        return temp;
    }
}
