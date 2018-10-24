const mvc = require.main.require('./kldit/lib/mvc');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const Request = require.main.require('./kldit/lib/Request');
const util = require('util');

/**
 * @author Orlando Leite
 *
 * ListModel class
 */
module.exports = class ListModel extends mvc.BaseModel
{
    async search(ctx)
    {
        const db = await ctx.db();

        // console.log( ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids );
        var request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
        
        if(ctx.cms.orderBy != null)
            request.addOrderBy(ctx.cms.orderBy[0], ctx.cms.orderBy[1]);
        
        var limit = ctx.cms.page['page-limit'] ? ctx.cms.page['page-limit'] : 30;
        var fields = Object.keys(ctx.cms.info);
        // console.log( fields );
        var mql = await request.matrixQueryForSelect(ctx.cms, ctx.cms.fields);

        // console.log( util.inspect(mql, false, null, true /* enable colors */));

        // Add column id
        if(ctx.cms.map["custom-mql"])
        {
            //load_lib_file( 'cms/parse_json_mql' );

            // mql = parse_json_mql( ctx.cms.map["custom-mql"], [] );
            mql = Object.clone(ctx.cms.map["custom-mql"]);
        }
        else
        {
            var temp = mql[mql.target];
            mql[mql.target].addColumn('id', temp.id, '', MQL.GET);
        }

        if(!mql.groupBy()) mql.addGroupBy(ctx.cms.mapName + '.id');

        // Get list page
        // unset( mql['select'][selid] );
        mql.setSlice(ctx.cms.queryPage * limit, limit * 3);

        // print_r( ctx.cms.orderBy );
        // if(ctx.cms.orderBy != null)
        //	 mql.addOrderBy(ctx.cms.orderBy[0], ctx.cms.orderBy[1]);

        // print_r( mql );

        //mql.options = { count: true };

        var where = '',
            wglue = '';
        var rsearch = request.search;
        if(ctx.cms.map.search && ctx.cms.searching)
        {
            for(var key in ctx.cms.map.search)
            {
                var field = ctx.cms.map.search[key];
                var column = rsearch.column(key);
                var value = column['field'].search(request, ctx.cms);

                if(value !== null)
                {
                    where += wglue + value;
                    wglue = ' AND ';
                }
            }
        }

        if(where != '')
        {
            mql['custom-where'] = where;
        }

        if(ctx.cms.map["custom-list-where"])
        {
            if(where)
                mql['custom-where'] += wglue + '(' + ctx.cms.map["custom-list-where"] + ')';
            else
                mql['custom-where'] = ctx.cms.map["custom-list-where"];
        }

        var result = { list: null, request: request, error: null };
        try
        {
            const [rows, fields] = await MQLtoMySQL.select(mql, db);
            // console.log( JSON.stringify( mql, null, "\t" ) );
            result.total = ctx.cms.queryPage * limit + rows.length;

            result.list = rows.splice(0, limit);
        }
        catch(err)
        {
            console.log(err);
            result.error = err;
        }

        // var [rows, fields] = await db.execute('SELECT FOUND_ROWS() AS found;');

        // console.log( result );
        // print_r( this.db.error() );

        return result;
    }
    
    async searchValidation(ctx, fullValidation = true) //CMSValidation::setup( $ctx.cms.mapName, $ctx.cms.map, $ctx.cms.path, $ctx.cms.ids, $this->db );
    {
        const db = await ctx.db();
        var temp = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
        var request = temp.search;
        var validation = {};
        var columns = request.columnsName;
        
        for(var kcol of Object.values(columns))
        {
            var result;
            
            try
            { 
                result = await request.column(kcol).field.validate(ctx.cms, fullValidation);
            }
            catch( err )
            {
                console.log( err );
                result = { message:"There is when validating column \'" + kcol + "\'" };
            }
            
            if(result != null && result) validation[kcol] = result;
        }

        // var rsearch = request.search;
        /*
        if(ctx.cms.search) //print_r( $values );
        {
            columns = request.columnsName;

            for(var kcol of Object.values(columns))
            {
                result = rsearch.column(kcol).field.validate(ctx.cms, fullValidation);
                if(result != undefined && result) validation[kcol] = result;
            }
        }
        */
        if(validation.length == 0)
        {
            if(ctx.cms.map.validation)
            {
                {
                    let _tmp_0 = ctx.cms.map.validation.rules;

                    for(var key in _tmp_0) //CMSValidation::validate( $key, $ctx.cms.mapName, $currentValues, $rule );
                    {
                        var rule = _tmp_0[key];

                        if(rule.procedure) //print_r( $result );
                        {
                            CMSProcedures.setup(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, await ctx.db(), values);
                            result = CMSProcedures.apply(CMS.procedures(key));
                        }
                        else result = CMSValidate(key, this.ctx.cms.mapName, this.ctx.cms.map, this.ctx.cms.path, this.ctx.cms.ids, await ctx.db(), this.fieldName, this, value, rule);

                        if(!result)
                        {
                            validation.push(
                            {
                                icon: rule.icon,
                                class: rule.class,
                                message: rule.message
                            });
                        }
                    }
                }
            }
        }

        return {
            request: request,
            validation: validation
        };
    }
}
