const CMS = require('@kldit/cms/lib/CMS');
const LayoutObject = require('@kldit/cms/lib/LayoutObject');

module.exports = async function (cms)
{
    var json = {
        "action-page": "update",
        "action-modal": "update",
        updates: []
    };

    if(cms.error)
    {
        json.message = { type: "error" };

        if(cms.page.edit.message.validation)
        {
            switch(cms.page.edit.message.validation)
            {
            case "first-invalid-field":
                // console.log( "fixed: " + Object.keys(cms.validation) );
                var invalid = cms.validation[Object.keys(cms.validation)[0]];
                json.message.text = invalid.message;
                break;

            default:
                break;
            }
        }
        else
        {
            if(cms.validation.length == 1)
            {
                var invalid = cms.validation[Object.keys(cms.validation)[0]];
                json.message.text = invalid.message;
            }
            else
            {
                json.message.text = "Por favor, verifique os campos e tente novamente.";
            }
        }
    }

    var columns = cms.request.visibleColumnsName;
    var vals = cms.validation !== undefined ? Object.keys(cms.validation) : [];
    
    function objectReplace(obj, list)
    {
        for(var key in list)
        {
            var val = list[key];
            obj[key] = val;
        }

        return obj;
    };

    var edit = cms.page.edit;
    var l = edit.layout ? edit.layout : 'layout';
    var validation = undefined !== cms.validation ? cms.validation : {};
    
    var fieldHandler = (col, result) =>
    {
        // console.log( "teste: " + cms.updates );
        if(vals.indexOf(col) !== -1 )
        {
            if(result) objectReplace(result, cms.validation[col]);
            delete validation[col];
        }
        /*else if( cms.updates.indexOf(col) !== -1 ) // cms.updates is true
        {
            if(result) validation[col] = result;
            //if(result) objectReplace(result, cms.validation[col]);
            //delete validation[col];
        }*/
    };

    var results = {};
    var values = [];

    var layout = CMS.config[cms.mapName][l];
    
    for(var obj of Object.values(layout))
    {
        await LayoutObject.update(results, cms.updates, obj, cms, fieldHandler);
    }
    
    if(cms.searching && cms.map.search)
    {
        {
            let tmp = cms.map.search;

            for(var key in tmp)
            {
                var obj = tmp[key];
                var temp = {};
                temp.target = key;
                temp.type = "field";
                await LayoutObject.update(results, cms.updates, temp, cms, fieldHandler);
            }
        }
    }

    // console.log( validation );
    for(var key in validation)
    {
        var val = validation[key];
        results[key] = val;
    }

    json.updates = results;

    return json;
}
