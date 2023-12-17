# Nginx基础

## Nginx简介

Nginx是⽬前最流⾏的Web服务器， 最开始是由⼀个叫做igor的俄罗斯的程序员开发的， 2019年3⽉11⽇被美国的F5公司以6.7亿美元的价格收购， 现在Nginx是F5公司旗下的⼀款产品了。 

Nginx开源版本主要分为两种，⼀种是稳定版，⼀种是主线版。 

+ 主线版（mainline）：主线版是最新的版本，功能会⽐较多，会包含⼀些正在开发中的体 验性模块功能，但是也可能会有⼀些新的bug。 
+ 稳定版（Stable）：稳定版是经过⻓时间测试的版本，不会有太多的bug，也不会包含⼀ 些新的功能。 

**HttpWeb服务器** 

+ 可以用于构建静态web站点 
+ 虚拟主机 
+ 用于展示Html、css等静态资源或作为CDN（Content Delivery Network）资源服 务器 
+ 支持rtmp协议，直播推流 
+ 使用http协议作为短视频、多媒体资源服务器（优酷、抖⾳） 
+ 文件下载服务器（rar、exe⽂件）

**高性能网关/反向代理服务器** 

+ 内网服务器与外围隔离 
+ 以隧道模式完成请求转发 
+ 支持Http的7层或Tcp/Udp的4层转发 

**日志采集** 

+ 供大数据分析 
+ 使用http协议，接收用户请求 
+ 返回简单报文 
+ 收集用户访问日志（京东、淘宝） 

**应用服务器**

+ 整合php、Perl、Python、Lua等语言 
+ 内存缓存 
+ 可以连接其他中间件 
+ 中间件中不宜实现过度复杂的业务逻辑 

**负载均衡器** 

+ 内置轮询、权重、ip-hash等算法 
+ 可自定义负载均衡算法 
+ Cookies的会话保持问题 

**其他**

+ 软防火墙
+ 使用Lua等语言在Nginx的基础上进行二次开发
+ 请求规则匹配
+ 过滤非法请求达到流量清洗的目的

## 目录结构

```
conf #配置文件
	｜-nginx.conf ## 主配置文件
	｜-其他配置文件 ## 可通过那个include关键字，引入到了nginx.conf生效
	
html #静态页面

logs
	｜-access.log #访问日志(每次访问都会记录)
	｜-error.log #错误日志
	｜-nginx.pid #进程号
	
sbin
	｜-nginx #主进程文件
	
*_temp #运行时，生成临时文件
```

## Nginx常用命令

```sh
nginx ## 启动Nginx
nginx -c filename ## 指定配置⽂件
nginx -V ## 查看Nginx的版本和编译参数等信息
nginx -t ## 检查配置⽂件是否正确，也可⽤来定位配置⽂件的位置
nginx -s quit ## 优雅停⽌Nginx
nginx -s stop ## 快速停⽌Nginx
nginx -s reload ## 重新加载配置⽂件
nginx -s reopen ## 重新打开⽇志⽂件
```

## Nginx安装

安装依赖

```sh
yum install -y gcc gcc-c++ make libtool wget pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

Nginx下载

```sh
wget http://nginx.org/download/nginx-1.18.0.tar.gz
```

Nginx解压

```sh
tar -zxvf nginx-1.18.0.tar.gz
```

Nginx安装

```sh
cd nginx-1.18.0

./configure

make && make install
```

路径为：/usr/local/nginx

Nginx命令

```
普通启动服务：/usr/local/nginx/sbin/nginx
配置文件启动：/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
暴力停止服务：/usr/local/nginx/sbin/nginx -s stop
优雅停止服务：/usr/local/nginx/sbin/nginx -s quit
检查配置文件：/usr/local/nginx/sbin/nginx -t
重新加载配置：/usr/local/nginx/sbin/nginx -s reload
查看相关进程：ps -ef | grep nginx
```

## Nginx配置文件

### nginx.conf

Nginx的配置⽂件是 nginx.conf ，⼀般位于 /etc/nginx/nginx.conf 。 可以使⽤ nginx -t 来查看配置⽂件的位置和检查配置⽂件是否正确。 

html位于/usr/share/nginx/html/

```sh
## 每次修改配置文件，需要重载才能生效
systemctl reload nginx
```

Nginx的配置⽂件是由⼀系列的指令组成的，每个指令都是由⼀个指令名和⼀个或者多个参数 组成的。 指令和参数之间使⽤空格来分隔，指令以分号 ; 结尾，参数可以使⽤单引号或者双引号来包裹。

 配置⽂件分为以下⼏个部分： 

```sh
## 全局块
worker_processes 1;

