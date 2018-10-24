const mvc = require.main.require( './kldit/lib/mvc' );

module.exports = 

/**
 * @author Orlando Leite
 *
 * Error404 class
 */
class Error404 extends mvc.BaseController
{
    index( ctx )
    {
        ctx.set('Access-Control-Allow-Credentials', 'true');
        ctx.set('Access-Control-Allow-Origin', process.env.CMS_DOMAIN);
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        
        ctx.response.status = 404;
        ctx.body = { status: false, error: 404 };
    }
}