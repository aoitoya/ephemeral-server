"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
// import env from "./config/env";
// import logger from "./config/logger";
// const PORT = env.PORT;
app_js_1.default.listen(3000, () => {
    console.info("Server is running on port", 3000);
});
