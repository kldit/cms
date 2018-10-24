/**
 * @author Orlando Leite
 *
 * OptionsField class
 **/
const OptionsField = require.main.require('./kldit/lib/fields/OptionsField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const util = require.main.require('./kldit/lib/util');

module.exports = class SelectField extends OptionsField
{
    _applyUpdateOnSearch(target)
    {
        if(this.field["update-on-search"])
        {
            if(!target.events) target.events = {};
            var id = this.mapId[this.mapName] ? "/" + this.mapId[this.mapName] : "";
            target.events.search = [
                ["validation", "edit-content/update-form/" + this.mapName + id, "post", this.fieldName]
            ];
        }
    }
    
    async editView(cms) //if( is_numeric( $temp->value ) ) echo $this->fieldName." > ".$temp->value;
    {
        var temp = await super.editView(cms);

        if(this.field.static)
        {
            temp.type = "staticsimpletext";
        }
        else
        {
            temp.type = "select";
        }
        
        temp.multiple = util.renderJsLine(this.field.multiple, cms);
        temp.searchable = util.renderJsLine(this.field.searchable, cms);
        this._applyUpdateOnSearch(temp);
        return temp;
    }

    updateEditView(cms)
    {
        var temp = super.updateEditView(cms);

        if(this.field.static)
        {
            temp.type = "staticsimpletext";
        }
        else
        {
            temp.type = "select";
        }

        this._applyUpdateOnSearch(temp);
        return temp;
    }
}
