const gm = require('gm');
const { promisify } = require('util');
const Promise = require('bluebird');
Promise.promisifyAll(gm.prototype);

module.exports = async function (cms, fieldName, value, rule, db)
{
    const field = cms.request.column(fieldName).field;
    let url = field.url(cms, value);
    let stat = gm(url);

    let { width, height } = await stat.sizeAsync();
    let ar = undefined;
    if(rule['aspect-ratio'])
    {
        ar = rule['aspect-ratio'].split(":");
        ar = Math.floor(ar[0] * 1000 / ar[1]);
    }

    if(rule['min-width'] !== undefined && width < rule['min-width'])
    {
        return false;
    }
    else if(rule['max-width'] !== undefined && width > rule['max-width'])
    {
        return false;
    }
    else if(rule['width'] !== undefined && width != rule['width'])
    {
        return false;
    }
    else if(rule['min-height'] !== undefined && height < rule['min-height'])
    {
        return false;
    }
    else if(rule['max-height'] !== undefined && height > rule['max-height'])
    {
        return false;
    }
    else if(rule['height'] !== undefined && height != rule['height'])
    {
        return false;
    }
    else if(rule['aspect-ratio'] !== undefined && Math.floor(width * 1000 / height) != ar)
    {
        return false;
    }
    else
    {
        return true;
    }
};
