/**
 * @author Orlando Leite
 *
 * CustomField class
 */
const { MQL } = require( 'mql-mysql' );

module.exports = class CustomField
{
    // protected table, column, value, name;
    
    constructor( table, name, column, value )
    {
        this.table = table;
        this.name = name;
        this.column = column;
        this.value = value;
    }
    
    setup( request, mapName, map, path, mapId, field, db = null )
    {
        request.setColumn( this.table, this.column, this.name, this.value, this, MQL.GET );
    }
    
    select( cms, quick = false ){ return true; }
    insert( values )
    {
        this.request.setColumnFlag( this.table, this.column, MQL.SET );
    }
    
    update( values )
    {
        this.request.setColumnFlag( this.table, this.column, MQL.SET );
    }
    
    setFrom( values, operation ){}
    delete(){}
    validate( curValues, newValues, force = false ){}
    submit( value ){}
    doSelectAndSearch( searchValue, quick = false ){}
    listView( id, value ) {}
    editView( value ) {}
    updateEditView( values ) {}
    
    orderBy()
    {
        return this.table + "." + this.column;
    }
}