events {
	## events块
}

http {
	## http块
 	server {
		## server块
 		location / {
		## location块
     	}
 	}
}
```

```sh
## 启动的worker进程数
worker_processes  1; 

events {
	#每个worker进程的连接数
    worker_connections  1024; 
}

http {
	#include是引入关键字，这里引入了mime.types这个配置文件（同在conf目录下，mime.types是用来定义，请求返回的content-type）
    include       mime.types; 
    #mime.types未定义的，使用默认格式application/octet-stream
    default_type  application/octet-stream; 
	#打开sendfile，用户请求的数据不用再加载到nginx的内存中，而是直接发送
    sendfile        on; 
    #长链接超时时间
    keepalive_timeout  65; 
	
	#一个nginx可以启用多个server（虚拟服务器）
    server {
    	#监听端口80
        listen       80;
        #接收的域名
        server_name  localhost;  

        location / { 
        	#根目录指向html目录
            root   html; 
            #域名/index 指向 index.html index.htm文件
            index  index.html index.htm; 
        }
		#服务器错误码为500 502 503 504，转到"域名/50x.html"
        error_page   500 502 503 504  /50x.html; 
        #指定到html文件夹下找/50x.html
        location = /50x.html {
            root   html;
        }

    }
}
```

### 全局块

全局块是配置⽂件的第⼀个块，也是配置⽂件的主体部分，主要⽤来设置⼀些影响Nginx服务 器整体运⾏的配置指令，主要包括配置运⾏Nginx服务器的⽤户（组）、允许⽣成的worker process数、进程PID存放路径、⽇志存放路径和类型以及配置⽂件引⼊等。 

```sh
## 指定运⾏Nginx服务器的⽤户，只能在全局块配置
## 将user指令注释掉，或者配置成nobody的话所有⽤户都可以运⾏
## user [user] [group]
## user nobody nobody;
user nginx;
## 指定⽣成的worker进程的数量，也可使⽤⾃动模式，只能在全局块配置
worker_processes 1;
## 错误⽇志存放路径和类型
error_log /var/log/nginx/error.log warn;
## 进程PID存放路径
pid /var/run/nginx.pid;
```

### events块 

```sh
events {
    ## 指定使⽤哪种⽹络IO模型，只能在events块中进⾏配置
    ## use epoll
    ## 每个worker process允许的最⼤连接数
    worker_connections 1024;
}
```

### http块

http块是配置⽂件的主要部分，包括http全局块和server块。 

```sh
http {
    ## nginx 可以使⽤include指令引⼊其他配置⽂件
    include /etc/nginx/mime.types;
    ## 默认类型，如果请求的URL没有包含⽂件类型，会使⽤默认类型
    default_type application/octet-stream; ## 默认类型
    ## 开启⾼效⽂件传输模式
    sendfile on;
    ## 连接超时时间
    keepalive_timeout 65;
    ## access_log ⽇志存放路径和类型
    ## 格式为：access_log <path> [format [buffer=size] [gzip[=level]]
    [flush=time] [if=condition]];
    access_log /var/log/nginx/access.log main;
    ## 定义⽇志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    ## 设置sendfile最⼤传输⽚段⼤⼩，默认为0，表示不限制
    ## sendfile_max_chunk 1m;
    ## 每个连接的请求次数
    ## keepalive_requests 100;
    ## keepalive超时时间
    keepalive_timeout 65;
    ## 开启gzip压缩
    ## gzip on;
    ## 开启gzip压缩的最⼩⽂件⼤⼩
    ## gzip_min_length 1k;
    ## gzip压缩级别，1-9，级别越⾼压缩率越⾼，但是消耗CPU资源也越多
    ## gzip_comp_level 2;
    ## gzip压缩⽂件类型
    ## gzip_types text/plain application/javascript application/xjavascript text/css application/xml text/javascript application/x-httpdphp image/jpeg image/gif image/png;
    ## upstream指令⽤于定义⼀组服务器，⼀般⽤来配置反向代理和负载均衡
    
    upstream www.example.com {
         ## ip_hash指令⽤于设置负载均衡的⽅式，ip_hash表示使⽤客户端的IP进⾏hash，这样可以保证同⼀个客户端的请求每次都会分配到同⼀个服务器，解决了session共享的问题
         ip_hash;
         ## weight ⽤于设置权重，权重越⾼被分配到的⼏率越⼤
         server 192.168.50.11:80 weight=3;
         server 192.168.50.12:80;
         server 192.168.50.13:80;
    }
     
    server {
   		## 参考server块的配置
    }
}
```

### server块

server块是配置虚拟主机的，⼀个http块可以包含多个server块，每个server块就是⼀个虚拟主机。 

```sh
server {
    ## 监听IP和端⼝
    ## listen的格式为：
    ## listen [ip]:port [default_server] [ssl] [http2] [spdy] [proxy_protocol] [setfib=number] [fastopen=number] [backlog=number];
    ## listen指令⾮常灵活，可以指定多个IP和端⼝，也可以使⽤通配符
    ## 下⾯是⼏个实际的例⼦：
    ## listen 127.0.0.1:80; ## 监听来⾃127.0.0.1的80端⼝的请求
    ## listen 80; ## 监听来⾃所有IP的80端⼝的请求
    ## listen *:80; ## 监听来⾃所有IP的80端⼝的请求，同上
    ## listen 127.0.0.1; ## 监听来⾃来⾃127.0.0.1的80端⼝，默认端⼝为80
    listen 80;
    ## server_name ⽤来指定虚拟主机的域名，可以使⽤精确匹配、通配符匹配和正则匹配等⽅式
    ## server_name example.org www.example.org; ## 精确匹配
    ## server_name *.example.org; ## 通配符匹配
    ## server_name ~^www\d+\.example\.net$; ## 正则匹配
    server_name localhost;
    
    ## location块⽤来配置请求的路由，⼀个server块可以包含多个location块，每个location块就是⼀个请求路由
    ## location块的格式是：
    ## location [=|~|~*|^~] /uri/ { ... }
    ## = 表示精确匹配，只有完全匹配上才能⽣效
    ## ~ 表示区分⼤⼩写的正则匹配
    ## ~* 表示不区分⼤⼩写的正则匹配
    ## ^~ 表示普通字符匹配，如果匹配成功，则不再匹配其他location
    ## /uri/ 表示请求的URI，可以是字符串，也可以是正则表达式
    ## { ... } 表示location块的配置内容
    location / {
        ## root指令⽤于指定请求的根⽬录，可以是绝对路径，也可以是相对路径
        root /usr/share/nginx/html; ## 根⽬录
        ## index指令⽤于指定默认⽂件，如果请求的是⽬录，则会在⽬录下查找默认⽂件
        index index.html index.htm; ## 默认⽂件
    }
     
    ## 下⾯是⼀些location的示例：
    location = / { ## 精确匹配请求
         root /usr/share/nginx/html;
         index index.html index.htm;
    }
     
    location ^~ /images/ { ## 匹配以/images/开头的请求
     	root /usr/share/nginx/html;
    }
    
    location ~* \.(gif|jpg|jpeg)$ { ## 匹配以gif、jpg或者jpeg结尾的请求
     	root /usr/share/nginx/html;
    }
    
    location !~ \.(gif|jpg|jpeg)$ { ## 不匹配以gif、jpg或者jpeg结尾的请求
    	root /usr/share/nginx/html;
    }
    
    location !~* \.(gif|jpg|jpeg)$ { ## 不匹配以gif、jpg或者jpeg结尾的请求
     	root /usr/share/nginx/html;
    }
    
    ## error_page ⽤于指定错误⻚⾯，可以指定多个，按照优先级从⾼到低依次查找
    error_page 500 502 503 504 /50x.html; ## 错误⻚⾯
    location = /50x.html {
     	root /usr/share/nginx/html;
    }
}
```

### server_name

**不同二级域名，映射到不同静态网页**

可以写多个server字段，从前向后匹配，先匹配到哪个就用哪个

用户访问pro.hedaodao.ltd，就会走到第一个server配置；test.hedaodao.ltd走到第二个配置

```sh
http {
 	#....其他属性
 	
 	server {
        listen       80;
        server_name  pro.hedaodao.ltd;

        location / { 
            root   html/pro; 
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
	}

 	server {
        listen       80;
        server_name  test.hedaodao.ltd;

        location / { 
            root   html/test; 
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
	}
}
```

**不同域名，映射到同一静态页面**

server_name匹配规则

- 可以写多个，用空格分开
- 使用通配符（*）
- 使用正则表达式（https://blog.csdn.net/yangyelin/article/details/112976539）

```sh
server {
	listen       80;
	## "\."是转译"."
	server_name  *.hedaodao.ltd  ~^[0-9]+\.hedaodao\.ltd$; 
	#其他配置...
}
```

## 反向代理

**正向代理**

Nginx 不仅可以做反向代理，实现负载均衡。还能用作正向代理来进行上网等功能。 正向代理：如果把局域网外的 Internet 想象成一个巨大的资源库，则局域网中的客户端要访 问 Internet，则需要通过代理服务器来访问，这种代理服务就称为正向代理。

**反向代理**

反向代理，其实客户端对代理是无感知的，因为客户端不需要任何配置就可以访问。

我们只 需要将请求发送到反向代理服务器，由反向代理服务器去选择目标服务器获取数据后，在返 回给客户端，此时反向代理服务器和目标服务器对外就是一个服务器，暴露的是代理服务器 地址，隐藏了真实服务器 IP 地址。

---

启用proxy_pass，root和index字段就会失效

proxy_pass后的地址必须写完整`http://xxx`，不支持https

当访问localhost时（Nginx服务器），网页打开的是`http://xxx`（应用服务器），网页地址栏写的还是localhost

```sh
http{ 		
 	server {
        listen       80;
        server_name  localhost;

        location / {
        	proxy_pass http://xxx;
            #root   html/test; 
            #index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
	}
}
```

**定义地址别名**

使用upstream定义一组地址【在server字段下】 

访问localhost，访问都会代理到`192.168.174.133:80`和`192.168.174.134:80`这两个地址之一，每次访问这两个地址轮着切换（默认权重相等） 

```sh
http{
	upstream httpds{
		server 192.168.174.133:80; #如果是80端口，可以省略不写
		server 192.168.174.134:80;
	}
	
	server {
        listen       80;
        server_name  localhost;

        location / { 
        		proxy_pass http://httpds;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
	}
}
```

## 负载均衡

增加服务器的数量，然后将请求分发到各个服务器上，将原先请求集中到单个服务器上的 情况改为将请求分发到多个服务器上，将负载分发到不同的服务器，也就是我们所说的负 载均衡

客户端发送多个请求到服务器，服务器处理请求，有一些可能要与数据库进行交互，服务器处理完毕后，再将结果返回给客户端。

### 负载均衡策略

**轮询**

默认情况下使用轮询方式，逐一转发，这种方式适用于无状态请求。 

**设置权重weight**

```sh
upstream chocoh {
    server 192.168.174.133:80 weight=1;
    server 192.168.88.128:80 weight=8;
}

server {
        listen       80;
        server_name  192.168.88.128;

        location / {
            root   html;
            proxy_pass   http://chocoh;
            index  index.html index.htm;
}
```

**关闭down**

```sh
upstream httpds{
		server 192.168.174.133:80 weight=10 down;
		server 192.168.174.134:80 weight=80;
}
```

**备用机backup**

如果`192.168.174.133:80`出现故障，无法提供服务，就用使用backup的这个机器

```sh
upstream httpds{
    server 192.168.174.133:80 weight=10;
    server 192.168.174.134:80 weight=80 backup;
}
```

### 其他策略

+ ip_hash 根据客户端的ip地址转发同一台服务器，可以保持回话。 
+ least_conn 最少连接访问 
+ url_hash 根据用户访问的url定向转发请求 
+ fair 根据后端服务器响应时间转发请求 

## 动静分离

当用户请求时，动态请求分配到Tomcat业务服务器，静态资源请求放在Nginx服务器中

例子：

- 如果请求的资源地址是`location/`，`/`的优先级比较低，如果下面的location没匹配到，就会走`http://xxx`这个地址的机器
- 如果请求的资源地址是`location/css/*`，就会被匹配到nginx的html目录下的css文件夹中（我们把css静态资源放在这个位置）

```sh
server {
        listen       80;
        server_name  localhost;
				
		location / { 
			## /的优先级比较低，如果下面的location没匹配到，就会走http://xxx这个地址的机器
        	 proxy_pass http://xxx;
        }
        
        location /css {  
        	## root指的是html，location/css指的是root下的css，所以地址就是html/css
        	root html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
}
```

正则匹配多个目录

```location匹配顺序 多个正则location直接按书写顺序匹配，成功后就不会继续往后面匹配 普通（非正则）location会一直往下，直到找到匹配度最高的（最大前缀匹配） 当普通location与正则location同时存在，如果正则匹配成功,则不会再执行普通匹配 所有类型location存在时，“=”匹配 &gt; “^~”匹配 &gt; 正则匹配 &gt; 普通（最大前缀匹配）sh
location ~*/(js|css|img) {
	root html;
  	index  index.html index.htm;
}
```

location匹配顺序

+ 多个正则location直接按书写顺序匹配，成功后就不会继续往后面匹配 
+ 普通（非正则）location会一直往下，直到找到匹配度最高的（最大前缀匹配） 
+ 当普通location与正则location同时存在，如果正则匹配成功,则不会再执行普通匹配 
+ 所有类型location存在时，“=”匹配 > “^~”匹配 > 正则匹配 > 普通（最大前缀匹配）

alias指定真实路径 

```
location / {
    alias  /chocoh/static/html/
    index  index.html index.htm;
}
```

## UrlRewrite

```sh
rewrite是URL重写的关键指令，根据regex（正则表达式）部分内容，重定向到replacement，结尼是flag标记。

rewrite    <regex>   <replacement>  [flag];
关键字		正则		替代内容     flagt标记

正则：per1森容正则表达式语句进行规则匹配
替代内容：将正则匹配的内容替换成replacement

flag标记说明：
last  #本条规则匹配完成后，继续向下匹配新的1ocation URI规则
break #本条规则匹配完成即终止，不再匹配后面的任何规则

redirect #返回302临重定向，游览器地址会显示跳转后的URL地址
permanent #返回301永久重定向，测览器地址栏会显示跳转后的URL地址
```

浏览器地址栏访问 `xxx/123.html`实际上是访问`xxx/index.jsp?pageNum=123` 

```sh
server {
    listen       80;
    server_name  localhost;

    location / { 
    rewrite ^/([0-9]+).html$ /index.jsp?pageNum=$1  break;
    proxy_pass http://xxx;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
    root   html;
    }
}
```

## 网关服务器

**添加rich规则**

```SH
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="192.168.174.135" port protocol="tcp" port="8080" accept" #这里的192.168.174.135是网关 服务器地址
```

**移除rich规则**

```sh
firewall-cmd --permanent --remove-rich-rule="rule family="ipv4" source address="192.168.174.135" port port="8080" protocol="tcp" accept"
```

**重启**

移除和添加规则都要重启才能生效 

```sh
firewall-cmd --reload
```

**查看所有规则**

```sh
firewall-cmd --list-all #所有开启的规则
```

## 防盗链

当我们请求到一个页面后，这个页面一般会再去请求其中的静态资源，这时候请求头中，会有一个refer字段，表示当前这个请求的来源，我们可以限制指定来源的请求才返回，否则就不返回，这样可以节省资源

```sh
valid_referers none|server_name
```

设置有效的refer值

- none：检测地址没有refer，则有效
- server_name：检测主机地址，refer显示是从这个地址来的，则有效（server_name必须是完整的`http://xxxx`）

注意：`if ($invalid_referer)`中if后有个空格，不写就会报错

```sh
nginx: [emerg] unknown directive "if($invalid_referer)" in /usr/local/nginx/conf/nginx.conf:27
```

例子：这里设置nginx服务器中的img目录下的图片必须refer为http:192.168.174/133才能访问 

```sh
server {
    listen       80;
    server_name  localhost;

    location / { 
    proxy_pass http://xxx;
    }

    location /img{
    valid_referers http:192.168.174/133;
    if ($invalid_referer){#无效的
    return 403;#返回状态码403
    }
    root html;
    index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
    root   html;
    }
}
```

如果引用这张图片的页面且refer并没有被设置，图片无法加载出来

如果直接访问图片地址，因为没有refer字段指向来源，会直接显示Nginx的页面

**设置盗链图片**

将提示图片放在html/img/x.png，访问设置防盗链图片时，就返回这x.png张图 

```sh
location /img{
    valid_referers http:192.168.174/133;
    if ($invalid_referer){
    #无效的
    rewrite ^/  /img/x.png break;
    }
    root html;
    index  index.html index.htm;
}
```

