# Docker进阶

## Docker简介

Docker是基于Go语言实现的云开源项目。

Docker的主要目标是：`Build, Ship and Run Any App, Anywhere`，也就是通过对应用组件的封装、分发、部署、运行等生命周期的管理，使用户的APP及其运行环境能做到**一次镜像,处处运行**。



Docker如何解决大型项目依赖关系复杂，不同组件依赖的兼容性问题？

- Docker允许开发中将应用、依赖、函数库、配置一起**打包**，形成可移植镜像
- Docker应用运行在容器中，使用沙箱机制，相互**隔离**



Docker如何解决开发、测试、生产环境有差异的问题？

- Docker镜像中包含完整运行环境，包括系统函数库，仅依赖系统的Linux内核，因此可以在任意Linux操作系统上运行



Docker是一个快速交付应用、运行应用的技术，具备下列优势：

- 可以将程序及其依赖、运行环境一起打包为一个镜像，可以迁移到任意Linux操作系统
- 运行时利用沙箱机制形成隔离容器，各个应用互不干扰
- 启动、移除都可以通过一行命令完成，方便快捷



Docker和虚拟机的差异：

- docker是一个系统进程；虚拟机是在操作系统中的操作系统
- docker体积小、启动速度快、性能好；虚拟机体积大、启动速度慢、性能一般

### 传统虚拟机和容器

**传统虚拟机（virtual machine）：**

传统虚拟机技术基于安装在主操作系统上的虚拟机管理系统（如VirtualBox、VMware等），创建虚拟机（虚拟出各种硬件），在虚拟机上安装从操作系统，在从操作系统中安装部署各种应用。

缺点：资源占用多、冗余步骤多、启动慢

**Linux容器（Linux Container，简称LXC）：**

Linux容器是与系统其他部分分隔开的一系列进程，从另一个镜像运行，并由该镜像提供支持进程所需的全部文件。容器提供的镜像包含了应用的所有依赖项，因而在从开发到测试再到生产的整个过程中，它都具有可移植性和一致性。

Linux容器不是模拟一个完整的操作系统，而是对进程进行隔离。有了容器，就可以将软件运行所需的所有资源打包到一个隔离的容器中。容器与虚拟机不同，不需要捆绑一整套操作系统，只需要软件工作所需的库资源和设置。系统因此而变得高效轻量并保证部署在任何环境中的软件都能始终如一的运行。

### Docker运行速度快的原因

Docker有比虚拟机更少的抽象层：

由于Docker不需要Hypervisor（虚拟机）实现硬件资源虚拟化，运行在Docker容器上的程序直接使用的都是实际物理机的硬件资源，因此在CPU、内存利用率上docker有明显优势。

Docker利用的是宿主机的内核，而不需要加载操作系统OS内核：

当新建一个容器时，Docker不需要和虚拟机一样重新加载一个操作系统内核。进而避免引寻、加载操作系统内核返回等比较耗时耗资源的过程。当新建一个虚拟机时，虚拟机软件需要加载OS，返回新建过程是分钟级别的。而Docker由于直接利用宿主机的操作系统，则省略了返回过程，因此新建一个docker容器只需要几秒钟。

Docker容器的本质就是一个进程。

### Docker软件

Docker并非一个通用的容器工具，它依赖于已经存在并运行的Linux内核环境。（在Windows上安装Docker时需要依赖WLS，也即Windows下的Linux子系统）。

Docker实质上是在已经运行的Linux下制造了一个隔离的文件环境，因此它执行的效率几乎等同于所部署的Linux主机。

Docker的基本组成部分：

- 镜像（image）

- 容器（container）

- 仓库（repository）

#### Docker镜像

**镜像（Image）**：Docker将应用程序及其所需的依赖、函数库、环境、配置等文件打包在一起，称为镜像。

#### Docker容器

**容器（Container）**：镜像中的应用程序运行后形成的进程就是**容器**，只是Docker会给容器进程做隔离，对外不可见。

#### Docker仓库

Docker仓库是集中存放镜像文件的场所。

仓库分为公开仓库和私有仓库两种。

最大的公开仓库是Docker官方的Docker Hub：<https://hub.docker.com/>

