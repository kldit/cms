/**
 * @author Orlando Leite
 *
 * ActionsField class
 **/
const SimpletextField = require.main.require('./kldit/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const util = require.main.require('./kldit/lib/util');
const sha1 = require('sha1');

module.exports = class ActionsField extends SimpletextField
{
    select(cms, quick = false)
    {}

    doSelectAndSearch(searchValues, quick = false){}

    insert(cms){}

    update(cms){}

    delete()
    {
        return "";
    }

    validate(cms, force = false)
    {
        return undefined;
    }

    submit(value)
    {
        return value;
    }

    listView(id, cms)
    {
        // console.log( util.inspect( this.field, false, null, true ) );
        
        var temp = {};
        temp.type = "custom";
        temp.id = id;
        temp.subs = [];
        temp.title = util.renderJsLine(this.field.title,cms);
        var dropdown = {};
        dropdown.type = "btn-group";
        dropdown.title = util.renderJsLine(this.field.title,cms);
        dropdown["dropdown-class"] = util.renderJsLine(this.field["dropdown-class"], cms);
        dropdown.options = [];
        temp.subs.push(dropdown);

        if(this.field.buttons)
        {
            dropdown.subs = [];

            for(var btn of Object.values(this.field.buttons))
            {
                var item = {};
                item.id = id;
                item.type = "btn";
                item.class = "btn-sm ";
                if(btn.class) item.class += util.renderJsLine(btn.class, cms);
                item.title = util.renderJsLine(btn.title, cms);
                item.icon = util.renderJsLine(btn.icon, cms);
                item.url = util.renderJsLine(btn.url, cms);
                dropdown.subs.push(item);
            }
        }

        if(this.field.dropdown)
        {
            dropdown.type = "dropdown";

            for(var option of Object.values(this.field.dropdown))
            {
                item = {};
                item.id = id;
                item.type = option.type;
                item.title = util.renderJsLine(option.title, cms);
                item.icon = util.renderJsLine(option.icon, cms);
                item.url = util.renderJsLine(option.url, cms);
                item.class = util.renderJsLine(option.class, cms);
                dropdown.options.push(item);
            }
        }

        return temp;
    }

    editView(cms)
    {
        var temp = this.listView(undefined, cms);
        temp.type = "element";
        return temp;
    }
}
