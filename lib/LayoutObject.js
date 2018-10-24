const util = require.main.require('./kldit/lib/util');
/**
 * @author Orlando Leite
 *
 * LayoutObject class
 */
module.exports = class LayoutObject
{
    static async create(obj, cms, fieldHandler = undefined)
    {
        if(obj.type == "field")
        {
            var column = cms.request.column(obj.target);

            if(column)
            {
                var result = await column.field.editView(cms);
                if(fieldHandler) result = fieldHandler(result);
                if(obj["size-md"]) result["size-md"] = obj["size-md"];
                if(obj.class) result.class = obj.class;
            }
            else
            {
                var debug;
                result = null;
                //CMS.exitWithMessage("error", "Layout error: Column '" + obj.target + "' was not found", debug = null);
                throw new Error("Error: Column '" + obj.target + "' was not found");
            }

            return result;
        }
        else
        {
            var temp = {};

            for(var key in obj)
            {
                var prop = obj[key];

                if(key == "subs")
                {
                    temp.subs = [];

                    // TODO: Check this
                    for(var subObj of prop)
                    {
                        temp.subs.push(await this.create(subObj, cms, fieldHandler));
                    }
                }
                else
                {
                    temp[key] = util.renderJsLines(prop, cms);
                }
            }

            return temp;
        }
    }

    static async update(results, updates, obj, cms, fieldHandler = undefined)
    {
        if(obj.type == "field")
        {
            if(updates === true || -1 !== updates.indexOf(obj.target))
            {
                var column = cms.request.column(obj.target);
                // console.log( cms.values );
                var result = await column.field.updateEditView(cms);

                if(result)
                {
                    // console.log( fieldHandler );
                    if(fieldHandler) fieldHandler(obj.target, result);
                    results[obj.target] = result;
                }
            }
        }
        else
        {
            var temp = {};
            var subs = undefined;

            for(var key in obj)
            {
                var prop = obj[key];

                if(key == "subs")
                {
                    subs = prop;
                }
                else
                {
                    temp[key] = util.renderJsLines(prop, cms);
                }
            }

            if(temp.id)
            {
                if(updates === true || -1 !== updates.indexOf(temp.id)) results[temp.id] = temp;
            }

            if(subs != undefined)
            {
                for(var subObj of Object.values(subs))
                {
                    await this.update(results, updates, subObj, cms, fieldHandler);
                    //results, updates, subObj, cms.request, cms.values, fieldHandler);
                }
            }
        }
    }
}
