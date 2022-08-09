"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiUI = void 0;
const ui_aspect_1 = require("./ui.aspect");
class UiUI {
    static provider() {
        return __awaiter(this, void 0, void 0, function* () {
            return new UiUI();
        });
    }
}
exports.UiUI = UiUI;
UiUI.runtime = ui_aspect_1.UIRuntime;
ui_aspect_1.UIAspect.addRuntime(UiUI);
