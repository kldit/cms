/**
 * @author Orlando Leite
 *
 * EditContent class
 */

//That is not an db update. It updates the fields, just like in
//validation, except for validation
//public function
const CMS = require.main.require('./kldit/lib/CMS');

module.exports = class EditContent extends CMS
{
    constructor(context)
    {
        super(context);
    }

    init()
    {
        super.init();

        this.loadModel("Edit");
        // 	this.loadModel("Access");
        // this.loadModel("Util");
    }

    prepare(ctx)
    {
        ctx.cms.post = ctx.cms.values = {};

        var vars = Object.clone(ctx.uri.vars);
        
        var path = vars.shift();
        path = path.replace(/-/g, "_");
        
        path = path.split(",");
        ctx.cms.currentTable = Object.clone(path);
        var mapName = ctx.cms.mapName = path.shift();
        
        ctx.cms.rawMapId = vars.length ? vars.shift() : "";
        
        ctx.cms.ids = CMS.parseMapId(ctx.cms.rawMapId.split("&"), mapName);
        //console.log( mapName, CMS.config );
        
        ctx.cms.layout = CMS.config[mapName].layout;
        ctx.cms.path = path;

        if(path.length > 0)
        {
            var field = path[path.length - 1];
            fields = page.subpages[field].list.fields;
            ctx.cms.fields = fields;

            ctx.cms.map = CMS.config[mapName].map;
            ctx.cms.page = CMS.config[mapName].page;
            ctx.cms.submap = ctx.cms.map.fields[field];
            ctx.cms.subpage = ctx.cms.page.subpages[field];
        }
        else
        {
            ctx.cms.map = CMS.config[mapName].map;
            ctx.cms.page = CMS.config[mapName].page;
        }
    }

    async index(ctx)
    {
        this.prepare(ctx);
        ctx.cms.operation = "edit";
        //var access = this.model.access.check("get", mapName, map, path, ids);

        if(false && access.length > 0)
        {
            ctx.cms.invalidFields = access;
            ctx.cms.success = false;
        }
        else
        {
            var result = await this.model.edit.get(ctx);
            // CMS.addGlobalValue("POST", result.item);
            ctx.cms.post = ctx.cms.values = result.item;
            ctx.cms.request = result.request;
            ctx.cms.mapId = ctx.cms.ids;
            ctx.cms.success = true;
        }

        if(ctx.cms.success)
            ctx.body = await this.renderView("Edit", ctx.cms);
        else
            ctx.body = await this.renderView("ValidationError", ctx.cms);
    }

    async validate(ctx)
    {
        this.prepare(ctx);

        ctx.cms.operation = "validate";
        ctx.cms.values = {};
        
        if( ctx.request.body.__form__ )
        {
            ctx.cms.form = JSON.parse(ctx.request.body.__form__);
            delete ctx.request.body.__form__;
        }
        
        ctx.cms.post = ctx.cms.values = ctx.request.body;

        var result = await this.model.edit.validation(ctx, false);

        var updates = [];
        var temp = Object.keys(ctx.request.body);
        var request = result.request;

        for(var name of Object.values(temp))
        {
            var column = request.column(name);

            if(column)
            {
                var list = column.field.validationUpdates();
                updates.push(name);
                updates = updates.concat(list);
            }
        }
        
        var rsearch = request.search;

        if(rsearch)
        {
            for(var name of Object.values(temp))
            {
                column = rsearch.column(name);

                if(column)
                {
                    list = column.field.validationUpdates();
                    updates.push(name);
                    updates = updates.concat(list);
                }
            }
        }

        ctx.cms.updates = updates;
        ctx.cms.validation = result.validation;
        ctx.cms.request = result.request;

        ctx.body = await this.renderView("EditUpdate", ctx.cms);
    }

    // That is not an db update. It updates the fields, just like in 
    // validation, except for validation
    // TODO: Foget to mention when this is used.
    async updateForm(ctx) //$this->viewVars['validation'] = $result['validation'];
    {
        this.prepare(ctx);

        ctx.cms.operation = "update-form";
        ctx.cms.values = {};
        ctx.cms.form = JSON.parse(ctx.request.body.__form__);
        delete ctx.request.body.__form__;
        ctx.cms.post = ctx.request.body;

        // throw new Error('YOU CALLED update-form! Nice!');

        var result = this.model.edit.validation(ctx, false);
        var updates = [];
        var temp = Object.keys(ctx.request.body);
        var request = result.request;

        for(var name of Object.values(temp))
        {
            var column = request.column(name);

            if(column)
            {
                var list = column.field.validationUpdates();
                updates.push(name);
                updates = array_merge(updates, list);
            }
        }

        ctx.cms.updates = updates;
        ctx.cms.request = result.request;
        ctx.body = await this.renderView("EditUpdate", this.viewVars);
    }

    async save(ctx)
    {
        this.prepare(ctx);

        ctx.cms.operation = "update";
        ctx.cms.fastEdit = false;
        
        ctx.cms.mapId = ctx.cms.ids;
        // console.log( ctx.request.body );
        ctx.cms.post = ctx.cms.values = ctx.request.body;
        
        var result = await this.model.edit.validation(ctx);
        ctx.cms.invalidFields = {};

        if(Object.keys(result.validation).length > 0)
        {
            ctx.cms.invalidFields = result.validation;
            ctx.cms.success = false;
        }
        else
        {
            result = await this.model.edit.get(ctx);
            ctx.cms.currentValues = result.item;
            // CMS.addGlobalValue("CURRENT_VALUES", result.item);
            var update = await this.model.edit.update(ctx);
            // console.log( update );
            if( update ) ctx.cms.success = true;
        }

        if(ctx.cms.success)
            ctx.body = await this.renderView("EditResult", ctx.cms);
        else
        {
            ctx.cms.updates = true;
            ctx.cms.validation = result.validation;
            ctx.cms.request = result.request;
            ctx.cms.error = true;
            // console.log( ctx.cms.updates );
            ctx.body = await this.renderView("EditUpdate", ctx.cms);
        }
    }

    async fastSave(vars)
    {
        this.prepare(vars, mapName, path, ids, fields, map, page);
        ctx.cms.operation = "fast-save";
        vars.shift();
        vars.shift();
        var values = this.parseSlashGet(vars, Array());

        for(var field in values)
        {
            var v = values[field];
            if(!(-1 !== page["fast-edit"].fields.indexOf(field))) delete values[field];
        }

        var result = this.model.edit.validation(ctx);
        ctx.cms.fastEdit = true;
        ctx.cms.mapId = ids;
        ctx.cms.values = values;
        ctx.cms.invalidFields = [];

        if(result.validation.length > 0)
        {
            ctx.cms.invalidFields = result.validation;
            ctx.cms.success = false;
        }
        else //print_r( $values );exit;
        {
            result = this.model.edit.get(mapName, map, path, ids);
            CMS.addGlobalValue("CURRENT_VALUES", result.item);
            var columns = Object.keys(values);
            var rupdate = this.model.edit.update(mapName, map, path, ids, values, columns);
            ctx.cms.request = rupdate.request;
            ctx.cms.success = true;
            result = this.model.edit.get(mapName, map, path, ids);
            ctx.cms.values = result.item;
        }

        if(ctx.cms.success) 
        {
            ctx.body = await this.renderView("EditResult", this.viewVars);
        }
        else
        {
            ctx.cms.updates = true;
            ctx.cms.validation = result.validation;
            ctx.cms.request = result.request;
            ctx.cms.error = true;
            ctx.body = await this.renderView("EditUpdate", this.viewVars);
        }
    }
};
