const CMS = require.main.require('./kldit/lib/CMS');
const util = require.main.require('./kldit/lib/util');
const LayoutObject = require.main.require('./kldit/lib/LayoutObject');

module.exports = async function (cms)
{
    var ctPath = cms.currentTable.join(",");
    var json = {
        title: util.renderJsLine(cms.page.edit.title, cms),
        toolbar: [],
        "modal-params": cms.page.edit["modal-params"],
        optsbar: [],
        container: []
    };
    var form = {
        type: "form",
        action: "edit-content/save/" + ctPath + "/" + cms.rawMapId,
        method: "post",
        buttons:
        {
            submit:
            {
                position: "toolbar",
                title: cms.page.edit["submit-button-name"] ? cms.page.edit["submit-button-name"] : "Salvar",
                class: "btn-primary"
            },
            cancel:
            {
                position: "toolbar",
                title: "Cancelar",
                class: "btn-default"
            }
        },
        subs: []
    };

    if(cms.page.edit.readonly)
    {
        delete form.buttons.submit;
        form.readonly = true;
        form.buttons.cancel.title = "Fechar";
    }

    if(cms.page.edit.action)
    {
        form.action = util.renderJsLine(cms.page.edit.action, cms);
    }

    var edit = cms.page.edit;
    var l = edit.layout ? edit.layout : 'layout';
    
    var layout = CMS.config[cms.mapName][l];
    for(var obj of layout)
    {
        form.subs.push(await LayoutObject.create(obj, cms));
    }
    
    json.container.push(form);

    return json;
}
