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
    var vals = undefined !== cms.validation ? Object.keys(cms.validation) : [];

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
        // console.log( vals, col );
        if(vals.indexOf(col) !== -1)
        {
            if(result) objectReplace(result, cms.validation[col]);
            delete validation[col];
        }
    };

    var results = {};
    var values = [];

    // var layout = CMS.config[cms.mapName][l];
    // // console.log( cms );
    // for(var obj of Object.values(layout))
    // {
    // 	await LayoutObject.update(results, cms.updates, obj, cms, fieldHandler);
    // }

    if(cms.map.search)
    {
        {
            let _tmp_1 = cms.map.search;

            for(var key in _tmp_1)
            {
                var obj = _tmp_1[key];
                var temp = {};
                temp.target = key;
                temp.type = "field";
                await LayoutObject.update(results, cms.updates, temp, cms, fieldHandler);
            }
        }
    }

    for(var key in validation)
    {
        var val = validation[key];
        results[key] = val;
    }

    json.updates = results;

    return json;
}
