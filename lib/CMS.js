/**
 * @author Orlando Leite
 *
 * CMS class
 */

const { optionalRequire } = require('@kldit/mvc/lib/util');
const mvc = require('@kldit/mvc');
const formatter = require('date-and-time');

const yaml = optionalRequire('js-yaml');
const libxmljs = optionalRequire('libxmljs');

const fs = require('fs');

module.exports = class CMS extends mvc.BaseController
{
    static setup()
    {
        if(!CMS.inited)
        {
            /*var files = await glob("./" + path + "/controller/*.js");
            for( var i in files )
            {
                var file = files[i];
                var temp = file.split('/').pop().split( '.js' )[0].toLowerCase();
                this.apps[name].controller[temp.slugify()] = new (require.main.require(file))( this );
            }*/
            var basePath = './' + process.env.CMS_APP_DIR;

            var load = function ()
            {
                CMS.config = {};
                fs.readdirSync(basePath).forEach(file =>
                {
                    if(file.substr(0, 1) != '.')
                    {
                        if(fs.statSync(basePath + '/' + file).isDirectory())
                        {
                            try
                            {
                                CMS.config[file] = CMS.loadDir(file);
                            }
                            catch(err)
                            {
                                console.log(err);
                            }
                        }
                    }
                });
            }

            require('./fields/');
            require('./validators/');

            if(process.env.CMS_DEBUG)
            {
                fs.watch(basePath, { recursive: true }, function (event, filename)
                {
                    console.log("Reloading CMS");
                    load();
                });
            }

            load();

            CMS.inited = true;
        }
    }

    init()
    {
        this.loadModel('Session');
    }

    static loadDir(dir)
    {
        var basePath = './' + process.env.CMS_APP_DIR + '/' + dir;

        var directory = {};
        fs.readdirSync(basePath).forEach(file =>
        {
            if(file.substr(0, 1) != '.')
            {
                if(!fs.statSync(basePath + '/' + file).isDirectory())
                {
                    var temp = file.split('.');
                    var ext = temp.pop();

                    var result = null;
                    if(ext == 'yml' || ext == 'yaml')
                    {
                        if(!yaml)
                            throw new Error('Error, js-yaml not installed, document: ' + basePath + '/' + file);
                        result = CMS.loadYamlDocument(basePath + '/' + file);
                    }
                    else if(ext == 'json')
                    {
                        result = CMS.loadJsonDocument(basePath + '/' + file);
                    }
                    else if(ext == 'xml')
                    {
                        if(!libxmljs)
                            throw new Error('Error, libxmljs not installed, document: ' + basePath + '/' + file);

                        result = CMS.loadXmlDocument(basePath + '/' + file);
                    }
                    else
                        throw new Error('Not supported document type: ' + basePath + '/' + file);

                    if(result == null)
                        throw new Error('Error parsing document: ' + basePath + '/' + file);
                    //loadDirectory( file );

                    var name = temp.join('.');
                    if(directory[name])
                        throw new Error('Error duplicated name: ' + basePath + '/' + file);

                    directory[name] = result;
                }
            }
        });

        return directory;
    }

    static loadYamlDocument(path)
    {
        try
        {
            var doc = fs.readFileSync(path, 'utf8');

            return yaml.safeLoad(doc.replace(/\t/g, '  '));
        }
        catch(err)
        {
            console.error("File: " + path);
            console.error(err);
            return null;
        }
    }

    static loadJsonDocument(path)
    {
        try
        {
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        }
        catch(err)
        {
            console.error(path, err);
            return null;
        }
    }

    static loadXmlDocument(path)
    {
        try
        {
            var xml = libxmljs.parseXml(fs.readFileSync(path, 'utf8'), { blanks: false });
            var json = require('@kldit/cms/lib/document/XmlDocument')( xml );
            // console.log( require.cache );
            //delete require.cache[require.main.require.resolve('./kldit/lib/document/XmlDocument')];
            if( json == null )
            {
                console.error("Error XML document " + path + " is not supported.");
                return null;
            }
            else
            {
                return json;
            }
        }
        catch(err)
        {
            console.error(err);
            return null;
        }
    }

    async preHandle(ctx)
    {
        ctx.cms = {};
        ctx.cms.undefinedOrEqualTo = function( target, value )
        {
            return target === undefined || target == value;
        }

        if(ctx.request.header === 'OPTIONS')
        {
            ctx.set("HTTP/1.1 202 Accepted");
            ctx.response.send();
        }

        ctx.set('Access-Control-Allow-Credentials', 'true');
        ctx.set('Access-Control-Allow-Origin', process.env.CMS_DOMAIN);
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

        ctx.set('Content-Type', 'application/json');

        // if( !ctx.session.front ) ctx.session.front = [];

        if(ctx.session[process.env.SESSION_VAR] != null)
        {
            ctx.cms.user = await this.model.session.getLoggedUser(ctx, ctx.session[process.env.SESSION_VAR]);

            if(ctx.cms.user == null)
            {
                this.noUserLogged(ctx);

                return false;
            }
            else
            {
                CMS.prepareContext(ctx);
                return true;
            }
        }
        else
        {
            this.noUserLogged(ctx);

            return false;
        }
    }

    noUserLogged(ctx)
    {
        //ctx.session.cmsLoginRedirect = $requestUri;
        ctx.body = { status: false, logged: false };
        //ctx.redirect( '/' + process.env.CMS_PATH_NAME + 'session' );
    }

    /*
    private static cms_instance;

    function __construct( context )
    {
        self::cms_instance = this;
        super( context );
        
        header( 'Access-Control-Allow-Origin: '.CMSConfig::ALLOW_DOMAIN );
        header( 'Access-Control-Allow-Headers: '.CMSConfig::ALLOW_DOMAIN );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS' );
        
        if( @_SERVER['REQUEST_METHOD'] === 'OPTIONS' )
        {
            header("HTTP/1.1 202 Accepted");
            exit;
        }

        SessionLogin::setup(
            context.db,
            CMSConfig::CONNECTION_SESSION_VAR,
            CMSConfig::USERS_TABLE_NAME );
        SessionLogin::setColumns( CMSConfig::USERS_USERNAME_COLUMN, CMSConfig::USERS_PASSWORD_COLUMN );

        if( !isset(_SESSION['front']) ) _SESSION['front'] = array();
        
        // Options::setup( context.db, Config::SYSTEM_TABLE_PREFIX.'options' );
        
        this.user = SessionLogin::getLoggedUser();
        // this.front = Options::get( 'cms', 'front' );

        //define( 'CMS_ASSETS', HOME.'static/cms-assets/' );
        //define( 'CMS_CUSTOM_ASSETS', HOME.'static/cms-custom-assets/' );
        //define( 'CMS_HOME', HOME );
        //define( 'STORAGE', HOME.'storage/' );
        //define( 'SERVICE', HOME.'service/' );

        //this.config = json_decode( file_get_contents( INCLUDE_PATH.'boot/admin/config.json' ), true );
        this.config = array();
        
        require_once( Config::FULL_APP_PATH.CMSConfig::CMS_DIR.'/init.php' );
        // this.config['init'] = json_decode( file_get_contents(  ) );
        this.config['map'] = new JSONConfig( 'map' );
        this.config['pages'] = new JSONConfig( 'page' );
        this.config['layout'] = new JSONConfig( 'layout' );
        this.config['procedures'] = new JSONConfig( 'procedures', 2 );

        //foreach( this.config['init'].{"load-lib-files"} AS file )
        //	load_lib_file( file );
        
        if( this.user == NULL ) this.noUserLogged( context.uri['request_uri'] );

        this.loadModel( 'Util' );
        global CMSUtilModel;
        CMSUtilModel = this.model.util;
            
        //this.loadMenu();
        this.viewVars = array( 'url' => context.uri['short_uri'], 'user' => this.user );

        // this.loadPlugins();
        
        define( 'USER_LIBRARY_PATH', STORAGE_PATH.'/library/user'.this.user['id'].'/' );
        
        if( function_exists( '__custom_init') )
        {
            __custom_init( context );
        }
    }

    private function loadPlugins()
    {
        PATH = INCLUDE_PATH.'/plugins/';
        if( handle = opendir( PATH ) )
        {
            while( false !== ( file = readdir( handle ) ) )
            {
                if( substr( file, 0, 1 ) != '.' )
                    require_once PATH.file.( is_dir( PATH.file ) ? '/index.php' : '' );
            }
        }
    }
    */
    static parseSlashGet(vars, defaults = {})
    {
        var options = {};

        if(vars.length % 2 == 0)
        {
            vars = Object.clone(vars);

            while(vars.length > 0)
            {
                var name = vars.shift();
                var value = vars.shift();

                options[name] = value.split(',');
                if(options[name].length == 1)
                    options[name] = options[name][0]; //urldecode( options[name][0] );
            }

            for(var key in defaults)
            {
                var item = defaults[key];

                if(!options[key]) options[key] = item;
            }
        }

        return options;
    }
    /*
    public static function createSlashGet( vars )
    {
        str = glue = '';
        foreach( vars AS key => value )
        {
            if( is_array( value ) ) value = implode(',', value );
            
            str .= glue.key.'/'.value;
            glue = '/';
        }
        
        return str;
    }
    */
    static parseMapId(ids, defaultValue)
    {
        var mapId = {};

        if(ids != null)
        {
            for(var i in ids)
            {
                var id = ids[i];
                var t = id.split('=');

                if(t.length == 1)
                    mapId[defaultValue] = t[0];
                else
                    mapId[t[0]] = t[1];
            }
        }

        return mapId;
    }
    /*
    public static function createMapId( obj, default )
    {
        result = '';
        glue = '';
        foreach( obj AS key => value )
        {
            if( key == default )
            {
                result .= glue.value;
            }
            else
            {
                result .= glue.key.'='.value;
            }
            
            glue = '&';
        }
        
        return result;
    }

    protected function noUserLogged( requestUri )
    {
        _SESSION['cms-login-redirect'] = requestUri;

        header_redirect( '/'.Config::PATH_NAME.'session' );
        exit();
    }

    function index( vars )
    {

    }

    protected function renderView( view, vars = '', header = false )
    {
        parent::renderView( this.front.'/'.view, vars, header );
    }

    
    protected function parseTable( target, onlyQuickedit = false)
    {
        table = array();

        foreach( target AS key => attr )
        {
            if( (string)key == 'field' )
            {
                table['field'] = array();

                foreach( attr AS fkey => field )
                {
                    // Use only fields with quickedit
                    if( @field['quickedit'] != false || !onlyQuickedit || @field['type'] == 'where' )
                    {
                        // If it has options should be parsed
                        if( @field['option'] != NULL )
                        {
                            tempField = array();

                            // Make a copy of original field because we don't 
                            // want to change the config file
                            foreach( field AS key => fattr )
                            {
                                tempField[key] = fattr;
                            }

                            tempField['option'] = this.model.util.parseOptions( field['option'] );

                            table['field'][fkey] = tempField;
                        }
                        else
                        {
                            table['field'][fkey] = field;
                        }
                    }
                }
            }
            else
            {
                table[key] = attr;
            }
        }

        return table;
    }

    public static function mapByName( name )
    {
        target = self::cms_instance;
        return target.config['map'].get(name);
    }

    public static function pageByName( name )
    {
        target = self::cms_instance;
        return target.config['pages'].get(name);
    }

    public static function procedures( name )
    {
        target = self::cms_instance;
        return target.config['procedures'].get(name);
    }

    public static function user()
    {
        target = self::cms_instance;
        return target.user;
    }
    */
    // private static globalValues = NULL;

    static prepareContext(ctx)
    {
        ctx.cms.USER = ctx.cms.user;
        ctx.cms.DATE = { 'TIMESTAMP': formatter.format(new Date(), 'Y-m-d H:i:s'), 'TIME': Date.now() };
        ctx.cms.CONTEXT = {
            'MAP_NAME': ctx.cms.mapName,
            'MAP_TABLE': ctx.cms.mapName ? CMS.config[ctx.cms.mapName].map.table : null
        };
        // ctx.cms.post = ctx.request.body;
        // ctx._globalValues['CONFIG'] = { 'FULL_APP_PATH' : Config::FULL_APP_PATH );

        /*ctx._globalValues.get = function (name, sub = null)
        {
            var temp = this[name];

            if(sub !== null && temp !== null)
                return temp[sub];
            else
                return temp;
        }

        ctx._globalValues.set = function (name, list)
        {
            this[name] = list;
        }*/
    }
    /*
    static exitWithMessage( type, message, debug = NULL )
    {
        if( Config::ENV == 'development' )
        {
            target = self::cms_instance;
            target.renderView( 'Error', array( 'type' => type, 'text' => message, 'debug' => debug ) );
            exit();
        }
        else
        {
            target = self::cms_instance;
            target.renderView( 'Error', array( 'type' => type, 'text' => 'Erro interno' ) );
            exit();
        }
    }

    /*protected function throwFatalError( err )
    {
        this.renderView( 'FatalError', array( 'error' => err ) );
        exit();
    }*/

}
