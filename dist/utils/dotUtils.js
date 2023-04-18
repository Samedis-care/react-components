/*
utils for object dot notation
what is the dot notation? this is best explained by example:

suppose you have an object:
```js
const a = {
  b: {
    c: {
      d: 1
    }
  }
}
```

now you want to access the number stored in d, in JS you would just do
`a.b.c.d`, but what about dynamic paths? You'd have to write a['b']['c']['d'],
but this of course is limited to a fixed depth. Here's where dot notation and these
utils come in handy. You can simply access the number by calling `getValueByDot("b.c.d", a)`

The following utils are for the conversion of nested objects to dot-notation based records and vice versa
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export var dotToObject = function (field, value) {
    var _a;
    var fieldParts = field.split(".").reverse();
    for (var _i = 0, fieldParts_1 = fieldParts; _i < fieldParts_1.length; _i++) {
        var fieldPart = fieldParts_1[_i];
        value = (_a = {},
            _a[fieldPart] = value,
            _a);
    }
    return value;
};
export var getValueByDot = function (field, data) {
    var fieldParts = field.split(".");
    var value = data;
    for (var i = 0; i < fieldParts.length; ++i) {
        if (typeof value !== "object" || value == null)
            return undefined;
        value = value[fieldParts[i]];
    }
    return value;
};
export var dotInObject = function (field, data) {
    var fieldParts = field.split(".");
    var value = data;
    for (var i = 0; i < fieldParts.length; ++i) {
        if (typeof value !== "object" || value == null)
            return false;
        value = value[fieldParts[i]];
    }
    return true;
};
export var objectToDots = function (obj) {
    var ret = {};
    var _loop_1 = function (key) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            return "continue";
        var value = obj[key];
        if (typeof value === "object") {
            var dots = objectToDots(value);
            Object.entries(dots).forEach(function (_a) {
                var dot = _a[0], nestedValue = _a[1];
                ret[key + "." + dot] = nestedValue;
            });
        }
        else {
            ret[key] = value;
        }
    };
    for (var key in obj) {
        _loop_1(key);
    }
    return ret;
};
export var dotsToObject = function (dots) {
    var result = {};
    var _loop_2 = function (key) {
        if (!Object.prototype.hasOwnProperty.call(dots, key))
            return "continue";
        var parts = key.split(".");
        var insertion = result;
        parts.forEach(function (part, idx) {
            // set value
            if (idx == parts.length - 1) {
                insertion[part] = dots[key];
                return;
            }
            // or create nested object
            if (!(part in insertion)) {
                insertion[part] = {};
            }
            insertion = insertion[part];
        });
    };
    for (var key in dots) {
        _loop_2(key);
    }
    return result;
};
export var dotSet = function (field, value, data) {
    if (typeof value !== "object")
        throw new Error("invalid");
    var fieldParts = field.split(".");
    var ret = __assign({}, value);
    ret[fieldParts[0]] =
        fieldParts.length > 1
            ? dotSet(fieldParts.slice(1).join("."), ret[fieldParts[0]], data)
            : data;
    return ret;
};
