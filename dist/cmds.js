"use strict";
/* Copyright © 2023 Richard Rodger and other contributors, MIT License. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cmds = void 0;
const hoek_1 = __importDefault(require("@hapi/hoek"));
const utils_1 = require("./utils");
// NOTE: The function name prefix (lowercased) is the command name.
const GetCmd = (spec) => {
    const { argstr, context, respond } = spec;
    let option_path = argstr.trim();
    let sopts = context.seneca.options();
    let out = hoek_1.default.reach(sopts, option_path);
    return respond(null, out);
};
const DepthCmd = (spec) => {
    const { argstr, context, options, respond } = spec;
    let depth = parseInt(argstr, 10);
    depth = isNaN(depth) ? null : depth;
    context.inspekt = (0, utils_1.makeInspect)(context, {
        ...options.inspect,
        depth: depth,
    });
    return respond(null, 'Inspection depth set to ' + depth);
};
const PlainCmd = (spec) => {
    const { context, respond } = spec;
    context.plain = !context.plain;
    return respond();
};
const QuitCmd = (spec) => {
    const { context, respond } = spec;
    context.socket.end();
    respond();
};
const ListCmd = (spec) => {
    const { context, argstr, respond } = spec;
    let narrow = context.seneca.util.Jsonic(argstr);
    respond(null, context.seneca.list(narrow));
};
const FindCmd = (spec) => {
    const { context, argstr, respond } = spec;
    let narrow = context.seneca.util.Jsonic(argstr);
    respond(null, context.seneca.find(narrow));
};
const PriorCmd = (spec) => {
    const { context, argstr, respond } = spec;
    let pdesc = (actdef) => {
        let d = {
            id: actdef.id,
            plugin: actdef.plugin_fullname,
            pattern: actdef.pattern,
            callpoint: undefined
        };
        if (actdef.callpoint) {
            d.callpoint = actdef.callpoint;
        }
        return d;
    };
    let narrow = context.seneca.util.Jsonic(argstr);
    let actdef = context.seneca.find(narrow);
    let priors = [pdesc(actdef)];
    let pdef = actdef;
    while (null != (pdef = pdef.priordef)) {
        priors.push(pdesc(pdef));
    }
    respond(null, priors);
};
const HistoryCmd = (spec) => {
    const { context, respond } = spec;
    return respond(null, context.history.join('\n'));
};
const LogCmd = (spec) => {
    const { context, argstr, respond } = spec;
    let m = null;
    if (!context.log_capture) {
        context.log_match = null;
    }
    if ((m = argstr.match(/^\s*match\s+(.*)/))) {
        context.log_capture = true; // using match always turns logging on
        context.log_match = m[1];
    }
    return respond();
};
const SetCmd = (spec) => {
    const { context, argstr, options, respond } = spec;
    let m = argstr.match(/^\s*(\S+)\s+(\S+)/);
    if (m) {
        let setopt = (0, utils_1.parseOption)(m[1], context.seneca.util.Jsonic('$:' + m[2]).$);
        context.seneca.options(setopt);
        if (setopt.repl) {
            Object.assign(options, context.seneca.util.deepextend(options, setopt.repl));
        }
        return respond();
    }
    else {
        return respond('ERROR: expected set <path> <value>');
    }
};
const AliasCmd = (spec) => {
    const { context, argstr, respond } = spec;
    let m = argstr.match(/^\s*(\S+)\s+(.+)[\r\n]?/);
    if (m) {
        context.alias[m[1]] = m[2];
        return respond();
    }
    else {
        return respond('ERROR: expected alias <name> <command>');
    }
};
const TraceCmd = (spec) => {
    const { context, respond } = spec;
    context.act_trace = !context.act_trace;
    return respond();
};
const HelpCmd = (spec) => {
    const { context, respond } = spec;
    return respond(null, context.cmdMap);
};
const Cmds = {
    GetCmd,
    DepthCmd,
    PlainCmd,
    QuitCmd,
    ListCmd,
    FindCmd,
    PriorCmd,
    HistoryCmd,
    LogCmd,
    SetCmd,
    AliasCmd,
    TraceCmd,
    HelpCmd,
};
exports.Cmds = Cmds;
//# sourceMappingURL=cmds.js.map