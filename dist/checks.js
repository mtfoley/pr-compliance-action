"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTitle = exports.checkBranch = exports.checkBody = void 0;
const conventional_changelog_conventionalcommits_1 = __importDefault(require("conventional-changelog-conventionalcommits"));
const conventionalTypes = __importStar(require("conventional-commit-types"));
const conventional_commits_parser_1 = require("conventional-commits-parser");
function checkBody(body, regexString) {
    const regex = new RegExp(regexString, 'mi');
    const bodyNoComments = body.replace(/<!--(.*?)-->/gms, '');
    return regex.test(bodyNoComments);
}
exports.checkBody = checkBody;
function checkBranch(branch, protectedBranch) {
    return branch !== protectedBranch;
}
exports.checkBranch = checkBranch;
function checkTitle(title) {
    return __awaiter(this, void 0, void 0, function* () {
        const { parserOpts } = yield (0, conventional_changelog_conventionalcommits_1.default)();
        const defaultTypes = Object.keys(conventionalTypes.types);
        try {
            const result = (0, conventional_commits_parser_1.sync)(title, parserOpts);
            const errors = [];
            if (!defaultTypes.includes(result.type))
                errors.push({
                    valid: false,
                    message: `Found type "${result.type}", must be one of "${defaultTypes.join('","')}"`
                });
            if (!result.subject)
                errors.push({ valid: false, message: 'No subject found' });
            return { valid: errors.length === 0, errors };
        }
        catch (error) {
            return {
                valid: false,
                errors: [
                    {
                        valid: false,
                        message: error instanceof Error ? error.message : 'Unknown Error'
                    }
                ]
            };
        }
    });
}
exports.checkTitle = checkTitle;
