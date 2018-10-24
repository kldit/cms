const fs = require('fs');

module.exports = function (cms, fieldName, value, rule, db)
{
    const field = cms.request.column(fieldName).field;
    let url = field.url(cms, value);
    let stat = fs.statSync(url);

    if(rule['less-than'] !== undefined && stat.size >= rule['less-than'])
    {
        return false;
    }
    else if(rule['less-or-equal-than'] !== undefined && stat.size > rule['less-or-equal-than'])
    {
        return false;
    }
    else if(rule['more-than'] !== undefined && stat.size <= rule['more-than'])
    {
        return false;
    }
    else if(rule['more-or-equal-than'] !== undefined && stat.size < rule['more-or-equal-than'])
    {
        return false;
    }
    else if(rule['equal-than'] !== undefined && stat.size != rule['equal-than'])
    {
        return false;
    }
    else
    {
        return true;
    }
};
