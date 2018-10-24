const CustomField = require( './CustomField' );
const { MQL } = require( 'mql-mysql' );

/**
 * @author Orlando Leite
 *
 * JoinField class
 */
module.exports = class JoinField extends CustomField
{
    constructor( table, name, column, value, joinType )
    {
        super( table, name, column, value, joinType );
        
        switch( joinType )
        {
            case 'LEFT_JOIN':
                joinType = MQL.LEFT_JOIN;
                break;
                
            case 'RIGHT_JOIN':
                joinType = MQL.RIGHT_JOIN;
                break;
                
            case 'INNER_JOIN':
                joinType = MQL.INNER_JOIN;
                break;
                
            case 'OUTER_JOIN':
                joinType = MQL.OUTER_JOIN;
                break;
            
            default:
                joinType = MQL.JOIN;
                break;
        }
        
        this.joinType = joinType;
    }
    
    joinType()
    {
        return this.joinType;
    }
    
    setup( request, mapName, map, path, mapId, field, db = null )
    {
        this.request = request;
        this.mapName = mapName;

        this.map = map;
        this.path = path;
        this.mapId = mapId;
        this.field = field;
        this.db = db;
        // parent::set( request, mapName, map, path, mapId, field, db );
        
        this.join = path = this.value.split( '.' );
        // console.log( this.mapId );
        this.value = ( this.mapId &&
            !this.mapId[mapName] && 
             this.mapId[path[0]] && 
             path[1] == 'id' ) 
            ? this.mapId[path[0]] 
            : this.value;
            
        request.setColumn( this.table, this.column, this.name, this.value, this, this.joinType );
    }
    
    _table( targetName )
    {
        if( targetName == this.mapName )
        {
            return this.map;
        }
        else
        {
            var from = this.map.tables[targetName];

            if( from )
                return from;
            else
            {
                var result = {
                    id : 'id',
                    from : targetName,
                    join : '' 
                };

                return result;
            }
        }
    }
    
    insert( values )
    {
        var t = this._table( this.table );
        
        if( t.id == this.column )
            this.request.setColumn( this.table, this.column, this.name, this.value, this, 0 );
    }
    
    update( values )
    {
        var t = this._table( this.table );
        
        //if( t.id == this.column )
        //	this.request.setColumn( this.table, this.column, this.name, this.value, this, 0 );
    }
}