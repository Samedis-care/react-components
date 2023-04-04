var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useCallback, useEffect, useRef } from "react";
import { LazyConnector, useFormContext, } from "../..";
import DefaultConnector from "../../backend-integration/Connector/DefaultConnector";
export var extractLazyCrudConnectorParams = function (data) {
    var getEndpoint = data.getEndpoint, initialId = data.initialId, getConnector = data.getConnector, configureConnector = data.configureConnector, onParentIdChange = data.onParentIdChange, extraParams = data.extraParams, field = data.field, otherProps = __rest(data, ["getEndpoint", "initialId", "getConnector", "configureConnector", "onParentIdChange", "extraParams", "field"]);
    var params = {
        getEndpoint: getEndpoint,
        initialId: initialId,
        getConnector: getConnector,
        configureConnector: configureConnector,
        onParentIdChange: onParentIdChange,
        extraParams: extraParams,
        field: field,
    };
    return [params, otherProps];
};
var useLazyCrudConnector = function (params) {
    var _a;
    // when updating params, also update extractLazyCrudConnectorParams
    var getEndpoint = params.getEndpoint, initialId = params.initialId, getConnectorOverride = params.getConnector, configureConnector = params.configureConnector, onParentIdChange = params.onParentIdChange, extraParams = params.extraParams, field = params.field;
    var _b = useFormContext(), setPostSubmitHandler = _b.setPostSubmitHandler, removePostSubmitHandler = _b.removePostSubmitHandler, setCustomFieldDirty = _b.setCustomFieldDirty, getCustomState = _b.getCustomState, setCustomState = _b.setCustomState, onlySubmitMounted = _b.onlySubmitMounted;
    var getEndpointWrap = useCallback(function (currentId) {
        if (onParentIdChange)
            onParentIdChange(currentId);
        return getEndpoint(currentId);
    }, [onParentIdChange, getEndpoint]);
    var getConnector = (getConnectorOverride !== null && getConnectorOverride !== void 0 ? getConnectorOverride : DefaultConnector.getApi);
    if (!getConnector)
        throw new Error("No default connector set");
    var getConnectorWrap = useCallback(function (endpoint, extraParams) {
        var connector = getConnector(endpoint, extraParams);
        if (configureConnector)
            configureConnector(connector);
        return connector;
    }, [getConnector, configureConnector]);
    var uploadConnector = useRef((_a = getCustomState(field)) !== null && _a !== void 0 ? _a : (function () {
        return new LazyConnector(getConnectorWrap(getEndpointWrap(initialId !== null && initialId !== void 0 ? initialId : "null"), extraParams), initialId === null, function (queue) {
            setCustomFieldDirty(field, queue.length !== 0);
        });
    })());
    // we need to update thee QueueChangeHandler if params changed
    useEffect(function () {
        uploadConnector.current.setQueueChangeHandler(function (queue) {
            setCustomFieldDirty(field, queue.length !== 0);
        });
    }, [setCustomFieldDirty, field]);
    // set post submit handler for lazy connector
    useEffect(function () {
        var connector = uploadConnector.current;
        setCustomState(field, function () { return connector; });
        var submitHandler = function (id) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // update API endpoint and disable fakeReads, then send requests
                connector.realConnector.setApiEndpoint(getEndpointWrap(id));
                connector.fakeReads = false;
                return [2 /*return*/, connector.workQueue()];
            });
        }); };
        setPostSubmitHandler(field, submitHandler);
        return function () {
            if (onlySubmitMounted) {
                removePostSubmitHandler(field);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPostSubmitHandler, onlySubmitMounted]);
    // mark not dirty when unmounted and onlySubmitMounted
    useEffect(function () {
        if (!onlySubmitMounted)
            return;
        return function () {
            setCustomFieldDirty(field, false);
        };
    }, [field, onlySubmitMounted, setCustomFieldDirty]);
    return { connector: uploadConnector.current };
};
export default useLazyCrudConnector;
