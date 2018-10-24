const mvc = require.main.require( './kldit/lib/mvc' );
const sha1 = require('sha1');

/**
 * @author Orlando Leite
 *
 * Session class
 */
module.exports = class Session extends mvc.BaseController
{
    constructor( context )
    {
        super( context );
    }
    
    init()
    {
        this.loadModel( 'Session' );
    }
    
    async preHandle( ctx )
    {
        if( ctx.request.header === 'OPTIONS' )
        {
            ctx.set( "HTTP/1.1 202 Accepted" );
            ctx.response.send();
        }
        
        ctx.set('Access-Control-Allow-Credentials', 'true');
        ctx.set('Access-Control-Allow-Origin', process.env.CMS_DOMAIN);
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        
        ctx.set('Content-Type', 'application/json');
        
        return true;
    }
    
    async token( ctx )
    {
        const token = await this.model.session.getUser(
            ctx,
            ctx.request.body.username,
            ctx.request.body.password );

        if( token )
        {
            ctx.body = { status : true, token : token };
        }
        else
        {
            ctx.body = { 'status' : false };
        }
    }
    
    async login( ctx )
    {
        if( await this.model.session.loginUser( ctx, ctx.request.body.username, ctx.request.body.token ) )
        {
            ctx.session[process.env.CMS_CONNECTION_SESSION_VAR] = ctx.request.body.username;
            
            ctx.body = { 'status' : true, 'logged' : true };
        }
        else
            ctx.body = { 'status' : true, 'logged' : false };
    }
    
    async signIn( ctx )
    {
        if( sha1( ctx.request.body.password + process.env.CMS_CONNECTION_HASH ) == ctx.request.body.token )
        {
            var result = await this.model.session.createUser(
                ctx,
                ctx.request.body.name,
                ctx.request.body.username,
                ctx.request.body.password );

            if( result == -1 )
            {
                ctx.body = { status : false, message : "Este usuário já está cadastrado." };
            }
            if( result == 1 )
            {
                ctx.body = { status : true };
            }
            else
            {
                ctx.body = { status : false };
            }
        }
        else
        {
            ctx.body = { status : false, message : "Embaralhador de senhas está incorreto." };
        }
    }

    async logout( ctx )
    {
        ctx.session[process.env.SESSION_VAR] = null;
        ctx.body = { 'status' : true, 'logged' : false };
    }

    async index( ctx )
    {
        ctx.body = { 'status' : true, 'logged' : ctx.user ? true : false };
    }
}
