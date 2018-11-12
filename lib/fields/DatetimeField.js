/**
 * @author Orlando Leite
 *
 * DatetimeField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const { util } = require('@kldit/mvc');
const formatter = require('date-and-time');

module.exports = class DatetimeField extends SimpletextField
{
    _getDateString(value)
    {
        var names = this.field.names;

        if(names)
        {
            var today = formatter.format(new Date(), 'YYYYMMDD');

            var y = new Date();
            y.setDate(y.getDate() - 1);
            var yesterday = formatter.format(y, 'YYYYMMDD');

            var t = new Date();
            t.setDate(t.getDate() + 1);
            var tomorrow = formatter.format(y, 'YYYYMMDD');

            var date = new Date(value);
            var cdate = formatter.format(date, 'YYYY-MM-DD');

            // Apply names to date numbers, with there is a match.
            if(names.today && cdate == today)
            {
                return names.today;
            }
            else if(names.yesterday && cdate == yesterday)
            {
                return names.yesterday;
            }
            else if(names.tomorrow && cdate == tomorrow)
            {
                return names.tomorrow;
            }
        }

        // console.log( this.field.format );
        return formatter.format(new Date(value), this.field.format);
    }

    editView(cms)
    {
        var temp = super.editView(cms);

        temp.format = util.renderJsLine(this.field.format, cms);

        if(util.renderJsLine(this.field.static, cms))
        {
            temp.type = "staticsimpletext";
            if(this.field.format !== undefined && temp.value !== undefined)
                temp.value = formatter.format(new Date(temp.value), temp.format);
        }
        else
        {
            temp.type = "datetime";
        }
        // console.log( cms );
        temp["min-date"] = util.renderJsLine(this.field["min-date"], cms);
        temp["max-date"] = util.renderJsLine(this.field["max-date"], cms);

        return temp;
    }

    listView(id, cms) //$temp = {};
    //		$temp->type = 'text';
    //		$temp->pre = @$this->field->pre;
    //		$temp->pos = @$this->field->pos;
    {
        var temp = super.listView(id, cms);
        temp.value = this._getDateString(cms.values[this.fieldName]);
        return temp;
    }
}
