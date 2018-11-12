/**
 * It enhance the default node.js module `util`.
 * @module util
 */

const ejs = require('ejs');
const { util } = require('@kldit/mvc');

/**
 * Render a template ejs using `{ ... }` delimiter
 * @function renderJsLine
 * @param {string} str - Template text.
 * @param {object} data - The data object used to render the template.
 * @returns {string} rendered value.
 */
util.renderJsLine = function (str, data)
{
    if(str && String.isString(str))
    {
        try
        {
            return ejs.render(
                str,
                data,
                {
                    openDelimiter: '{',
                    closeDelimiter: '}',
                    delimiter: '',
                    forceEscape: true,
                    escape: function (v) { return v }
                });
        }
        catch (err)
        {
            console.log(str, err);

            return null;
        }
    }
    else
        return str;
}

/**
 * Render all the string properties of an object.
 * @function renderJsLine
 * @param {object} obj - The target object.
 * @param {object} data - The data object used to render the template.
 * @returns {string} rendered object value.
 */
util.renderJsLines = function (obj, data)
{
    if(String.isString(obj))
        return util.renderJsLine(obj, data);
    else
    {
        var result;
        if(Array.isArray(obj))
            result = [];
        else if(typeof obj == "object")
            result = {}

        for(var key in obj)
        {
            var value = obj[key];
            result[key] = util.renderJsLines(value, data);
        }

        return result;
    }
};

module.exports = util;