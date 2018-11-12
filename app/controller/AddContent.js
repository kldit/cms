/**
 * @author Orlando Leite
 *
 * AddContent class
**/
const EditContent = require('./EditContent');

module.exports = class AddContent extends EditContent
{
    init()
    {
        super.init();
        this.loadModel("Add");
    }

    async index(ctx)
    {
        this.prepare(ctx);
        ctx.cms.operation = "add";
        var access = []; //this.model.access.check("add", ctx.cms.mapName, map, path, ctx.cms.ids);

        for(var k in ctx.cms.ids)
        {
            var v = ctx.cms.ids[k];
            if(!v) delete ctx.cms.ids[k];
        }

        if(access.length > 0)
        {
            ctx.cms.invalidFields = access;
            ctx.cms.success = false;
        }
        else
        {
            if(ctx.cms.ids[ctx.cms.mapName])
            {
                var result = this.model.edit.get(ctx.cms.mapName, ctx.cms.map, ctx.cms.path, ctx.cms.ids);
                ctx.cms.values = result.item;
                ctx.cms.request = result.request;
            }
            else
            {
                var result = await this.model.add.prepareFields(ctx);

                if(ctx.uri.vars.length > 2)
                {
                    vars.shift();
                    vars.shift();
                    var values = CMS.parseSlashGet(vars);

                    for(var key in values)
                    {
                        var val = values[key];
                        result.values[key] = val;
                    }
                }

                ctx.cms.values = result.values;
                ctx.cms.request = result.request;
            }

            ctx.cms.map_id = ctx.cms.ids;
            ctx.cms.success = true;
        }

        if(ctx.cms.success)
            ctx.body = await this.renderView("Add", ctx.cms);
        else
            ctx.body = await this.renderView("ValidationError", ctx.cms);
    }

    async save(ctx)
    {
        this.prepare(ctx);
        ctx.cms.operation = "create";
        ctx.cms.post = ctx.cms.values = ctx.request.body;
        var result = await this.model.add.validation(ctx);
        
        // console.log( result );
        // var result = this.model.add.validation(ctx.cms.mapName, map, path, ctx.cms.ids, _POST);

        for(var k in ctx.cms.ids)
        {
            var v = ctx.cms.ids[k];
            if(!v) delete ctx.cms.ids[k];
        }

        ctx.cms.mapId = ctx.cms.ids;
        ctx.cms.invalidFields = {};
        // console.log( result ); return;
        
        if(Object.keys(result.validation).length > 0)
        {
            ctx.cms.invalidFields = result.validation;
            ctx.cms.success = false;
        }
        else
        {
            result = await this.model.add.create(ctx);
            ctx.cms.success = true;
            ctx.cms.values = ctx.request.body;
            ctx.cms.values.id = result;
        }

        if(ctx.cms.success)
            ctx.body = await this.renderView("AddResult", ctx.cms);
        else
            ctx.body = await this.renderView("ValidationError", ctx.cms);
    }
};
