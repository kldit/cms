/**
 * @author Orlando Leite
 *
 * CMS class
 */

const CMS = require.main.require('./kldit/lib/CMS');
const fs = require('fs');

CMS.validators = {};
require('fs').readdirSync('./kldit/lib/validators').forEach(function (file)
{
    if(file != "index.js")
    {
        var temp = file.split('.');
        temp.pop();
        var name = temp.join('.');
        CMS.validators[name.toLowerCase()] = CMS.validators[name] = require.main.require('./kldit/lib/validators/' + name);
        //require("./routes/" + file);
    }
});

module.exports = CMS;
