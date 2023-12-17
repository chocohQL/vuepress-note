# Linux常用操作

## 软件安装

```sh
# CentOS系统使用yum，Ubuntu系统使用apt，yum 和 apt 均需要root权限
yum [install remove search][-y] 软件名称
# install 安装
# remove 卸载
# search 搜索
# -y，自动确认
```
## systemctl

功能：控制系统服务的启动关闭等

语法：`systemctl start | stop | restart | disable | enable | status 服务名`

- start，启动
- stop，停止
- status，查看状态
- disable，关闭开机自启
- enable，开启开机自启
- restart，重启

## 软链接

功能：创建文件、文件夹软链接（快捷方式）

语法：`ln -s 参数1 参数2`

- 参数1：被链接的
- 参数2：要链接去的地方（快捷方式的名称和存放位置）

## 日期

语法：`date [-d] [+格式化字符串]`

- -d 按照给定的字符串显示日期，一般用于日期计算
- 格式化字符串：通过特定的字符串标记，来控制显示的日期格式
  - %Y   年%y   年份后两位数字 (00..99)
  - %m   月份 (01..12)
  - %d   日 (01..31)
  - %H   小时 (00..23)
  - %M   分钟 (00..59)
  - %S   秒 (00..60)
  - %s   自 1970-01-01 00:00:00 UTC 到现在的秒数

- 按照2022-01-01的格式显示日期：date +%Y-%m-%d

- 按照2022-01-01 10:00:00的格式显示日期：date "+%Y-%m-%d %H:%M:%S"

- -d选项日期计算：date -d "+1 day"\"-1 month“...


## 时区

修改时区为中国时区：

