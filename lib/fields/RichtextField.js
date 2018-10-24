/**
 * @author Orlando Leite
 *
 * RichtextField class
 **/
const SimpletextField = require.main.require('./kldit/lib/fields/SimpletextField');

module.exports = class RichtextField extends SimpletextField
{
    editView(cms)
    {
        var temp = this.baseEditView(cms);
        temp.type = "richtext";
        return temp;
    }
}
