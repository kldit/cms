const util = require('@kldit/mvc/lib/util');
const LayoutObject = require('@kldit/cms/lib/LayoutObject');
const CMS = require('@kldit/cms/lib/CMS');

module.exports = async function (cms)
{
    function setOrder(temp, column)
    {
        temp = Object.clone( temp );
        temp.order[1] = temp.order[0] == column ? (temp.order[1] == 'asc' ? 'desc' : 'asc') : 'asc';
        temp.order[0] = column;
        // print_r( temp );
        return temp;
    }

    function createSlashGet(vars)
    {
        var str = '',
            glue = '';
        for(var key in vars)
        {
            var value = vars[key];

            if(Array.isArray(value)) value = value.join(',');

            str += glue + key + '/' + value;
            glue = '/';
        }

        return str;
    }

    var baseUrl, orderUrlLink;
    baseUrl = orderUrlLink = 'page://list-content/' + cms.currentPath + cms.currentTable + '/';

    // console.log( cms.page.list );
    var json = {
        'title': cms.page.list.title,
        'toolbar': {},
        'optsbar': [],
        'container': []
    };

    if(cms.page.list.toolbar)
    {
        var layout = CMS.config[cms.mapName][cms.page.list.toolbar];
        for(var i in layout)
        {
            var obj = layout[i];
            json.toolbar[i] = await LayoutObject.create(obj, cms);
        }
    }

    if(cms.page.list.search)
    {
        json.toolbar.search = 
        {
            'type': 'search-form',
            'action': 'list-content/search/' + cms.currentTable + '/',
            'method': 'get-slash',
            'subs':
            {
                'value':
                {
                    'type': 'simpletext',
                    'placeholder': 'Buscar'
                },
                'submit': { 'type': 'submit', 'icon': 'search', 'title': '' }
            }
        };
    }

    var table = 
    {
        'id': 'main-table',
        'type': 'table',
        'class': 'table-striped table-bordered table-hover dataTable',
        'target': cms.currentTable,
        'columns': [],
        'rows': [],

        'group-by': cms.page.list['group-by'],

        'mode': cms.page.list.type
    };

    if(cms.options.order)
    {
        cms.options.order[0] = cms.options.order[0].toLowerCase();
        cms.options.order[1] = cms.options.order[1].toLowerCase();
    }
    else
    {
        cms.options.order = ['id', 'asc'];
    }

    if(cms.page.list.showid == true)
    {
        table['show-id'] = {};

        if(cms.page.list['allow-custom-order'] === null || cms.page.list['allow-custom-order'] == true)
        {
            temp = setOrder(cms.options, 'id');
            // console.log( temp );
            var orderTableIcon = cms.options['order'][0] == 'id' ? 'sorting_' + temp['order'][1] : 'sorting';

            table['show-id']['url'] = cms.baseUrl + createSlashGet(temp);
            table['show-id']['icon'] = orderTableIcon;
        }
    }

    if(cms.page.list.addable)
    {
        table['add-btn'] = {
            'icon': 'pencil',
            'url': cms.page.list['add-link'] != null ?
                cms.page.list['add-link'] : cms.page.list['open-add-as'] + '://add-content/' + cms.currentTable,
            'name': cms.page.list['add-name'] ? cms.page.list['add-name'] : "Adicionar"
        };
    }

    if(cms.page.list.removable)
    {
        table['remove-btn'] = {
            'icon': 'remove',
            'url': 'delete-content/' + cms.currentTable,
            'method': 'post-ids',
            'name': cms.page.list['remove-name'] ? cms.page.list['remove-name'] : "Remover"
        };
    }

    var ths = [];
    for(var key in cms.page.list.fields)
    {
        var config = cms.page.list.fields[key];
        var item = cms.map.fields[key];
        if(typeof cms.page.list.fields[key].visible == 'undefined' || 
            util.renderJsLine(cms.page.list.fields[key].visible, cms) == 'visible'
        )
        {
            var th = {
                'key': key,
                'title': util.renderJsLine( item.title, cms ),
                'size': config.size,
                'align': config.align
            };

            if(cms.page.list['allow-custom-order'] === null || cms.page.list['allow-custom-order'] == true)
            {
                temp = setOrder(cms.options, key);
                orderTableIcon = cms.options.order[0] == key ? 'sorting_' + temp['order'][1] : 'sorting';

                th['url'] = baseUrl + createSlashGet(temp);
                th['icon'] = orderTableIcon;
            }

            ths.push(key);
            table.columns.push(th);
        }
    }

    var totalColumns = Object.keys(cms.page.list.fields).length;

    if(!Array.isArray(cms.list))
    {
        // CMS::exitWithMessage('error', 'Error: Invalid generated list');
    }

    var values = cms.values;
    for(var i in cms.list)
    {
        var line = cms.list[i];
        cms.values = line;
        var row = { 'id': line.id, 'columns': [] };

        if(cms.page.list.editable === null || cms.page.list.editable == true)
        {
            if(cms.page.list['line-click'])
                row.click = util.renderJsLine(cms.page.list['line-click'], cms);
            else
                row.click = cms.page.list['open-edit-as'] + '://edit-content/' + cms.currentTable + '/' + line.id;

            if(cms.page.list['class'])
            {
                row['class'] = cms.page.list['class'];
            }
        }

        for(var i in ths)
        {
            var key = ths[i];
            config = cms.page.list.fields[key];

            var column = cms.request.column(key);
            row.columns.push(await column['field'].listView(line.id, cms));
        }

        if(cms.page.list.appends)
        {
            for(var i in cms.page.list.appends)
            {
                var key = cms.page.list.appends[i];
                var column = request.column(key);
                row.columns.push(await column.field.listView(line.id, cms));
            }
        }

        if(cms.page.list['class'])
        {
            column = request.column(cms.page.list['class']);
            lview = await column['field'].listView(line.id, cms);
            row['class'] = lview.value;
        }

        table.rows.push(row);
    }
    cms.values = values;

    if(cms.page.list.search === true)
    {
        formId = 'search-form-' + Math.floor(Math.random() * 10000);
        json.toolbar.search = {
            'type': 'button',
            'title': '',
            'subtype': 'toggle-id',
            'icon': 'search',
            'toggle': { 'id': formId, 'class': 'show', 'pressed': cms.searching }
        };

        form = {
            'type': 'form',
            'id': formId,
            'class': 'search-form',
            'subtype': 'inline',
            'action': 'list-content/search/' + cms.currentTable,
            'method': 'get-slash',

            'buttons':
            {
                'submit':
                {
                    'position': '#search-form-row',
                    'title': "Filtrar",
                    'class': 'btn-primary ' + cms.mapName + '_search_btn'
                }
            },

            'subs': []
        };

        var row = { 'type': 'row', 'subs': [] };
        var searchLine = { 'id': 'search-form-row', 'type': 'column', 'size-md': 12, 'subs': [] };

        // load_lib_file('cms/create_view_object');
        var bkpRequest = cms.request;
        
        cms.request = cms.request.search;
        var values = cms.values;
        cms.values = cms.search ? cms.search : {};
        
        for(var col in cms.map.search)
        {
            var val = cms.map.search[col];

            var obj = { type: 'field', target: col };
            
            searchLine.subs.push(await LayoutObject.create(obj, cms));
        }
        cms.values = values;

        row.subs.push(searchLine);
        row.subs.push({ 'type': 'horizontal-rule', 'size-md': 12 });

        form.subs.push(row);
        json.container.push(form);
        
        cms.request = bkpRequest;
    }

    json.container.push(table);

    // Pagination
    pagination = {
        'type': 'btn-group',
        'class': 'pull-right',
        'subs': []
    };

    url = 'page://list-content/' + cms.currentTable + '/page/';
    // order = (cms.order[0] != 'id' && order[1] != null) ? 'order/' + order[0].toLowerCase() + ',' + order[1].toLowerCase() : '';
    // console.log(order);

    var total = Math.ceil(cms.totalListRows / cms.limit);
    /* // First button
    if( cms.options['page'] != 1 )
        menu.= '<li><a class="first" href="'.url.'1">'.this.texts['first'].'</a></li>';
    else
        menu.= '<li><a class="first nolink">'.this.texts['first'].'</a></li>';
    */

    var temp = cms.options;
    // Prev button
    var btn = { 'icon': '', 'title': 'Anterior', 'type': 'button' };

    if(cms.options.page != 1 && total > 0)
    {
        temp.page = cms.options.page - 1;
        btn.url = baseUrl + createSlashGet(temp);
    }
    else
        btn['class'] = 'disabled';

    pagination.subs.push(btn);

    // Numbers buttons
    var ttl = cms.options.page + 2;
    for(i = cms.options.page - 2; i <= ttl; i++)
    {
        if(i >= 1 && i <= total)
        {
            btn = {'icon': '', 'title': i, 'type': 'button'};
            if(cms.options['page'] != i)
            {
                temp.page = i;
                btn.url = baseUrl + createSlashGet(temp); //i.'/'.order;
            }
            else
                btn['class'] = 'disabled';

            pagination.subs.push(btn);
        }
    }

    // Next button
    btn = { 'icon': '', 'title': 'Próximo', 'type': 'button' };
    if(cms.options.page < total)
    {
        temp.page = cms.options.page + 1;
        btn.url = baseUrl + createSlashGet(temp);
    }
    else
        btn['class'] = 'disabled';
    pagination.subs.push(btn);

    json.optsbar.push( pagination );
    
    return json;

};
