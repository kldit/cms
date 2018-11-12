/**
 * @author Orlando Leite
 *
 * CMS class
 */

const { CMS } = require('@kldit/cms');
const fs = require('fs');

CMS.validators = {};
require('fs').readdirSync(__dirname).forEach(function (file)
{
    if(file != "index.js")
    {
        var temp = file.split('.');
        temp.pop();
        var name = temp.join('.');
        CMS.validators[name.toLowerCase()] = CMS.validators[name] = require('./' + name);
        //require("./routes/" + file);
    }
});

module.exports = CMS;
