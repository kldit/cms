const util = require('@kldit/mvc/lib/util');
const LayoutObject = require('@kldit/cms/lib/LayoutObject');
const CMS = require('@kldit/cms/lib/CMS');

module.exports = async function (cms)
{
    console.log(cms.currentTable);
    var ctPath = cms.currentTable.join(",");
    var json = {
        title: cms.page.add.title,
        toolbar: [],
        "modal-params": cms.page.add["modal-params"],
        optsbar: [],
        container: []
    };
    var form = {
        type: "form",
        action: "add-content/save/" + (ctPath ? (ctPath + "/" + cms.rawMapId) : "" ),
        method: "post",
        buttons:
        {
            submit:
            {
                position: "toolbar",
                title: cms.page.add["submit-button-name"] ? cms.page.add["submit-button-name"] : "Salvar",
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

    if(cms.page.add.action)
    {
        form.action = util.renderJsLine(cms.page.add.action, cms);
    }

    var edit = cms.page.add;
    //load_lib_file("cms/create_view_object");
    var l = edit.layout ? edit.layout : 'layout';
    
    var layout = CMS.config[cms.mapName][l];
    for(var obj of layout)
    {
        form.subs.push( await LayoutObject.create(obj, cms));
    }
    
    json.container.push(form);

    return json;
};
