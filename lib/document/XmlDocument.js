const util = require('util');

module.exports = function (xml)
{
    function parseValue(str)
    {
        var value = Boolean.parse(str);

        if(value === undefined)
        {
            if(isNaN(value))
            {
                return str;
            }
            else
            {
                return Number(str);
            }
        }
        else
        {
            return value;
        }
    }

    function attrsParser(result, element)
    {
        var attrs = element.attrs();
        for(var i in attrs)
        {
            var attr = attrs[i];
            result[attr.name()] = parseValue(attr.value());
        }

        return result;
    }

    function childrenParser(element, func)
    {
        var children = element.childNodes();
        if(children.length > 0)
        {
            for(var i in children)
            {
                var child = children[i];
                if(child.type() != "comment")
                {
                    func(child);
                }
            }
        }
    }

    function layout(element)
    {
        var target = null;

        if(element.type() != "comment")
        {
            target = {};

            target.type = element.name();
            target = attrsParser(target, element);

            var children = element.childNodes();
            if(children.length > 0)
            {
                target.subs = [];
                childrenParser(element, (child) => target.subs.push(layout(child)));
            }
        }

        return target;
    }

    function map(target, element)
    {
        if(element.type() != "comment")
        {
            if(element.name().endsWith('-list'))
            {
                var name = element.name();
                name = name.substring(0, name.length - 5);
                target[name] = [];
                childrenParser(element, (child) => map(target[name], child));
                // target.updates.push(element.attr("field").value());
            }
            else
            {
                switch (element.name())
                {
                case 'tables':
                    target.tables = {};
                    childrenParser(element, (child) => map(target.tables, child));
                    break;

                case 'update':
                    if(!target.updates) target.updates = [];
                    target.updates.push(element.attr("field").value());
                    break;

                case 'option':
                    if(!target.options) target.options = [];

                    var obj = {};
                    attrsParser(obj, element);
                    target.options.push(obj);
                    break;

                case 'rule':
                    if(!target.rules) target.rules = {};

                    var obj = {};
                    attrsParser(obj, element);
                    target.rules[obj.name] = obj;
                    delete obj.name;
                    break;

                case 'field':
                case 'table':
                    var table = {};
                    attrsParser(table, element);
                    childrenParser(element, (child) => map(table, child));
                    target[table.name] = table;
                    delete table.name;
                    break;

                case 'where':
                    if(!target.where) target.where = {};

                    var column = parseValue(element.attr("target").value());
                    var value = parseValue(element.attr("value").value());
                    var bind = element.attr("bind");

                    if(bind)
                        target.where[column] = [value, bind.value()];
                    else
                        target.where[column] = value;
                    break;

                case 'order':
                    if(!target.order) target.order = {};

                    var column = parseValue(element.attr("target").value());
                    var value = parseValue(element.attr("value").value());
                    target.order[column] = value;
                    break;

                case 'join':
                    if(!target.join) target.join = [];

                    var value = parseValue(element.attr("value").value());
                    target.join.push(value);
                    break;

                case 'group':
                    if(!target.group) target.group = [];

                    var value = parseValue(element.attr("value").value());
                    target.group.push(value);
                    break;

                case 'string':
                    var value = parseValue(element.attr("value").value());
                    target.push(value);
                    break;

                default:
                    var value = {};
                    attrsParser(value, element);
                    childrenParser(element, (child) => map(value, child));

                    if(Array.isArray(target))
                    {
                        value.type = element.name();
                        target.push(value);
                    }
                    else
                    {
                        target[element.name()] = value;
                    }
                    break;
                }
            }
        }

        return target;
    }

    function parser(xml)
    {
        if(doc.name() == "layout")
        {
            var json = [];
            var children = doc.childNodes();
            for(var i in children)
            {
                var child = children[i];
                var t = layout(child);
                if(t !== null) json.push(t);
            }

            return json;
        }
        else if(doc.name() == "map")
        {
            var json = {};
            var children = doc.childNodes();
            for(var i in children)
            {
                json = map(json, children[i]);
            }

            // console.log(util.inspect(json, false, null, true));
            return json;
        }
        else
        {
            return null;
        }
    }


    // parser
    var doc = xml.root();

    return parser(xml);
};
