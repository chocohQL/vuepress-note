# JDK21

https://openjdk.org/projects/jdk/21/ 

## JDK21版本号

JDK21的版本号是GA，就是“General Availability”的缩写，直译成中文，虽然是“普通可用”的意思，但是在软件行业，它就代表正式版。

如果对外发布一个 GA 版本，就意味着这个版本已经经过全面的测试，不存在任何重大的 bug，可供普通用户进行使用。

比如我们经常会看到一些软件发布的时候都会带上 Alpha、Beta、Gamma、RC 等等这些莫名其妙的单词，它们代表什么意思呢？

- Alpha：软件或系统的内部测试版本，仅内部人员使用。一般不向外部发布，通常会有很多 Bug，除非你也是测试人员，否则不建议使用，alpha 就是 α，是希腊字母的第一位，表示最初级的版本，beta 就是 β，alpha 版就是比 beta 还早的测试版，一般都是内部测试的版本。
- Beta：公开测试版。β 是希腊字母的第二个，顾名思义，这一版本通常是在 Alpha 版本后，该版本相对于 Alpha 版已有了很大的改进，消除了严重的错误，但还是存在着一缺陷，需要经过多次测试来进一步消除。这个阶段的版本会一直加入新的功能。
- Gamma：软件或系统接近于成熟的版本，只需要做一些小的改进就能发行。是 beta 版做过一些修改，成为正式发布的候选版本。
- RC：Release Candidate，发行候选版本。和 Beta 版最大的差别在于 Beta 阶段会一直加入新的功能，但是到了 RC 版本，几乎就不会加入新的功能了，而主要着重于除错。RC 版本是最终发放给用户的最接近正式版的版本，发行后改正 bug 就是正式版了，就是正式版之前的最后一个测试版。
- GA：General Available，正式发布的版本，这个版本就是正式的版本。在国外都是用 GA 来说明 release 版本的。比如：MySQL Community Server 5.7.21 GA 这是  MySQL Community Server 5.7 第 21 个发行稳定的版本，GA 意味着 General Available，也就是官方开始推荐广泛使用了。
- Release：这个版本通常就是所谓的“最终版本”，在前面版本的一系列测试版之后，终归会有一个正式版本，是最终交付用户使用的一个版本，该版本有时也称为标准版。一般情况下，Release 不会以单词形式出现在软件封面上，取而代之的是符号(R)。
- Stable：稳定版。在开源软件中，都有 stable 版，这个就是开源软件的最终发行版，用户可以放心大胆的用了。这一版本基于 Beta 版，已知 Bug 都被修复，一般情况下，更新比较慢。

除了上面的这些之外，我们还经常看见一个 LTS 的版本号。

LTS，Long Term Support，长期支持版，是指针对软件的某一版本，提供长时间的技术支持、安全更新和错误修复。

相对于非 LTS 版本，LTS 版本被认为是更为稳定、可靠和安全的版本。因此，在需要稳定性和安全性较高的场景中，如生产环境、企业级应用等，LTS 版本得到广泛的应用。

在 Java 领域，LTS 版本是指 Oracle 公司发布的 Java SE（Standard Edition，标准版）中，每隔一段时间发布一个长期支持版本。

自 2018 年开始，Oracle Java SE 8 、Java SE 11、Java SE 17 成为了 LTS 版本，分别提供了 3 年、 8 年、至少 3 年的支持。

## JDK21特性

JDK21一共发布了 15 个新特性：

![图片](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Java/20.png) 

### 虚拟线程

https://openjdk.org/jeps/444 

可以说这个特性就是 JDK 21 这个版本中最受瞩目、最值得期待的一个特性了。 

Virtual Threads，就是虚拟线程，从 JDK 19 吆喝到 JDK 20，终于在 JDK 21 现真身了。

前面我形容 JDK 21 的时候提到了一个词：开创新纪元。

值得就是它，根据官方介绍，虚拟线程的出现，确实是开启了并发编程的新纪元，轻量且高效，用更少的开销，处理更多的任务。

![图片](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Java/21.png)

只需做 极少改动（minimal change）即可启用虚拟线程。 

少到你升级到 JDK 21 之后，只需要把创建线程池的地方修改为这样就能启用虚拟线程： 

![图片](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Java/22.png)

### 其他新特性

根据官方的信息，它们把这 15 个新特性按照 JEP 的形式分为四类：核心 Java 库，Java 语言规范，HotSpot 和安全库。

https://www.infoq.com/news/2023/09/java-21-so-far/ 

纳入核心 Java 库的 6 个新特性分别是：

- JEP 431：序列集合
- JEP 442：外部函数和内存 API(第三次预览)
- JEP 444：虚拟线程
- JEP 446：作用域值(预览)
- JEP 448：Vector API (第六次孵化器)
- JEP 453：结构化并发(预览)

纳入 Java 语言规范的 5 个新特性分别是：

- JEP 430：字符串模板(预览)
- JEP 440：记录模式
- JEP 441：switch 模式匹配
- JEP 443：未命名模式和变量(预览)
- JEP 445：未命名类和实例主方法(预览)

纳入 HotSpot 的 3 个新特性分别是：

- JEP 439：分代 ZGC
- JEP 449：弃用 Windows 32 位 x86 移植
- JEP 451：准备禁止动态加载代理

纳入安全库的 1 个新特性是：

- JEP 452：密钥封装机制 API

其中 445 号提案，也小小的火了一把，因为它被大多数网友调侃为“卵用不大”。

因为这个提案是为了简化 Hello World 的写法。

### 分代 ZGC

目前的版本中，ZGC 都是不分代 GC 的。在 JDK 21 的版本中，提供了分代 GC 的功能，但是默认是关闭状态，需要通过配置打开：

 ```java
$ java -XX:+UseZGC -XX:+ZGenerational ...
 ```

>注意：
>
>In a future release we intend to make Generational ZGC the default, at which point -XX:-ZGenerational will select non-generational ZGC. In an even later release we intend to remove non-generational ZGC, at which point the ZGenerational option will become obsolete.

在未来的版本中，官方会把 ZGenerational 设为默认值，即默认打开 ZGC 的分代 GC。

在更晚的版本中，官方会考虑删除 ZGC 的不分代 GC 功能，到时候 ZGenerational 这个配置就会被一并“优化”。

说到这个 ZGC 的分代 GC，我突然想起了一个有意思的问题。

就是 2018 年，在 JDK 11 的里面，刚刚开始宣传 ZGC 的时候，就有人问：ZGC 为什么不进行分代啊？

关于这个问题，我在 R 大那里看到了一个权威的回答：

https://www.zhihu.com/question/287945354/answer/458761494 

没有什么特别的原因，就是“因为分代实现起来麻烦，想先实现出比较简单可用的版本”而已。