const util = require.main.require('./kldit/lib/util');
const LayoutObject = require.main.require('./kldit/lib/LayoutObject');

module.exports = async function (cms)
{
    var ctPath = cms.currentTable.join(",");

    if(cms.success)
    {
        var json;
        if(cms.fastEdit)
        {
            var action = cms.page["fast-edit"]["redirect-after-submit"] ? 
                util.renderJsLine(cms.page["fast-edit"]["redirect-after-submit"], cms) : 
                "nothing";
                
            json = {
                "action-modal": action,
                "action-page": action
            };

            if(cms.page["fast-edit"].message.save || cms.page["fast-edit"].message.save === false)
            {
                if(cms.page["fast-edit"].message.save !== false)
                {
                    json.message = {
                        text: cms.page["fast-edit"].message.save,
                        type: "success"
                    };
                }
            }
            else
            {
                json.message = {
                    text: "Editado com sucesso.",
                    type: "success"
                };
            }

            if(cms.page["fast-edit"].updates)
            {
                var id = cms.mapId[mapName];
                cms.values.id = id;
                json.updates = [];
                var form = { rows: [{ id: id, columns:[] }] };

                for(var col of Object.values(page["fast-edit"].updates))
                {
                    var column = request.column(col);
                    form.rows[0].columns[col] = await column.field.listView(id, values);
                }

                json.updates["main-table"] = form;
            }
        }
        else
        {
            json = {
                "action-modal": cms.page.edit["redirect-after-submit"] ? util.renderJsLine(cms.page.edit["redirect-after-submit"], cms) : "nothing",
                "action-page": cms.page.edit["redirect-after-submit"] ? util.renderJsLine(cms.page.edit["redirect-after-submit"], cms) : "nothing"
            };

            if(cms.page.edit.message.save || cms.page.edit.message.save === false)
            {
                if(cms.page.edit.message.save !== false)
                {
                    json.message = {
                        text: cms.page.edit.message.save,
                        type: "success"
                    };
                }
            }
            else
            {
                json.message = {
                    text: "Editado com sucesso.",
                    type: "success"
                };
            }
        }
    }
    else
    {
        json = {
            "action-page": "nothing",
            "action-modal": "nothing",
            message:
            {
                type: "error"
            },
            updates: cms.invalidFields
        };

        if(cms.page.edit.message.validation)
        {
            switch(cms.page.edit.message.validation)
            {
            case "first-invalid-field":
                var invalid = cms.invalidFields[Object.keys(cms.invalidFields)[0]];
                json.message.text = invalid.message;
                break;

            default:
                break;
            }
        }
        else
        {
            json.message.text = "Por favor, verifique os campos e tente novamente.";
        }
    }

    return json;
}
