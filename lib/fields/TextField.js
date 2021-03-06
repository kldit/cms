/**
 * @author Orlando Leite
 *
 * DatetimeField class
 **/
const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const { util } = require('@kldit/mvc');
const formatter = require('date-and-time');

module.exports = class TextField extends SimpletextField
{
    editView(cms)
    {
        var temp = super.editView(cms);
        if(util.renderJsLine(this.field.static, cms)) temp.type = "staticsimpletext";
        else temp.type = "text";
        return temp;
    }
}
