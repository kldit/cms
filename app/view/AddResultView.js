const util = require.main.require('./kldit/lib/util');

module.exports = function (cms)
{
    var ctPath = cms.currentTable.join(",");
    var json;
    
    if(cms.success)
    {
        json = 
        {
            "action-modal": cms.page.add["redirect-after-submit"] ? util.renderJsLine(cms.page.add["redirect-after-submit"], cms) : "nothing",
            "action-page": cms.page.add["redirect-after-submit"] ? util.renderJsLine(cms.page.add["redirect-after-submit"], cms) : "nothing"
        };

        if(cms.page.add.message.save || cms.page.add.message.save === false)
        {
            if(cms.page.add.message.save !== false)
            {
                json.message = 
                {
                    text: cms.page.add.message.save,
                    type: "success"
                };
            }
        }
        else
        {
            json.message = 
            {
                text: "Adicionado com sucesso.",
                type: "success"
            };
        }
    }
    else
    {
        json = 
        {
            "action-popup": "nothing",
            "action-page": "nothing",
            message:
            {
                type: "error"
            },
            updates: cms.invalidFields
        };

        if(cms.page.add.message.validation)
        {
            switch(cms.page.add.message.validation)
            {
            case "first-invalid-field":
                var invalid = reset(cms.invalidFields);
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
