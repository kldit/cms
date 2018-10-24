/**
 * @author Orlando Leite
 *
 * Library class
 */
 
//ListContent could be just List, but it's a reserved word
const CMS = require.main.require('./kldit/lib/CMS');
const util = require.main.require('./kldit/lib/util');
const fs = require('fs');

module.exports = class Library extends CMS
{
    constructor(context)
    {
        super(context);
    }

    alist() //$types = @$_POST['types'];
    //		
    //		// GET FILES IN FOLDER //
    //		
    //		$this->viewVars['list'] = $this->listfiles( $this->libpath, $types );
    //		$this->renderView( 'LibraryList', $this->viewVars );
    //		//global $result;
    //$result->path = substr( $this->libpath, strlen( $upload_folder ) );
    //$result->list = $fileResult;
    //$UpCMS->dispatchEvent( new Event( UpCMS::FILEGALLERY_AFTER_ALIST, $this ) );
    {}

    delete()
    {
        var files = _POST.filenames;

        for(var file of Object.values(files))
        {
            var filePath = Library.LIB_PATH + "/" + file;

            if(is_file(filePath))
            {
                var fileResult = unlink(filePath);

                if(is_file(Library.LIB_PATH + "/" + file))
                {
                    this.dispatchError(52105, "O Arquivo '" + _POST.filename + "' n\xE3o pode ser apagado, verifique as permiss\xF5es.");
                }
                else
                {
                    this.viewVars.result = filePath.substr(STORAGE_PATH.length);
                    this.renderView("LibraryResult", this.viewVars);
                }
            }
            else
            {
                this.dispatchError(52104, "O Arquivo '" + file + "' não existe.");
            }
        }
    }

    rename()
    {
        var filePath = Library.LIB_PATH + "/" + _POST.filename;

        if(is_file(filePath))
        {
            var newFilePath = Library.LIB_PATH + "/" + _POST.newfilename;

            if(is_file(newFilePath))
            {
                this.dispatchError(52106, "J\xE1 existe um arquivo com o nome '" + _POST.filename + "'.");
            }
            else
            {
                var fileResult = rename(filePath, newFilePath);

                if(!is_file(newFilePath))
                {
                    this.dispatchError(52107, "O Arquivo '" + _POST.filename + "' n\xE3o pode ser renomeado, verifique as permiss\xF5es.");
                }
                else
                {
                    this.viewVars.result = newFilePath.substr(STORAGE_PATH.length);
                    this.renderView("LibraryResult", this.viewVars);
                }
            }
        }
        else
        {
            this.dispatchError(52104, "O Arquivo '" + _POST.filename + "' n\xE3o existe.");
        }
    }

    async index(ctx)
    {
        var vars = ctx.uri.vars;
        var path = vars.splice(0, 1)[0];
        path = path.replace(/-/g, '_');
        path = path.split(/,/g);
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

        }
    }

    async upload(ctx) //print_r( $targetPath );
    {
        var targetPath = Library.userLibrary(ctx.cms);
        // console.log( targetPath );
        ctx.cms.result = [];
        let error;

        for(var file of Object.values(ctx.request.files))
        {
            var i = 1;
            var curname = Library.basename(Library.nonOverwritePath(targetPath + Library.basename(file.name)));
            var filePath = targetPath + curname;
            // console.log( filePath );
            fs.renameSync(file.path, filePath);

            if(!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile())
            {
                throw new Error("O Arquivo '" + file.name + "' não pode ser salvo, verifique as permissões.");
            }
            else
            {
                ctx.cms.result.push(
                {
                    name: filePath.substr(targetPath.length),
                    path: curname
                });
            }
        }

        ctx.body = {}
        if( error )
        {
            ctx.body.status = false; 
            ctx.body.error_number = error;
        }
        else
        {
            ctx.body.status = true;
            ctx.body.result = ctx.cms.result;
        }
    }

    decompress()
    {
        var file = _POST.file;
        var filePath = filePath + "/" + file;

        if(is_file(filePath))
        {
            var ext = end(file.split(/./g));
            load_lib_file("cms/compression");
            if(ext.toLowerCase() == "zip") var files = decompress_zip(filePath, Library.LIB_PATH);

            if(files != undefined)
            {
                this.viewVars.result = files;
                this.renderView("LibraryResult", this.viewVars);
            }
            else
            {
                this.dispatchError(52109, "N\xE3o foi poss\xEDvel extrair nenhum arquivo de '" + _POST.file + "'. Verifique se o arquivo zip n\xE3o est\xE1 corrompido e as permiss\xF5es de pasta no servidor.");
            }
        }
    }

    dispatchError(errorNumber, errorText)
    {
        this.viewVars.error = errorNumber;
        this.viewVars.result = errorText;
        this.renderView("LibraryResult", this.viewVars);
        throw die();
    }

    init()
    {
        super.init();

        Library.LIB_PATH = process.env.STORAGE_PATH + "/library/";
        // console.log( Library.LIB_PATH );
        
        
        if(!fs.existsSync(process.env.STORAGE_PATH) || !fs.lstatSync(process.env.STORAGE_PATH).isDirectory())
        {
            throw new Error("Pasta de arquivos não existe ou está configurada corretamente.");
            // this.dispatchError(52101, "Pasta de arquivos não existe ou está configurada corretamente.");
        }
        else if(!fs.existsSync(Library.LIB_PATH) || !fs.lstatSync(Library.LIB_PATH).isDirectory())
        {
            fs.mkdirSync(Library.LIB_PATH);

            if(!fs.existsSync(Library.LIB_PATH) || !fs.lstatSync(Library.LIB_PATH).isDirectory())
            {
                throw new Error("Não foi possível criar a pasta 'library'. Verifique as permissões da pasta de arquivos.");
                //this.dispatchError(52102, );
            }
        }
    }

    static userLibrary(cms)
    {
        let userpath = "user" + cms.user.id + "/";
        let libpath = Library.LIB_PATH + userpath;

        if(!fs.existsSync(libpath) || !fs.lstatSync(libpath).isDirectory())
        {
            fs.mkdirSync(libpath);

            if(!fs.existsSync(libpath) || !fs.lstatSync(libpath).isDirectory())
            {
                throw new Error("Não foi possível criar a pasta 'library/" + userpath + "'. Verifique as permissões da pasta de arquivos.");
                //this.renderView("LibraryResult", this.viewVars);
                // throw die();
            }
        }

        return libpath;
    }

    static listfiles(path, exts)
    {
        var handle;
        var result = Array();
        if(!is_dir(path)) return undefined;

        if(handle = opendir(path))
        {
            if(exts != undefined && exts[0] == "!")
            {
                var file;

                while(false !== (file = readdir(handle)))
                {
                    var explode = explode(".", file);
                    var ext = end(explode);

                    if(strpos(file, ".") !== 0 && (exts == ";" || strpos(exts, ext) === false || strpos(exts, file) === false))
                    {
                        var t = {
                            name: file,
                            path: (substr ? path.substr(upload_folder.length) : path) + "/" + file,
                            type: is_dir(path + "/" + file) ? "dir" : "file"
                        };
                        result.push(t);
                    }
                }
            }
            else
            {
                while(false !== (file = readdir(handle)))
                {
                    explode = explode(".", file);
                    ext = end(explode);

                    if(strpos(file, ".") !== 0)
                    {
                        t = {
                            name: file,
                            path: path.substr(STORAGE_PATH.length) + file,
                            type: is_dir(path + "/" + file) ? "dir" : "file"
                        };
                        result.push(t);
                    }
                }
            }

            closedir(handle);
        }

        return result;
    }

    static basename(path)
    {
        let temp = path.split(/\//g);
        return temp[temp.length - 1];
    }

    static nonOverwritePath(path)
    {
        var i = 1;
        var t = path.substr(path.length - 2);
        // console.log( "t: " + t );
        if(t == "/" || t == "\\") path = path.substr(0, path.length - 2);

        t = path.split(/\//g);
        t.pop();

        var p = t.join("/");
        var filename = "/" + Library.basename(path);

        var curname = filename;
        t = filename.split(/\./g);
        var ext = t.length > 1 ? t.pop() : "";
        filename = t.join(".");

        let name = p + curname;
        if( fs.existsSync( name ) )
        {
            do
            {
                curname = filename + "_" + i;
                curname += "." + ext;
                i++;

                name = p + curname;
            }
            while( fs.existsSync( name ) );
        }

        return curname;
    }

};
