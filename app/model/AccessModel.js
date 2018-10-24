const mvc = require.main.require( './kldit/lib/mvc' );

/**
 * @author Orlando Leite
 *
 * AccessModel class
 */
module.exports = class AccessModel extends mvc.BaseModel
{
    /*
    check( accessType, mapName, map, path, ids = NULL, curValues = NULL, newValues = NULL )
    {
        validation = array();

        if( map.access )
        {
            if( map.access[accessType] )
            {
                access = map.access.{accessType};
                
                foreach( access AS key => rule )
                {
                    if( rule.procedure )
                    {
                        if( newValues == null ) newValues = array();
                        
                        foreach( rule.values AS k => v ) newValues[k] = v;
                        
                        CMSProcedures::setup( mapName, map, path, ids, this.db, newValues );
                        result = CMSProcedures::apply( CMS::procedures( key ) );
                        // print_r( result );
                    }
                    else
                        result = CMSValidation::validate( key, mapName, currentValues, rule );

                    if( !result )
                    {
                        validation[] = array(
                            'icon' => rule.icon,
                            'class' => rule.class,
                            'message' => rule.message );
                    }
                }
            }
        }

        return validation;
    }

    public function getMenu( menu, map )
    {
        CMSProcedures::setup( '', array(), array(), array(), this.db, array() );
        // print_r( menu.anuncios.subs.destacados.access.values );
        
        foreach( menu AS k => v )
        {
            if( isset( v.subs ) )
            {
                hasOne = false;
                foreach( v.subs AS k2 => v2 )
                {
                    if( !isset( v2.access ) || CMSProcedures::apply( CMS::procedures( v2.access.procedure ), v2.access.values ) )
                    {
                        hasOne = true;
                        unset( v2.access );
                        list[k2] = v2;
                    }
                    else
                    {
                        unset( v.subs.{k2} );
                    }
                }
                
                if( !hasOne )
                {
                    unset( menu.{k} );
                }
            }
            else
            {
                if( !isset( v.access ) || CMSProcedures::apply( CMS::procedures( v.access.procedure ), v.access.values ) )
                {
                    unset( v.access );
                }
                else
                {
                    unset( menu.{k} );
                }
            }
        }
        
        return menu;
    }*/
}