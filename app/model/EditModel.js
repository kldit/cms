const mvc = require('@kldit/mvc');
const Request = require('@kldit/cms/lib/Request');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const util = require('util');
/**
 * @author Orlando Leite
 *
 * EditModel class
 */
module.exports = class EditModel extends mvc.BaseModel
{
    constructor(context)
    {
        super(context);
    }

    async prepareFields(ctx)
    {
        var request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, await ctx.db());
        return {
            values: [],
            request: request
        };
    }

    async get(ctx) //print_r( $mql );exit;
    //MatrixQuery::printQuery( $mql ); exit;
    //echo MatrixQuery::select( $mql ); exit;
    //print_r( MatrixQuery::select( $mql ) );
    {
        const db = await ctx.db();

        const request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
        const mql = await request.matrixQueryForSelect(ctx.cms);
        mql.setSlice(0, 1);

        try
        {
            // console.log( JSON.stringify( mql, null, "\t" ) );
            var [rows, fields] = await MQLtoMySQL.select(mql, db);
            // 
            var result = {
                item: rows.length > 0 ? rows[0] : undefined,
                request: request
            };

            return result;
        }
        catch(err)
        {
            console.error(err);
        }
    }

    async update(ctx, columns = undefined) //MatrixQuery::printQuery( $mql );exit;
    //after save
    {
        try
        {
            const db = await ctx.db();
            const request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
            const mql = await request.matrixQueryForUpdate(ctx.cms, columns);

            /*if(ctx.cms.map.before || ctx.cms.map.after) CMSProcedures.setup(ctx.cms.mapName, 
            ctx.cms.map, ctx.cms.path, ctx.cms.ids, await ctx.db(), values);

            if(ctx.cms.map.before && ctx.cms.map.before.save)
            {
                if(Array.isArray(ctx.cms.map.before.save))
                {
                    for(var item of Object.values(ctx.cms.map.before.save))
                    {
                        var procedure = CMS.procedures(item);
                        CMSProcedures.apply(procedure);
                    }
                }
                else
                {
                    procedure = CMS.procedures(ctx.cms.map.before.save);
                    CMSProcedures.apply(procedure);
                }
            }*/

            // console.log(util.inspect(mql, false, null, true));
            const [ids, results] = await MQLtoMySQL.update(mql, db);
            ctx.cms.ids = ids;

            /*if(ctx.cms.map.after && ctx.cms.map.after.save)
            {
                if(Array.isArray(ctx.cms.map.after.save))
                {
                    for(var item of Object.values(ctx.cms.map.after.save))
                    {
                        procedure = CMS.procedures(item);
                        CMSProcedures.apply(procedure);
                    }
                }
                else
                {
                    procedure = CMS.procedures(ctx.cms.map.after.save);
                    CMSProcedures.apply(procedure);
                }
            }*/

            return {
                ids: ctx.cms.ids,
                request: request
            };
        }
        catch(err)
        {
            console.error(err);
            return null;
        }
    }

    async validation(ctx, fullValidation = true) 
    //CMSValidation::setup( $ctx.cms.mapName, $ctx.cms.map, $ctx.cms.path, $ctx.cms.ids, $this->db );
    {
        const db = await ctx.db();
        var request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
        ctx.cms.request = request;
        var validation = {};
        var columns = request.columnsName;

        for(var kcol of Object.values(columns))
        {
            var result;

            try
            {
                result = await request.column(kcol).field.validate(ctx.cms, fullValidation);
            }
            catch(err)
            {
                console.log(err);
                result = { message: "There is when validating column \'" + kcol + "\'" };
            }
            
            if(result != null && result) validation[kcol] = result;
        }

        var rsearch = request.search;

        if(ctx.cms.search) //print_r( $values );
        {
            columns = rsearch.columnsName;

            for(var kcol of Object.values(columns))
            {
                result = rsearch.column(kcol).field.validate(ctx.cms, fullValidation);
                if(result != undefined && result) validation[kcol] = result;
            }
        }

        if(validation.length == 0)
        {
            if(ctx.cms.map.validation)
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
                    else 
                    {
                        result = CMSValidate(key, this.ctx.cms.mapName, this.ctx.cms.map, this.ctx.cms.path, this.ctx.cms.ids, await ctx.db(), this.fieldName, this, value, rule);
                    }

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

        return {
            request: request,
            validation: validation
        };
    }

};
