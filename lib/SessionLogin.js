/**
 * @author Orlando Leite
 *
 * SessionLogin class
 */
module.exports = class SessionLogin
{
    static setup( value = {
            SESSION_VAR:process.env.CMS_SESSION_VAR,
            USERNAME_COLUMN:process.env.CMS_USERS_USERNAME_COLUMN,
            PASSWORD_COLUMN:process.env.CMS_USERS_PASSWORD_COLUMN,
            GROUP_REL_ID:process.env.CMS_GROUP_REL_ID,
            USER_TABLE_NAME:process.env.CMS_USERS_TABLE_NAME,
            GROUP_TABLE:process.env.CMS_GROUP_TABLE
        } )
    {
        this.config = value;
    }
    
    static getLoggedUser( ctx )
    {
        // error_log( this.sessionVar );
        
        if( ctx.session[this.config.SESSION_VAR] )
        {
            return this.loadUser( ctx.session[this.config.SESSION_VAR] );
        }
        else
        {
            return false;
        }
    }

    static async loadUser( username )
    {
        const db = new MySQL();
        await db.init();
        
        var result = await db.select( 
            'SELECT * FROM ' + 
            this.config.USER_TABLE_NAME + ' AS u' + 
            ( this.config.GROUP_TABLE_NAME != null ? ( ' JOIN ' + this.config.GROUP_TABLE_NAME + ' AS g ON u.' + this.config.GROUP_REL_ID + ' = g.id' ) : '' ) +
            ' WHERE u.' + this.config.USERNAME_COLUMN + ' = ?', [username] );

        db.release();
        
        return ( result != null && count( result ) > 0 ) ? result[0] : null;
    }
    
    /**
    * Do a login.
    * @param string username username for log in.
    * @param string password password for log in.
    * @access public
    * @static
    * @return boolean success or not.
    */
    static async login( username, password, passhash, keepLogged = true )
    {
        const db = new MySQL();
        await db.init();
        
        var sql = 'SELECT * FROM ' + this.config.USER_TABLE_NAME + ' AS u' + 
            ( this.config.GROUP_TABLE_NAME != null ? ( ' JOIN ' + this.config.GROUP_TABLE_NAME + ' AS g ON u.' + this.config.GROUP_REL_ID + ' = g.id' ) : '' ) +
            ' WHERE u.' + this.config.USERNAME_COLUMN + ' = ? AND u.' + this.config.PASSWORD_COLUMN + ' = SHA1(?)';
        var binds = [username, password, passhash];
        // echo sql; exit;

        var result = await db.select( sql, binds );
        
        db.release();
        
        if( result != null && count( result ) > 0 )
        {
            ctx.session[this.config.SESSION_VAR] = username;

            return result[0];
        }
        else
            return false;
    }
    /*
    public static function checkPassword( username, password, passhash )
    {
        sql = 'SELECT * FROM '.this.userTable.' AS u'.
            ( this.groupTable != null ? ( ' JOIN '.this.groupTable.' AS g ON u.'.this.relId.' = g.id ' ) : '' ).
            ' WHERE u.'.this.usernameVar.' = \''.username.'\' AND u.'.this.passwordVar.' = SHA1(\''.password.passhash.'\')';
        
        result = this.db.select( sql );

        if( result != null && count( result ) > 0 )
            return true;
        else
            return false;
    }

    /**
    * Do a login.
    * @param string username username for log in.
    * @param string password password for log in.
    * @access public
    * @static
    * @return boolean success or not.
    * /
    public static function loginById( id, keepLogged = true )
    {
        result = this.db.select( 'SELECT * FROM '.this.userTable.' AS u'.
            ( this.groupTable != null ? ( ' JOIN '.this.groupTable.' AS g ON u.'.this.relId.' = g.id ' ) : '' ).
            ' WHERE u.id = \''.id.'\'' );
        
        if( result != null && count( result ) > 0 )
        {
            if( keepLogged )
                _SESSION[this.sessionVar] = result[0][this.usernameVar];

            return result[0];
        }
        else
            return null;
    }

    /**
    * Do a passowrd change.
    * @param string username username for log in.
    * @param string password password for log in.
    * @access public
    * @static
    * @return boolean success or not.
    * /
    public static function changePassword( username, oldPassword, newPassword, passhash )
    {
        result = this.db.select( 'SELECT * FROM '.this.userTable.' AS u'.
            ( this.groupTable != null ? ( ' JOIN '.this.groupTable.' AS g ON u.'.this.relId.' = g.id ' ) : '' ).
            ' WHERE u.'.this.usernameVar.' = \''.username.'\' AND u.'.this.passwordVar.' = SHA1(\''.oldPassword.passhash.'\')' );
        
        if( result != null && count( result ) > 0 )
        {
            this.db.update( this.userTable, array( this.passwordVar : sha1( newPassword.passhash ) ), array( 'id' : result[0]['id'] ) );
            return true;
        }
        else
            return false;
    }
    
    /**
    * Do a logout.
    * @access public
    * @static
    * @return void.
    * /
    public static function logout()
    {
        unset( _SESSION[this.sessionVar] );
    }
    */
}
