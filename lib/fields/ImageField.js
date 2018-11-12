const SimpletextField = require('@kldit/cms/lib/fields/SimpletextField');
const { MQL, MQLtoMySQL } = require('mql-mysql');
const { util } = require('@kldit/mvc');
const Library = require('@kldit/cms/app/controller/Library');
const fs = require("fs");

module.exports = class ImageField extends SimpletextField
{
    /*getFrom(targetName)
    {
        if(targetName == this.mapName)
        {
            return this.map;
        }
        else
        {
            var from = this.map.reltables[targetName];
            if(from) return from;
            else
            {
                var result = {};
                result.id = "id";
                result.from = targetName;
                result.join = "";
                return result;
            }
        }
    }*/

    async validate(cms, fullValidation = false)
    {
        var file = cms.values[this.fieldName] ? cms.values[this.fieldName].split(",") : [];
        return file[0] == 1 ? super.validate(cms, fullValidation) : undefined;
    }

    insert(cms)
    {
        var file = cms.values[this.fieldName] ? cms.values[this.fieldName].split(",") : [];

        if(file[0] == 1)
        {
            var folder = STORAGE_PATH + "/" + this.field.folder + "/";
            file = file[1];

            if(!is_dir(folder))
            {
                mkdir(folder, 777);

                if(!is_dir(folder))
                {
                    throw new Error("Error: N\xE3o foi poss\xEDvel criar a pasta '" + folder + "'.  Verifique as permiss\xF5es da pasta de arquivos.");
                }
            }

            var oldpath = file.replace("#USER_LIBRARY/", Library.userLibrary(cms)); //USER_LIBRARY_PATH);
            var newpath = file.replace("#USER_LIBRARY/", folder);
            newpath = folder + Library.basename(Library.nonOverwritePath(newpath));
            var path = file.replace("#USER_LIBRARY/", "");
            if(!this.field.upload) fs.renameSync(oldpath, newpath);

            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, path, this, MQL.SET);
        }
    }

    update(cms)
    {
        let file = cms.values[this.fieldName] ? cms.values[this.fieldName].split(",") : [];
        let path;

        if(file[0] == 1)
        {
            let folder = process.env.STORAGE_PATH + "/" + this.field.folder + "/";
            file = file[1];

            if(!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory())
            {
                fs.mkdirSync(folder);

                if(!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory())
                {
                    throw new Error(
                        "Error: Não foi possível criar a pasta '" + folder +
                        "'.  Verifique as permissões da pasta de arquivos.");
                }
            }

            path = file.replace("#USER_LIBRARY/", "");
            var cut = "#USER_LIBRARY".length;
            
            if(file.substr(0, cut) == "#USER_LIBRARY")
            {
                var oldpath = file.replace("#USER_LIBRARY/", Library.userLibrary(cms));// USER_LIBRARY_PATH);
                var newpath = file.replace("#USER_LIBRARY/", folder);
                newpath = folder + Library.basename(Library.nonOverwritePath(newpath));
                if(!this.field.upload)
                {
                    fs.renameSync(oldpath, newpath);
                }
            }
            else //Should delete the old file;
            //unlink( $oldfile );
            {

            }

            // this.request.setColumn(this.cfrom, this.field.column, this.fieldName, path, this, MatrixQuery.SET);
            this.request.setColumn(this.cfrom, this.field.column, this.fieldName, path, this, MQL.SET);
        }
    }

    /*_applyValidations(target)
    {
        if(this.field.validation && this.field.validation.onChange == true)
        {
            if(!target.events) target.events = new stdClass();
            target.events.change = [
                ["validation", "edit-content/validate/" + this.mapName, "post", this.fieldName]
            ];
        }
    }*/

    editView(cms) //$temp->display = @$this->field->display;
    //print_r( util.renderJsLine( $this->field->upload, $values ) );exit;
    {
        var temp = {};
        temp.type = "image";
        temp.id = this.fieldName;
        temp.title = this.field.title;
        temp.help = this.field.help;
        temp.valid = this.field.validate_field;
        temp.value = cms.values[this.fieldName];
        temp.upload = undefined !== this.field.upload ? util.renderJsLine(this.field.upload, cms) : "library/upload/" + this.field.folder;
        if(undefined !== this.field["upload-hash"]) temp["upload-hash"] = this.field["upload-hash"];
        temp.readonly = this.field.readonly;
        temp.options = Array();
        temp["layout-size"] = util.renderJsLine(this.field["edit-layout-size"], cms);

        if(temp.value)
        {
            temp.image = undefined !== this.field.url ? util.renderJsLine(this.field.url, cms) :

                /*
                {
                    value: values[this.fieldName]
                }) : */
            process.env.HOME + "/" + process.env.STORAGE + "/" + this.field.folder + "/" + temp.value;
        }

        this._applyValidations(temp);


        return temp;
    }

    listView(id, values)
    {
        var temp = new stdClass();
        temp.type = "image";
        temp.value = undefined !== this.field.thumb ? util.renderJsLine(this.field.thumb,
        {
            value: values[this.fieldName]
        }) : SERVICE + "slir/w50xh50-c1x1/" + this.field.folder + "/" + values[this.fieldName];
        return temp;
    }

    url(cms, value)
    {
        var temp = value.split(",");
        value = temp[1];

        if(value.indexOf("#USER_LIBRARY/") === 0)
        {
            return value.replace("#USER_LIBRARY/", Library.userLibrary(cms));
        }
        else if(this.field.url) //$path = "https://stage.agendadacidade.com.br/admin-imagem/parceiros/anigifseg_4.gif";
        {
            return util.renderJsLine(this.field.url,
            {
                value: value
            });
        }
        else
        {
            return process.env.STORAGE + "/" + this.field.folder + value;
        }
    }

};
