var regex = /^[^0-9][a-zA-Z0-9_-]+([.][a-zA-Z0-9_-]+)*[@][a-zA-Z0-9_-]+([.][a-zA-Z0-9_-]+)*[.][a-zA-Z]{2,4}$/;

module.exports = function (cms, fieldName, value, rule, db)
{
    return regex.exec(value) !== 0;
}
