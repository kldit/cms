/**
 * @author Orlando Leite
 *
 * CMS class
 */

const { CMS } = require('@kldit/cms');
const fs = require('fs');

CMS.fields = {};
require('fs').readdirSync(__dirname + '/').forEach(function (file)
{
    if(file != "index.js")
    {
        var temp = file.split('.');
        temp.pop();
        var name = temp.join('.');
        CMS.fields[name.toLowerCase().substring(0, name.length - "Field".length)] = CMS.fields[name] = require('./' + name);
    }
});
