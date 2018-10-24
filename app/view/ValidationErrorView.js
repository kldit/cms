module.exports = function (cms)
{
    var json = {
        "action-page": "nothing",
        "action-modal": "nothing",
        message:
        {
            type: "error"
        },
        updates: cms.invalidFields,
        error: true
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
        if(cms.invalidFields.length == 1)
        {
            invalid = cms.invalidFields[Object.keys(cms.invalidFields)[0]];
            json.message.text = invalid.message;
        }
        else
        {
            json.message.text = "Por favor, verifique os campos e tente novamente.";
        }
    }

    return json;
}
