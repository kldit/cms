/**
 * @author Orlando Leite
 *
 * CMS class
 */

const CMS = require.main.require('./kldit/lib/CMS');
const fs = require('fs');

CMS.fields = {};
require('fs').readdirSync('./kldit/lib/fields').forEach(function (file)
{
    if(file != "index.js")
    {
        var temp = file.split('.');
        temp.pop();
        var name = temp.join('.');
        CMS.fields[name.toLowerCase().substring(0, name.length - "Field".length)] = CMS.fields[name] = require.main.require('./kldit/lib/fields/' + name);
    }
});
