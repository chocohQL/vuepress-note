import {defineConfig} from "vuepress/config";
import navbar from "./navbar";
import sidebar from "./sidebar";
import footer from "./footer";

export default defineConfig({
    title: "蓝色蜻蛉的学习笔记",
    description: "失手扑空蓝色的蜻蛉",
    head: [
        // 站点图标
        ["link", {rel: "icon", href: "/favicon.ico"}],
    ],
    permalink: "/:slug",
    // 热更新
    extraWatchFiles: [".vuepress/*.ts", ".vuepress/sidebars/*.ts"],
    markdown: {
        // 开启代码块的行号
        lineNumbers: true,
        // 支持 4 级以上的标题渲染
        extractHeaders: ["h2", "h3", "h4", "h5", "h6"],
    },
    // @ts-ignore
    plugins: [
        ["@vuepress/back-to-top"],
        ["@vuepress/medium-zoom"],
        ["vuepress-plugin-tags"],
        [
            "vuepress-plugin-code-copy",
            {
                successText: "代码已复制",
            },
        ],
        ["img-lazy"],
    ],
    // 主题配置
    themeConfig: {
        logo: "/logo.png",
        nav: navbar,
        sidebar,
        // @ts-ignore
        footer,
        // GitHub 仓库位置
        repo: "chocohQL/vuepress-note",
        docsBranch: "master",
    },
});