国内也有类似于DockerHub 的公开服务，比如 [网易云镜像服务](https://c.163yun.com/hub)、[阿里云镜像库](https://cr.console.aliyun.com/)等。

### Docker架构

Docker是一个CS架构的程序，由两部分组成：

- 服务端(server)：Docker守护进程，负责处理Docker指令，管理镜像、容器等
- 客户端(client)：通过命令或RestAPI向Docker服务端发送指令。可以在本地或远程向服务端发送指令。

Docker守护进程运行在主机上，然后通过Socket连接从客户端访问，守护进程从容器接收命令并管理运行在主机上的容器。

Docker运行的基本流程为：

1. 用户是使用Docker Client 与 Docker Daemon 建立通信，并发送请求给后者

1. Docker Daemon 作为 Docker 架构的主体部分，首先提供 Docker Server 的功能使其可以接收 Docker Client 的请求

1. Docker Engine 执行 Docker 内部的一系列工作，每一项工作都是以一个 Job 的形式存在

1. Job 的运行过程中，当需要容器镜像时，则从 Docker Registry 中下载镜像，并通过镜像管理驱动 Graph Driver 将下载镜像以 Graph 的形式存储

1. 当需要为 Docker 创建网络环境时，通过网络管理驱动 Network driver 创建并配置 Docker 容器网络环境

1. 当需要限制 Docker 容器运行资源或执行用户指令等操作时，则通过 Exec driver 来完成

1. Libcontainer 是一项独立的容器管理包，Network driver 以及 Exec driver 都是通过 Libcontainer 来实现具体对容器进行的操作

## Docker安装

### 卸载旧版本

```sh
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

>  旧版本的Docker引擎包可能叫做：`docker`、`docker-engine`。
>
> 新版本的Docker引擎包叫做：`docker-ce`

### 配置yum资源库

安装`yum-config-manager`： 

```sh
## yum-util提供yum-config-manager功能 
sudo yum install -y yum-utils
```

配置docker的资源库地址：

官方地址：（比较慢，不推荐）

```sh
## 在yum资源库中添加docker资源库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

阿里云镜像地址： 

```sh
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

> 阿里云官网提供了很多资源镜像，镜像地址：`https://mirrors.aliyun.com`，进入之后可以选择自己需要的资源进行配置 

创建缓存（可选）： 

```sh
yum makecache fast
```

### 安装Docker引擎

安装最新版本的Docker引擎、Docker客户端： 

```sh
## docker-ce是Docker引擎，docker-ce-cli是客户端
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

此时，默认安装的docker引擎、客户端都是最新版本。  

如果要安装指定版本：    

```sh
## 查询版本列表
yum list docker-ce --showduplicates | sort -r

## 指定版本安装17.09.0.ce版
## sudo yum install docker-ce-<VERSION_STRING> docker-ce-cli-<VERSION_STRING> containerd.io docker-compose-plugin
sudo yum install docker-ce-17.09.0.ce docker-ce-cli-17.09.0.ce containerd.io docker-compose-plugin
```

### 启动docker引擎

如果没有启动Docker引擎，那么执行 `docker version`查看版本号时，只能看到 `Client: Docker Engine`（Docker引擎客户端）的版本号。

启动Docker引擎： 

```sh
## 新版本的Docker就是一个系统服务，可以直接使用启动系统服务方式启动
systemctl start docker

## 此时查看docker版本，可以看到Server: Docker Engine（Docker引擎）版本号
docker version
```

### 卸载Docker

卸载Docker步骤：

1.  关闭服务 

```ah
systemctl stop docker
```

2. 使用`yum`删除docker引擎 

```sh
sudo yum remove docker-ce docker-ce-cli containerd.io
```

3. 删除镜像、容器、卷、自定义配置等文件 

```sh
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### 运行HelloWorld测试

运行HelloWorld：    

```sh
docker run hello-world
```

### 配置镜像加速器

登录阿里云，进入 `工作台` -> `容器镜像服务` -> `镜像工具` -> `镜像加速器`

```sh
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://kve0nk78.mirror.aliyuncs.com"]
}
EOF

sudo systemctl daemon-reload

sudo systemctl restart docker
```

## Docker常用命令

### 启动类命令

```sh
## 启动docker
systemctl start docker
## 停止Docker
systemctl stop docker
## 重启Docker
systemctl restart docker
## 查看状态
systemctl status docker
## 设置开机自启
systemctl enable docker
```

### 帮助类命令

```sh
## 查看Docker版本
docker version
## 查看Docker概要信息
docker info
## 查看Docker总体帮助文档
docker --help
## 查看docker具体命令帮助文档
docker 具体命令 --help
```

### 镜像命令

**列出本地主机上的镜像**

```sh
docker images
```

参数：

- `-a`：列出所有镜像（含历史镜像）

- `-q`：只显示镜像ID

- `-f`：过滤

**在远程仓库中搜索镜像**

（默认取docker hub中搜索）

```sh
docker search 镜像名称
```

 参数：

- `-f`：过滤

- `--limit 数量`：只展示前几项

**下载镜像**

```sh
docker pull 镜像名称[:tag]
```

不加 tag 时，默认下载最新的镜像（即tag为`latest`）。 

**查看占据的空间**

查看镜像/容器/数据卷所占的空间： 

```sh
docker system df
```

**删除镜像**

```sh
docker rmi 镜像名称/ID
```

强制删除：

```sh
docker rmi -f 镜像名称/ID
```

可以使用空格分隔，删除多个镜像： 

```sh
docker rmi 镜像1 镜像2 镜像3
```

删除全部镜像： 

```sh
docker rmi -f $(docker images -qa)
```

**虚悬镜像**

仓库名、标签都是`<none>`的镜像，俗称虚悬镜像（dangling image）。 

## Docker容器命令

### 新建启动容器

```sh
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

常用的参数：

- `--name`：为容器指定一个名称

- `-d`：后台运行容器并返回容器ID，也即启动守护式容器

- `-i`：以交互模式（interactive）运行容器，通常与`-t`同时使用

- `-t`：为容器重新分配一个伪输入终端（tty），通常与`-i`同时使用。也即启动交互式容器（前台有伪终端，等待交互）

- `-e`：为容器添加环境变量

- `-P`：随机端口映射。将容器内暴露的所有端口映射到宿主机随机端口

- `-p`：指定端口映射

- + `-p hostPort:containerPort`：端口映射，例如`-p 8080:80`
  + `-p ip:hostPort:containerPort`：配置监听地址，例如 `-p 10.0.0.1:8080:80`
  + `-p ip::containerPort`：随机分配端口，例如 `-p 10.0.0.1::80`
  + `-p hostPort1:containerPort1 -p hostPort2:containerPort2`：指定多个端口映射，例如`-p 8080:80 -p 8888:3306`

#### 启动交互式容器

**以交互方式启动ubuntu镜像**

```sh
## -i 交互模式
## -t 分配一个伪输入终端tty
## ubuntu 镜像名称
## /bin/bash（或者bash） shell交互的接口
docker run -it ubuntu /bin/bash
```

**退出交互模式**

方式一（退出后，容器会停止）：

```sh
## 在交互shell中exit即可退回宿主机
exit
```

方式二（退出后容器依然正在运行）：使用快捷键`ctrl + P + Q`

#### 启动守护式容器

大部分情况下，我们系统docker容器服务时在后台运行的，可以通过`-d`指定容器的后台运行模式： 

```sh
docker run -d 容器名
```

> 注意事项：
>
> 如果使用`docker run -d ubuntu`尝试启动守护式的ubuntu，会发现容器启动后就自动退出了。
>
> 因为Docker容器如果在后台运行，就必须要有一个前台进程。容器运行的命令如果不是那些一直挂起的命令（例如`top`、`tail`），就会自动退出。

### 列出正在运行的容器

```sh
docker ps [OPTIONS]
```

常用参数：

- `-a`：列出当前所有正在运行的容器+历史上运行过的容器

- `-l`：显示最近创建的容器

- `-n`：显示最近n个创建的容器

- `-q`：静默模式，只显示容器编号

### 容器其他启停操作

**启动已经停止的容器**

```sh
docker start 容器ID或容器名
```

**重启容器**

```sh
docker restart 容器ID或容器名
```

**停止容器**

```sh
docker stop 容器ID或容器名
```

**强制停止容器**

```sh'
docker kill 容器ID或容器名
```

**删除容器**

删除已经停止的容器： 

```sh
docker rm 容器ID或容器名
```

>  删除容器是 `docker rm`，删除镜像是 `docker rmi`，注意区分。 

强制删除正在运行的容器：    

```sh
docker rm -f 容器ID或容器名
```

一次删除多个容器实例： 

```sh
docker rm -f ${docker ps -a -q}
## 或者
docker ps -a -q | xargs docker rm
```

### 查看容器日志

```sh
docker logs 容器ID或容器
```

### 查看容器内运行的进程

```sh
docker top 容器ID或容器名
```

### 查看容器内部细节

```sh
docker inspect 容器ID或容器名
```

### 进入正在运行的容器

进入正在运行的容器，并以命令行交互： 

```sh
docker exec -it 容器ID bashShell
```

重新进入： 

```sh
docker attach 容器ID
```

`docker exec` 和 `docker attach` 区别：

- `attach`直接进入容器启动命令的终端，不会启动新的进程，用`exit`退出会导致容器的停止

- `exec`是在容器中打开新的终端，并且可以启动新的进程，用`exit`退出不会导致容器的停止

如果有多个终端，都对同一个容器执行了 `docker attach`，就会出现类似投屏显示的效果。一个终端中输入输出的内容，在其他终端上也会同步的显示。

### 容器和宿主机文件拷贝

容器内文件拷贝到宿主机： 

```sh
docker cp 容器ID:容器内路径 目的主机路径
```

宿主机文件拷贝到容器中： 

```sh
docker cp 主机路径 容器ID:容器内路径
```

### 导入和导出容器

`export`：导出容器的内容流作为一个tar归档文件（对应`import`命令）；

`import`：从tar包中的内容创建一个新的文件系统再导入为镜像（对应`export`命令）；

示例： 

```sh
## 导出
## docker export 容器ID > tar文件名
docker export abc > aaa.tar

## 导入
## cat tar文件 | docker import - 自定义镜像用户/自定义镜像名:自定义镜像版本号
cat aaa.tar | docker import - test/mytest:1.0.1
```

### 保存、导入镜像

需求：利用docker save将nginx镜像导出磁盘，然后再通过load加载回来

1）利用docker xx --help命令查看docker save和docker load的语法

例如，查看save命令用法，可以输入命令：

```sh
docker save --help
```

命令格式：

```shell
docker save -o [保存的目标文件名称] [镜像名称]
```

2）使用docker save导出镜像到磁盘 

运行命令：

```sh
docker save -o nginx.tar nginx:latest
```

3）使用docker load加载镜像

先删除本地的nginx镜像：

```sh
docker rmi nginx:latest
```

然后运行命令，加载本地文件：

```sh
docker load -i nginx.tar
```

### 将容器生成新镜像

`docker commit`提交容器副本使之成为一个新的镜像。 

> docker 启动一个镜像容器后， 可以在里面执行一些命令操作，然后使用`docker commit`将新的这个容器快照生成一个镜像。 

```sh\
docker commit -m="提交的描述信息" -a="作者" 容器ID 要创建的目标镜像名:[tag]
```

Docker挂载主机目录，可能会出现报错：`cannot open directory .: Perission denied`。

解决方案：在命令中加入参数 `--privileged=true`。

CentOS7安全模块比之前系统版本加强，不安全的会先禁止，目录挂载的情况被默认为不安全的行为，在SELinux里面挂载目录被禁止掉了。如果要开启，一般使用 `--privileged=true`，扩大容器的权限解决挂载没有权限的问题。也即使用该参数，容器内的root才拥有真正的root权限，否则容器内的root只是外部的一个普通用户权限。

### 容器数据卷

卷就是目录或文件，存在于一个或多个容器中，由docker挂载到容器，但不属于联合文件系统，因此能够绕过UnionFS，提供一些用于持续存储或共享数据。

特性：卷设计的目的就是数据的持久化，完全独立于容器的生存周期，因此Docker不会在容器删除时删除其挂载的数据卷。

特点：

- 数据卷可以在容器之间共享或重用数据
- 卷中的更改可以直接实施生效
- 数据卷中的更改不会包含在镜像的更新中
- 数据卷的生命周期一直持续到没有容器使用它为止

数据卷操作的基本语法如下：

```sh
docker volume [COMMAND]
```

docker volume命令是数据卷操作，根据命令后跟随的command来确定下一步的操作：

- create 创建一个volume
- inspect 显示一个或多个volume的信息
- ls 列出所有的volume
- prune 删除未使用的volume
- rm 删除一个或多个指定的volume

#### 创建和查看数据卷

**需求**：创建一个数据卷，并查看数据卷在宿主机的目录位置

① 创建数据卷

```sh
docker volume create html
```

② 查看所有数据

```sh
docker volume ls
```

③ 查看数据卷详细信息卷

```sh
docker volume inspect html
```

可以看到，我们创建的html这个数据卷关联的宿主机目录为`/var/lib/docker/volumes/html/_data`目录。

#### 挂载数据卷

我们在创建容器时，可以通过 -v 参数来挂载一个数据卷到某个容器内目录，命令格式如下：

```sh
docker run \
  --name mn \
  -v html:/root/html \
  -p 8080:80
  nginx \
```

这里的-v就是挂载数据卷的命令：`-v html:/root/htm` ：把html数据卷挂载到容器内的/root/html这个目录中



运行一个带有容器卷存储功能的容器实例：

```sgh
docker run -it --privileged=true -v 宿主机绝对路径目录:容器内目录[:rw | :ro] 镜像名
```

可以使用`docker inspect`查看容器绑定的数据卷。

权限：

-  `rw`：读写 

-  `ro`：只读。如果宿主机写入内容，可以同步给容器内，容器内可以读取。 

容器卷的继承：

```sh
## 启动一个容器
docker run -it --privileged=true /tmp/test:/tmp/docker --name u1 ubuntu /bin/bash

## 使用 --volumes-from 继承 u1的容器卷映射配置
docker run -it --privileged=true --volumes-from u1 --name u2 ubuntu
```

