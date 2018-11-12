const mvc = require.main.require( '@kldit/mvc' );

module.exports = 

/**
 * @author Orlando Leite
 *
 * Home class
 */
class Home extends mvc.BaseController
{
    index( ctx )
    {
        var pjson = require('../../package.json');
        ctx.body = `kldit::cms\nversion ${pjson.version}`;
    }
}