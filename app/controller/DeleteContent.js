/**
 * @author Orlando Leite
 *
 * DeleteContent class
 **/

//ListContent could be just List, but it's a reserved word

const CMS = require('@kldit/cms/lib/CMS');

module.exports = class DeleteContent extends CMS
{
    init()
    {
        super.init();
        this.loadModel("Delete");
    }

    async index(ctx)
    {
        var result;
        var vars = ctx.uri.vars; //.replace("-", "_");
        ctx.cms.mapName = vars.shift();
        ctx.cms.map = CMS.config[ctx.cms.mapName].map;
        ctx.cms.page = CMS.config[ctx.cms.mapName].page.delete;

        var removeList;
        if(vars.length)
            ctx.cms.removeList = [vars[0]];
        else
            ctx.cms.removeList = ctx.request.body.ids;

        var removedRows = [];
        var result = {};

        if(ctx.cms.page && ctx.cms.page.type == "update")
        {
            removedRows = await this.model.delete.updateItems(ctx);
        }
        else
        {
            removedRows = await this.model.delete.deleteItems(ctx);
        }

        result["action-page"] = "refresh";
        result["action-modal"] = "nothing";
        result["total-removed-rows"] = removedRows.affectedRows;
        var message = removedRows == 0 ? "Nenhum item foi removido." : removedRows == 1 ? "Item removido com sucesso." : "Itens removidos com sucesso";
        result.message = {
            text: "Item removido",
            type: "warning"
        };
        
        console.log( result );
        ctx.body = result;
    }

};
