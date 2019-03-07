"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint no-unused-vars: ["error", { "args": "none" }] */
var lodash_es_1 = require("lodash-es");
var s3_validations_js_1 = require("./s3-validations.js");
var randomWord = __importStar(require("random-word"));
var Randoma = __importStar(require("randoma"));
/*
 * @todo Need a way to bootstrap an S3Bucket Object based on existin template.
 *  - based on string
 *  - based on file buffer?
 *  - based on URL?
 *  - based on S3 location?
 *
 * All of the above make it more useful to update my tamplates once they are already out there...
 * Once I go with autoGen'd logical-names I have to stick with them, so that creates a point of great utility.
 *
 */
var S3Bucket = /** @class */ (function () {
    /**
     * S3Bucket Class that models info needed for Cloudformation.
     *
     * @description S3 Object maker
     * @example
     *  // #! node myExample.js
     *  var ImportESM = require('esm')(module)
     *  var S3Bucket = ImportESM('./src/s3/bucket.js')
     *  var myBucket = new S3Bucket()
     *  console.log({myBucket})
     */
    function S3Bucket(props, name) {
        if (props === void 0) { props = {}; }
        if (name === void 0) { name = ''; }
        this.Type = 'AWS::S3::Bucket';
        this.name = "arn:aws:s3:::" + randomWord() + "-" + randomWord() + "-" + new Randoma({
            seed: new Date().getTime()
        }).integer();
        this.Properties = __assign({}, props);
    }
    S3Bucket.prototype.website = function (config) {
        if (config) {
            var AccessControl = 'PublicRead';
            var WebsiteConfiguration = {
                IndexDocument: 'index.html',
                ErrorDocument: '404.html'
            };
            this.Properties = __assign({}, this.Properties, { AccessControl: AccessControl,
                WebsiteConfiguration: WebsiteConfiguration });
            // use RedirectAllRequestsTo XOR RoutingRules
            var RedirectAllRequestsTo = config.RedirectAllRequestsTo, RoutingRules = config.RoutingRules;
            if (RoutingRules) {
                this.Properties.WebsiteConfiguration.RoutingRules = [];
            }
            else if (RedirectAllRequestsTo) {
            }
        }
        else {
            // remove the website config
            var _a = this.Properties, WebsiteConfiguration = _a.WebsiteConfiguration, everthingElse = __rest(_a, ["WebsiteConfiguration"]); // eslint-disable-line
            this.Properties = __assign({}, everthingElse);
        }
        return this;
    };
    S3Bucket.prototype.toJSON = function () {
        var _a;
        var printable = Object.entries(this.Properties).reduce(function (a, _a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            if (v && !lodash_es_1.isEmpty(v))
                a[k] = v;
            return a;
        }, {});
        return _a = {},
            _a[this.name] = {
                Type: this.Type,
                Properties: __assign({}, printable)
            },
            _a;
    };
    S3Bucket.prototype.Ref = function () {
        /**
         * When the logical ID of this resource is provided to the Ref intrinsic function,
         * Ref returns the resource name.
         * Example: mystack-mybucket-kdwwxmddtr2g.
         * */
        return { Ref: this.name };
    };
    S3Bucket.prototype.Arn = function () {
        /**
         * Returns the Amazon Resource Name (ARN) of the specified bucket.
         * Example: arn:aws:s3:::mybucket
         * */
        return { 'Fn::GetAtt': [this.name, 'Arn'] };
    };
    S3Bucket.prototype.DomainName = function () {
        /**
         * Returns the IPv4 DNS name of the specified bucket.
         * Example: mystack-mybucket-kdwwxmddtr2g.s3.amazonaws.com
         * Or with a `DualStackDomainName` it returns the IPv6 DNS name of the specified bucket.
         *
         * Example: mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com
         */
        return { 'Fn::GetAtt': [this.name, 'DomainName'] };
    };
    S3Bucket.prototype.RegionalDomainName = function () {
        /**
         * Returns the regional domain name of the specified bucket
         * Example: mystack-mybucket-kdwwxmddtr2g.s3.us-east-2.amazonaws.com
         */
        return { 'Fn::GetAtt': [this.name, 'RegionalDomainName'] };
    };
    S3Bucket.prototype.WebsiteURL = function () {
        /**
         * Returns the Amazon S3 website endpoint for the specified bucket.
         * Example (IPv4): http://mystack-mybucket-kdwwxmddtr2g.s3-website-us-east-2.amazonaws.com/
         * Example (IPv6): http://mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com/
         */
        return { 'Fn::GetAtt': [this.name, 'WebsiteURL'] };
    };
    S3Bucket.prototype.outputs = function (existingOutputs) {
        var _a;
        return __assign({}, existingOutputs, (_a = {}, _a[this.name + "-websiteURL"] = {
            Description: 'The WebsiteURL of the S3Bucket',
            Value: this.WebsiteURL()
        }, _a));
    };
    S3Bucket.prototype.validate = function () {
        var testStatusBuilder = function (passing, msgAccum) {
            if (passing === void 0) { passing = true; }
            if (msgAccum === void 0) { msgAccum = {}; }
            return function (pass, addMsg) {
                msgAccum = pass ? __assign({}, msgAccum) : __assign({}, msgAccum, addMsg);
                passing = passing && pass;
                return {
                    test: pass,
                    allTestsPass: passing,
                    failMsgs: msgAccum
                };
            };
        };
        var didTestPass = testStatusBuilder();
        // @ts-ignore
        var _a = s3_validations_js_1.validations(this).reduce(function (p, t) {
            return didTestPass(t.test, t.msg);
        }), allTestsPass = _a.allTestsPass, failMsgs = _a.failMsgs;
        return { passes: allTestsPass, failMsgs: failMsgs };
    };
    return S3Bucket;
}());
exports.S3Bucket = S3Bucket;
