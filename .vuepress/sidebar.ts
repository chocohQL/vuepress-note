import {SidebarConfig4Multiple} from "vuepress/config";

import javaSideBar from "./sidebars/JavaSideBar";
import cloudSideBar from "./sidebars/CloudSideBar";
import toolSideBar from "./sidebars/ToolSideBar";
import devSideBar from "./sidebars/DevSideBar";
import envSideBar from "./sidebars/EnvSideBar";
import webSideBar from "./sidebars/WebSideBar";
import DBSideBar from "./sidebars/DBSideBar";
import frameSideBar from "./sidebars/FrameSideBar";
// @ts-ignore
export default {
    "/Java/": javaSideBar,
    "/Tool/": toolSideBar,
    "/Cloud/": cloudSideBar,
    "/Dev/": devSideBar,
    "/Env/": envSideBar,
    "/Web/": webSideBar,
    "/DB/": DBSideBar,
    "/Frame/": frameSideBar,
    // 降级，默认根据文章标题渲染侧边栏
    "/": "auto",
} as SidebarConfig4Multiple;
