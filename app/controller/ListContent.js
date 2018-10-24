/**
 * @author Orlando Leite
 *
 * ListContent class
 */

const CMS = require.main.require('./kldit/lib/CMS');
const EditContent = require.main.require('./kldit/base/controller/EditContent');

// ListContent could be just List, but it's a reserved word
module.exports = class ListContent extends CMS
{
    constructor(ctx)
    {
        super(ctx);
    }

    init()
    {
        super.init();

        this.loadModel('List');
        //this.loadModel( 'Access' );
        //this.loadModel( 'Util' );

        //this.searching = false;
    }

    async index(ctx)
    {
        var vars = ctx.uri.vars;
        var path = vars.splice(0, 1)[0];
        path = path.replace(/-/g, '_');
        path = path.split(',');
        // console.log( path );
        ctx.cms.path = path;
        ctx.cms.values = {};
        ctx.cms.operation = "list";
        ctx.cms.currentTable = path.join(',');
        ctx.cms.currentPath = 'search/';

        var mapName = path.shift();
        ctx.cms.mapName = mapName;
        // ctx.cms.searching = false;
        ctx.cms.ids = null;

        if(path.length > 0)
        {
            /*ids = parseMapId( vars.shift() );//, default );
            
            var field = path[path.length - 1];
            ctx.fields = page.subpages[field].list.fields;
            var subfie = page.subpages[field].list.appends;
            if( subfie ) fields = fields.concat( subfie );
            
            map = this.config['map'].get(mapName);
            page = this.config['pages'].get(mapName);
            
            ctx.cms.viewVars['submap'] = &map.fields.{field};
            ctx.cms.viewVars['subpage'] = page.subpages.{field};*/
        }
        else
        {
            if(CMS.config[mapName])
            {
                ctx.cms.map = CMS.config[mapName].map;
                ctx.cms.page = CMS.config[mapName].page;

                ctx.cms.info = ctx.cms.page.list.fields;
                ctx.cms.fields = Object.keys(ctx.cms.info);
            }
            else
            {
                ctx.body = { status: false, error: 404 };
                return;
            }


            //subfie = ctx.page.subpages[field].list.appends;
            /*if( subfie ) fields = array_merge( fields, subfie );*/
        }

        ctx.cms.opt = { page: 1 };
        if(ctx.cms.page.list.order)
        {
            ctx.cms.opt.order = ctx.cms.page.list.order;
        }

        ctx.cms.options = CMS.parseSlashGet(vars, ctx.cms.opt);

        if(ctx.cms.searching)
        {
            if(!ctx.cms.search) ctx.cms.search = {};

            if(ctx.cms.map.search)
            {
                for(var k in ctx.cms.map.search)
                {
                    if(ctx.cms.options[k]) ctx.cms.search[k] = ctx.cms.options[k];
                }
            }

            ctx.cms.post = ctx.request.body;
            //CMS.globalValue( ctx ).set( 'POST', post );
        }

        // CMS::addGlobalValue( 'OPTIONS', options );

        var access = []; //this.model.access.check( 'list', mapName, map, path, ids );

        if(access.length > 0)
        {
            ctx.cms.viewVars['invalidFields'] = access;
            ctx.cms.viewVars['success'] = false;
        }
        else
        {
            ctx.cms.queryPage = ctx.cms.options['page'] - 1;
            ctx.cms.orderBy = ctx.cms.options['order'];
            var result = await this.model.list.search(ctx);

            if(result.error)
            {
                // result.error.code
                // result.error.message
            }
            /*mapName,
                map,
                path, 
                fields,
                ids,
                options['page']-1, 
                options['order'],
                page.list,
                options );
            */
            // ctx.cms.viewVars['search'] = ctx.cms.options;
            /*ctx.cms.viewVars['mapName'] = ctx.cms.mapName;
            ctx.cms.viewVars['totalListRows'] = result['total'];
            
            ctx.cms.viewVars['searching'] = this.searching;
            
            ctx.cms.viewVars['page'] = ctx.cms.page;
            ctx.cms.viewVars['limit'] = ctx.cms.page.list['page-limit'];
            // ctx.cms.viewVars['queryPage'] = options['page'];
            ctx.cms.viewVars['options'] = ctx.cms.options;
            ctx.cms.viewVars['map'] = ctx.cms.map;
            */
            ctx.cms.request = result['request'];
            ctx.cms.list = result.list;
            ctx.cms.limit = ctx.cms.page.list['page-limit'];
            ctx.cms.totalListRows = result.total;
            ctx.cms.success = result ? true : false;
            ctx.cms.layout = CMS.config[mapName].layout;
        }

        if(ctx.cms.success)
            ctx.body = await this.renderView('List', ctx.cms);
        else
            ctx.body = await this.renderView('ValidationError', ctx.cms);
    }

    async search(ctx)
    {
        ctx.cms.searching = true;
        await this.index(ctx);
    }

    async searchValidate(ctx)
    {
        // TODO: Find a better way to implement validations.
        // Maybe creating a specfic class, or put all to be done
        // on EditContent. EditContent.prototype.prepare should 
        // avoided for designing reasons.
        EditContent.prototype.prepare.apply(this, [ctx]);
        ctx.cms.searching = true;
        ctx.cms.search = {};
        ctx.cms.values = {};

        if(ctx.request.body.__form__)
        {
            ctx.cms.form = JSON.parse(ctx.request.body.__form__);
            delete ctx.request.body.__form__;
        }

        ctx.cms.post = ctx.cms.updateValues = ctx.cms.values = ctx.request.body;

        var result = await this.model.list.searchValidation(ctx, false);

        var updates = Array();
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

        ctx.body = await this.renderView("ListUpdate", ctx.cms);
    }
}
