/**
 * @author Orlando Leite
 *
 * AddModel class
 */
//load_lib_file("cms/fields");
//load_lib_file("cms/request");

const { MQL, MQLtoMySQL } = require.main.require('mql-mysql');
const EditModel = require.main.require('./kldit/base/model/EditModel');
const Request = require.main.require('./kldit/lib/Request');

module.exports = class AddModel extends EditModel
{
    constructor(context)
    {
        super(context);
    }

    async create(ctx) //MatrixQuery::printQuery( $mql );
    //exit;
    {
        try
        {
            const db = await ctx.db();
            
            const request = Request.createRequestFromTarget(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db);
            const mql = await request.matrixQueryForInsert(ctx.cms);
            //if(ctx.cms.map.before || ctx.cms.map.after) 
            //	CMSProcedures.setup(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db, ctx.cms.values);
            /*
            if(ctx.cms.map.before && ctx.cms.map.before.create)
            {
                if(Array.isArray(ctx.cms.map.before.create))
                {
                    for(var item of Object.ctx.cms.values(ctx.cms.map.before.create))
                    {
                        var procedure = CMS.procedures(item);
                        CMSProcedures.apply(procedure);
                    }
                }
                else
                {
                    procedure = CMS.procedures(ctx.cms.map.before.create);
                    CMSProcedures.apply(procedure);
                }
            }
            */
            var [ids, results] = await MQLtoMySQL.insert(mql, db);
            
            ctx.cms.ids = ids;
            
            if(ctx.cms.ids.length > 0 && (ctx.cms.map.after && ctx.cms.map.after.create))
            {
                CMSProcedures.setup(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids, db, ctx.cms.values);

                if(Array.isArray(ctx.cms.map.after.create))
                {
                    for(var item of Object.ctx.cms.values(ctx.cms.map.after.create))
                    {
                        procedure = CMS.procedures(item);
                        CMSProcedures.apply(procedure);
                    }
                }
                else
                {
                    procedure = CMS.procedures(ctx.cms.map.after.create);
                    CMSProcedures.apply(procedure);
                }
            }
            
            // TODO: Change exitWithMessage
            if(!ctx.cms.ids[mql.target]) 
                CMS.exitWithMessage("error", "Erro interno do servidor.");
            else 
                return ctx.cms.ids[mql.target];
        }
        catch( err )
        {
            console.error( err );
            return null;
        }
    }

};