```sh
rm -f /etc/localtime
sudo ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

## ntp

功能：同步时间

安装：`yum install -y ntp`

启动管理：`systemctl start | stop | restart | status | disable | enable ntpd`

手动校准时间：`ntpdate -u ntp.aliyun.com`

## ip地址

格式：a.b.c.d（abcd为0~255的数字）

特殊IP：

- 127.0.0.1，表示本机
- 0.0.0.0
  - 可以表示本机
  - 也可以表示任意IP（看使用场景）

查看ip：`ifconfig`

## 主机名

功能：Linux系统的名称

查看：`hostname`

设置：`hostnamectl set-hostname 主机名`

## 配置VMware固定IP

1. 修改VMware网络，参阅PPT，图太多

2. 设置Linux内部固定IP

   修改文件：`/etc/sysconfig/network-scripts/ifcfg-ens33`

   示例文件内容：

   ```shell
   TYPE="Ethernet"
   PROXY_METHOD="none"
   BROWSER_ONLY="no"
   BOOTPROTO="static"			# 改为static，固定IP
   DEFROUTE="yes"
   IPV4_FAILURE_FATAL="no"
   IPV6INIT="yes"
   IPV6_AUTOCONF="yes"
   IPV6_DEFROUTE="yes"
   IPV6_FAILURE_FATAL="no"
   IPV6_ADDR_GEN_MODE="stable-privacy"
   NAME="ens33"
   UUID="1b0011cb-0d2e-4eaa-8a11-af7d50ebc876"
   DEVICE="ens33"
   ONBOOT="yes"
   IPADDR="192.168.88.131"		# IP地址，自己设置，要匹配网络范围
   NETMASK="255.255.255.0"		# 子网掩码，固定写法255.255.255.0
   GATEWAY="192.168.88.2"		# 网关，要和VMware中配置的一致
   DNS1="192.168.88.2"			# DNS1服务器，和网关一致即可
   ```

## ps命令

功能：查看进程信息

语法：`ps -ef`，查看全部进程信息，可以搭配grep做过滤：`ps -ef | grep xxx`

## kill命令

kill [-9] 进程ID

选项：-9表示强制关闭进程。不使用此选项会向进程发送信号要求其关闭，但是否关闭看进程自身的处理机制。

## nmap命令

可以通过Linux命令去查看端口的占用情况

+ 使用nmap命令，安装nmap: yum -y install nmap
+ 语法:nmap 被查看的IP地址
+ 22端口，一般是SSH服务使用，即FinalShell远程连接Linux所使用的端口

## netstat命令

功能：查看端口占用

用法：`netstat -anp | grep xxx`

## ping命令

测试网络是否联通

语法：`ping [-c num] 参数`

+ 选项:-c，检查的次数，不使用-c选项,将无限次数持续检查
+ 参数: ip或主机名,被检查的服务器的ip地址或主机名地址

## wget命令

wget是非交互式的文件下载器，可以在命令行内下载网络文件

语法: wget [-b] url

+ 选项:-b,可选，后台下载，会将日志写入到当前工作目录的wget-log文件。
+ 参数: url，下载链接

## curl命令

curl可以发送http网络请求,可用于:下载文件、获取信息等

语法: curl [-o] url

+ 选项:-O,用于下载文件，当url是下载链接时，可以使用此选项保存文件
+ 参数: url，要发起请求的网络地址

## top命令

功能：查看主机运行状态

语法：`top`，查看基础信息

可用选项：

```sh
选项 功能
-p 只显示某个进程的信息-d设置刷新时间，默认是5s
-c 显示产生进程的完整命令，默认是进程名
-n 指定刷新次数，比如 top -n 3，刷新输出3次后退出
-b 以非交互非全屏模式运行，以批次的方式执行top，一般配合-n指定输出几次统计信息，将输出重定向到指定文件，比如 top -b -n 3 > /tmp/top.tmp
-i 不显示任何闲置(idle)或无用(zombie)的进程
-u 查找特定用户启动的进程
```

交互式模式中，可用快捷键：

```sh
按键 功能
h键 按下h键，会显示帮助画面
c键 按下c键，会显示产生进程的完整命令，等同于-c参数，再次按下c键，变为默认显示
f键 按下f键，可以选择需要展示的项目
M键 ―按下M键，根据驻留内存大小(RES）排序
P键 ―按下P键，根据CPU使用百分比大小进行排序
T键 按下T键，根据时间/累计时间进行排序E键按下E键，切换顶部内存显示单位
e键 按下e键，切换进程内存显示单位
l键 按下l键，切换显示平均负载和启动时间信息。
i键 按下i键，不显示闲置或无用的进程，等同于-i参数，再次按下，变为默认显示
t键 按下t键，切换显示CPU状态信息
m键 按下m键，切换显示内存信息
```

## df命令

查看磁盘占用

语法：df [-h]

## iostat命令

查看CPU、磁盘的相关信息

语法: `iostat [-x] [num1] [num2]`

+ 选项: -x，显示更多信息
+ num1:数字，刷新间隔, num2:数字，刷新几次

## sar命令

查看网络统计

语法: sar -n DEV num1 num2

+ 选项:-n,查看网络，DEV表示查看网络接口
+ num1:刷新间隔（不填就查看一次结束)，, num2:查看次数(不填无限次数)

## 环境变量

- 临时设置：export 变量名=变量值
- 永久设置：
  - 针对用户，设置用户HOME目录内：`.bashrc`文件
  - 针对全局，设置`/etc/profile`

### PATH量

记录了执行程序的搜索路径

可以将自定义路径加入PATH内，实现自定义命令在任意地方均可执行的效果

## $符号

可以取出指定的环境变量的值

语法：`$变量名`

示例：

`echo $PATH`，输出PATH环境变量的值

`echo ${PATH}ABC`，输出PATH环境变量的值以及ABC

如果变量名和其它内容混淆在一起，可以使用${}

## 压缩解压

### 压缩

`tar -zcvf 压缩包 被压缩1...被压缩2...被压缩N`

- -z表示使用gzip，可以不写

`zip [-r] 参数1 参数2 参数N`

+ -r，被压缩的包含文件夹的时候,需要使用-r选项，和rm.cp等命令的-r效果一致

示例:

+  zip test.zip a.txt b.txt c.txt 将a.txt b.txt c.txt压缩到test.zip文件内
+ zip -r test.zip test itheima a.txt 将test、 itheima两个文件夹和a.txt文件，压缩到test.zip文件内

### 解压

`tar -zxvf 被解压的文件 -C 要解压去的地方`

- -z表示使用gzip，可以省略
- -C，可以省略，指定要解压去的地方，不写解压到当前目录

`unzip [-d] 参数`

+ -d，指定要解压去的位置，同tar的-C选项
+ 参数，被解压的zip压缩文件

示例

+ unzip test.zip 将test.zip解压到当前目录
+ unzip test.zip -d /home/itheima 将test.zip解压到指定文件夹内

## su命令

切换用户

语法：`su [-] [用户]`

+ -表示切换后加载环境变量，建议带上
+ 用户可以省略，省略默认切换到root

## sudo命令

+ 可以让一条普通命令带有root权限，语法：sudo其它命令
+ 需要以root用户执行visudo命令，增加配置方可让普通用户有sudo命令的执行权限

比如：

```shell
itheima ALL=(ALL)       NOPASSWD: ALL
```

在visudo内配置如上内容，可以让itheima用户，无需密码直接使用`sudo`

## chmod命令

修改文件、文件夹权限

语法：`chmod [-R] 权限 参数`

```sh
# 权限，比如755，表示：`rwxr-xr-x`
- 0:无任何权限，即---
- 1:仅有x权限，即–-x
- 2:仅有w权限，即-w-
- 3:有w和x权限，即-wx
- 4:仅有r权限，即r--
- 5:有r和x权限，即r-x
- 6:有r和w权限，即rw-
- 7:有全部权限，即rwx
```

- 参数，被修改的文件、文件夹
- 选项-R，设置文件夹和其内部全部内容一样生效

## chown命令

修改文件、文件夹所属用户、组

语法：`chown [-R] [用户][:][用户组] 文件或文件夹`

+ 选项，-R，同chmod，对文件夹内全部内容引用相同规则
+ 选项，用户，修改所属用户
+ 选项，用户组，修改所属用户组
+ :用于分割用户和用户组

```sh
# 将hello.txt所属用户修改为root
chown root hello.txt
# 将hello.txt所属用户组修改为root
chown :root hello.txt
# 将hello.txt所属用户修改为root，用户组修改为itheima
chown root:itheima hello.txt
# 将文件夹test的所属用户修改为root并对文件夹内全部内容应用相同样规则
chown -R root test
```

## 用户组管理

以下命令需root用户执行

+ 创建用户组：groupadd 用户组名
+ 删除用户组：groupdel 用户组名

## 用户管理

以下命令需root用户执行

+ 创建用户：`useradd [-g -d] 用户名`
+ + 选项: -g指定用户的组，不指定-g，会创建同名组并自动加入，指定-g需要组已经存在，如已存在同名组，必须使用-g
  + 选项:-d指定用户HOME路径，不指定，HOME目录默认在:/home/用户名
+ 删除用户：`userdel [-r] 用户名`
+ + 选项: -r，删除用户的HOME目录，不使用-r，删除用户时，HOME目录保留
+ 查看用户所属组：`id [用户名]`
+ + 参数:用户名，被查看的用户，如果不提供则查看自身
+ 修改用户所属组：`usermod -aG`
+ + 用户组用户名,将指定用户加入指定用户组

## genenv命令

- `getenv group`，查看系统全部的用户组

- `getenv passwd`，查看系统全部的用户


## env命令

查看系统全部的环境变量

语法：`env`























