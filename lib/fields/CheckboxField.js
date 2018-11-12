/**
 * @author Orlando Leite
 *
 * CheckboxField class
 **/
const OnoffField = require('@kldit/cms/lib/fields/OnoffField');

module.exports = class CheckboxField extends OnoffField
{
    editView(cms)
    {
        var temp = super.editView(cms);
        if(!temp.static) temp.type = "checkbox";
        return temp;
    }

}
