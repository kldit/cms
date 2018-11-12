//
//@package model
//@classe home
//
//

const { MQL, MQLtoMySQL } = require('mql-mysql');
const { BaseModel } = require('@kldit/mvc');
const Request = require('@kldit/cms/lib/Request');

module.exports = class DeleteModel extends BaseModel
{
    constructor(context)
    {
        super(context);
    }

    async deleteItems(ctx)
    {
        try
        {
            console.log(ctx.cms.removeList);
            var list = ctx.cms.removeList.join(",");
            ctx.cms.removes = { ids: list };

            /*if(ctx.cms.map.before || ctx.cms.map.after) CMSProcedures.setup(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, Array(), this.db, Array());

            if(ctx.cms.map.before && ctx.cms.map.before.delete)
            {
                var procedure = CMS.procedures(ctx.cms.map.before.delete);
                CMSProcedures.apply(procedure);
            }*/

            ctx.cms.ids = [];
            for(var key in ctx.cms.removeList)
            {
                var id = ctx.cms.removeList[key];
                ctx.cms.ids.push({ id: id });
            }

            /*if(ctx.cms.map.after && ctx.cms.map.after.delete)
            {
                procedure = CMS.procedures(ctx.cms.map.after.delete);
                CMSProcedures.apply(procedure);
            }*/

            const db = await ctx.db();

            // ctx.cms.ids = [];
            return await db.delete(ctx.cms.map.table, ctx.cms.ids);
        }
        catch(err)
        {
            console.log(err);
            return false;
        }
    }

    async updateItems(ctx)
    {
        try
        {
            var columns = {};
            var list = ctx.cms.ids.join(",");
            ctx.cms.removes = { ids: list };

            const db = await ctx.db();

            /*if(ctx.cms.map.before || ctx.cms.map.after) CMSProcedures.setup(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, Array(), this.db, Array());

            if(ctx.cms.map.before && ctx.cms.map.before.delete)
            {
                var procedure = CMS.procedures(ctx.cms.map.before.delete);
                CMSProcedures.apply(procedure);
            }*/

            for(var field in fields)
            {
                var value = fields[field];
                columns[field] = util.renderJsLine(value, cms);
            }

            var result = [];

            for(var key in ctx.cms.ids)
            {
                var id = ctx.cms.ids[key];
                var where = { id: id };
                var [ids, results] = this.db.update(ctx.cms.table, columns, where);

                result.concat(ids);
            }
            /*
            if(ctx.cms.map.after && ctx.cms.map.after.delete)
            {
                procedure = CMS.procedures(ctx.cms.map.after.delete);
                CMSProcedures.apply(procedure);
            }
            */
            return true;
        }
        catch(err)
        {
            console.log(err);
            return false;
        }
    }

};
