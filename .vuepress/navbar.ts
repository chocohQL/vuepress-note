import {NavItem} from "vuepress/config";

export default [
    {
        text: "导航页",
        link: '/',
    },
    {
        text: "Java",
        link: '/Java/',
        items: [
            {
                text: "JVM", link: "/Java/#jvm",
            },
            {
                text: "JUC", link: "/Java/#juc",
            },
            {
                text: "JavaSE", link: "/Java/#javase",
            },
            {
                text: "JDK", link: "/Java/#jdk",
            },
        ]
    },
    {
        text: "Tool",
        link: '/Tool/',
        items: [
            {
                text: "GIT", link: "/Tool/#git",
            },
            {
                text: "Docker", link: "/Tool/#docker",
            },
            {
                text: "Linux", link: "/Tool/#linux",
            },
            {
                text: "Maven", link: "/Tool/#maven",
            },
            {
                text: "Nginx", link: "/Tool/#nginx",
            },
        ]
    },
    {
        text: "Frame",
        link: '/Frame/',
        items: [
            {
                text: "MyBatis", link: "/Frame/#mybatis",
            },
            {
                text: "Spring", link: "/Frame/#spring",
            },
            {
                text: "SpringBoot", link: "/Frame/#springboot",
            },
            {
                text: "SpringMVC", link: "/Frame/#springmvc",
            },
            {
                text: "SpringSecurity", link: "/Frame/#springsecurity",
            },
        ]
    },
    {
        text: "DB",
        link: '/DB/',
        items: [
            {
                text: "MySQL", link: "/DB/#mysql",
            },
            {
                text: "Redis", link: "/DB/#redis",
            },
        ]
    },
    {
        text: "Web",
        link: '/Web/'
    },
    {
        text: "Cloud",
        link: '/Cloud/'
    },
    {
        text: "Dev",
        link: '/Dev/',
        items: [
            {
                text: "设计模式", link: "/Dev/#设计模式",
            },
        ]
    },
    {
        text: "Env",
        link: '/Env/'
    },
] as NavItem[];
