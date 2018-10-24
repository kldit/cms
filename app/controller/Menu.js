const CMS = require.main.require( './kldit/lib/CMS' );
const fs   = require('fs');

/**
 * @author Orlando Leite
 *
 * Menu class
 */
module.exports = class Menu extends CMS
{
    constructor( context )
    {
        super( context );
    }
    
    init()
    {
        super.init();
        
        this.loadModel( 'Access' );
        
        try
        {
            this.doc = CMS.loadYamlDocument('./' + process.env.CMS_APP_DIR + '/menu.yml');
        }
        catch( err )
        {
            console.error( err );
        }
    }
    
    async index( ctx )
    {
        // Get document, or throw exception on error
        this.menu = this.doc;// this.model.access.getMenu( $this->config['menu']->menu, $this->config['map'] );
        
        
        // this.file = json_decode( file_get_contents( Config::FULL_APP_PATH.CMSConfig::CMS_DIR.'/menu.json' ) );
        ctx.body = this.menu;
    }
}
