const mvc = require.main.require( './kldit/lib/mvc' );
const sha1 = require('sha1');
const formatter = require('date-and-time');
const MySQL = require('ext-mysql');

module.exports = 

/**
 * @author Orlando Leite
 *
 * SessionModel class
 */
class SessionModel extends mvc.BaseModel
{
    constructor( ctx )
    {
        super( ctx );
    }
    
    async getLoggedUser( ctx, username )
    {
        try
        {
            const conn = await ctx.db();
            
            var [rows, fields] = await conn.execute( 
                'SELECT * FROM ' + 
                process.env.CMS_USERS_TABLE_NAME + ' AS u' + 
                ( process.env.CMS_GROUP_TABLE_NAME != null ? ( ' JOIN ' + process.env.CMS_GROUP_TABLE_NAME + ' AS g ON u.' + process.env.CMS_GROUP_REL_ID + ' = g.id' ) : '' ) +
                ' WHERE u.' + process.env.CMS_USERS_USERNAME_COLUMN + ' = ?', [username] );
            
            if( rows.length )
                return rows[0];
            else
                return null;
        }
        catch( err )
        {
            console.error( err );
        }
    }
    
    async getUser( ctx, username, password )
    {
        try
        {
            const conn = await ctx.db();
            
            const [rows, fields] = await conn.execute( 
                'SELECT id \
                 FROM ' + process.env.CMS_USERS_TABLE_NAME +
                 ' WHERE ' + process.env.CMS_USERS_USERNAME_COLUMN + ' = ? AND \
                sha1( concat( ' + process.env.CMS_USERS_PASSWORD_COLUMN + ', ? ) ) = ?',
                [username, process.env.CMS_CONNECTION_HASH, password] );
            
            conn.release();
            
            if( rows.length )
                return sha1( password + formatter.format( new Date(), 'YYYY-MM-DD') + rows[0]['id'] );
            else
                return null;
        }
        catch( err )
        {
            console.error( err );
        }
    }
    
    async loginUser( ctx, username, token )
    {
        try
        {
            const conn = await ctx.db();
            
            const [rows, fields] = await conn.execute( 
                'SELECT id, sha1( concat( ' + process.env.CMS_USERS_PASSWORD_COLUMN + ', ? ) ) AS password FROM ' + 
                process.env.CMS_USERS_TABLE_NAME + ' WHERE ' + process.env.CMS_USERS_USERNAME_COLUMN + ' = ?',
                [process.env.CMS_CONNECTION_HASH, username] );
            
            if( rows.length )
            {
                if( sha1( rows[0]['password'] + 
                    formatter.format( new Date(), 'YYYY-MM-DD') +
                    rows[0]['id'] ) == token )
                {
                    return true;
                }
                else
                    return false;
            }
            else
                return false;
        }
        catch( err )
        {
            console.error( err );
            return false;
        }
    }
    
    async createUser( ctx, name, username, password )
    {
        var result = 0;
        
        try
        {
            const conn = await ctx.db();
            
            await conn.beginTransaction();
            
            var [rows, fields] = await conn.execute( 
                "SELECT id FROM " + process.env.CMS_USERS_TABLE_NAME + " WHERE " + process.env.CMS_USERS_USERNAME_COLUMN + " = ?", 
                [username] );
            
            if( rows.length == 0 )
            {
                var value = {};
                value[process.env.CMS_USERS_NAME_COLUMN] = name;
                value[process.env.CMS_USERS_USERNAME_COLUMN] = username;
                value[process.env.CMS_USERS_PASSWORD_COLUMN] = password;
                
                var [ids, results] = await conn.insert(
                    process.env.CMS_USERS_TABLE_NAME,
                    [value]);
                
                if( ids.length > 0 )
                {
                    result = 1;
                    await conn.setTransactionSuccessful();
                }
            }
            else
            {
                result = -1;
            }
        }
        catch( err )
        {
            console.error( err );
        }
        finally
        {
            await conn.endTransaction();
            
            return result;
        }
    }
}
