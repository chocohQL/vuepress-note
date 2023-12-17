# Token

关键词：`token`  `Bearer token`  `JWT`  `Authorization`  `OAuth2`

## 故事背景

故事是这样的：我在学Redis和SpringSecurity的时候，视频和博客中有很多涉及JWT、token的地方，但大多只是在授权实现过程中简单复现了token的使用，引用了相关概念，讲地并不深。

后开我开始搭建简单的项目，考虑到不懂前端，可能没办法实现前端携带token，因此没有使用SpringSecurity。但在搭建初期，刚好有位朋友问我token相关东西，说给后台发请求一种403，当然这不是重点，之后我就想，项目里不放安全框架多没意思，于是我还是上网抄了一段代码：

```javascript
axios.interceptors.request.use((config) => {
    let token = window.sessionStorage.getItem('token');
    token && (config.headers.Authorization = 'Bearer ' + JSON.parse(token));
    return config;
}, (error) => {
    return Promise.reject(error);
});
```

然后我就疑惑了，为什么代码里要在token前拼接'Bearer '字符串呢，于是打开了F12和postman：

![token2](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Web/token2.png)

![token1](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Web/token1.png)

**于是我发出了灵魂拷问：**

为什么token存在Authorization里？

token和JWT有什么关系？

Authorization明明是Headers中的参数，为什么postman中要把它单独出来，还有这么多类型呢？

token和Bearer token有什么区别？

……

下面主要就对这些概念进行梳理总结

## token

Token：Token是一种**用于身份验证和授权的令牌**。在OAuth2中，当用户授权成功后，授权服务器将向客户端发放一个访问令牌（access  token），用于代表用户请求访问资源服务器的权限。Token可以存储用户的身份信息和授权范围，并在请求资源时进行验证。Token可以有不同的类型，如Bearer  Token和JWT。

## JWT

JWT：JWT（JSON  Web  Token）是一种**轻量级的、开放的标准**（RFC  7519），**用于在不同实体之间安全地传输信息**。JWT由三个部分组成：**Header**（头部）、**Payload**（数据负载）和**Signature**（签名部分）。JWT可以承载用户的身份信息和其他相关数据，作为一个**无状态的令牌**，仅依靠签名进行验证。JWT可以在身份验证和单点登录（SSO）等场景中使用。 

### JWT的优点

HTTP本身是一种**无状态的协议**，这就意味着如果用户向我们的应用提供了用户名和密码来进行用户认证，认证通过后HTTP协议不会记录下认证后的状态，那么下一次请求时，用户还要再一次进行认证，因为根据HTTP协议，我们并不知道是哪个用户发出的请求，所以为了让我们的应用能识别是哪个用户发出的请求，我们只能在用户首次登录成功后，在服务器存储一份用户登录的信息，这份登录信息会在响应时传递给浏览器，告诉其保存为cookie，以便下次请求时发送给我们的应用，这样我们的应用就能识别请求来自哪个用户了，这是传统的基于session认证的过程

这种基于token的认证方式相比传统的session认证方式更节约服务器资源，并且对移动端和分布式更加友好。其优点如下： 

+ 支持跨域访问：cookie是无法跨域的，而token由于没有用到cookie(前提是将token放到请求头中)，所以跨域后不会存在信息丢失问题
+ 无状态：token机制在服务端不需要存储session信息，因为token自身包含了所有登录用户的信息，所以可以减轻服务端压力
+ 更适用CDN：可以通过内容分发网络请求服务端的所有资料
+ 更适用于移动端：当客户端是非浏览器平台时，cookie是不被支持的，此时采用token认证方式会简单很多
+ 无需考虑CSRF：由于不再依赖cookie，所以采用token认证方式不会发生CSRF，所以也就无需考虑CSRF的防御

### JWT的认证流程

通俗地说，**JWT的本质就是一个字符串**，它是将用户信息保存到一个Json字符串中，然后进行编码后得到一个**JWT token**，**并且这个JWT token带有签名信息，接收后可以校验是否被篡改**，所以可以用于在各方之间安全地将信息作为Json对象传输。JWT的认证流程如下： 

1. **发送请求：**首先，前端通过Web表单将自己的用户名和密码发送到后端的接口，这个过程一般是一个POST请求。建议的方式是通过SSL加密的传输(HTTPS)，从而避免敏感信息被嗅探
2. **生成JWT：**后端核对用户名和密码成功后，将包含用户信息的数据作为JWT的Payload，将其与JWT Header分别进行Base64编码拼接后签名，形成一个JWT Token，形成的JWT Token就是一个如同lll.zzz.xxx的字符串

```
eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjZWVhZTU0NmNlYzg0ZjNlODQ5MTJmNDUxZjJkOTQyMyIsInN1YiI6IjQiLCJpc3MiOiJjaCIsImlhdCI6MTY5MTA3MTg5MywiZXhwIjoxNjkxMDc1NDkzfQ.hDQM04JZ3FAroeMaeGpwJ74wK9XlPr7qFqINjMzA-oQ
```

### JWT的结构

JWT由3部分组成：标头`Header`、有效载荷`Payload`和签名`Signature`。在传输的时候，会将JWT的3部分分别进行**Base64编码**后用`.`进行连接形成最终传输的字符串 

```java
JWTString=Base64(Header).Base64(Payload).HMACSHA256(base64UrlEncode(header)+"."+base64UrlEncode(payload),secret)
```

#### Header

**JWT头**是一个描述JWT元数据的JSON对象，alg属性表示签名使用的算法，默认为HMAC SHA256（写为HS256）；typ属性表示令牌的类型，JWT令牌统一写为JWT。最后，使用Base64 URL算法将上述JSON对象转换为字符串保存 

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
#### Payload

**有效载荷**部分，是JWT的主体内容部分，也是一个**JSON对象**，包含需要传递的数据。 JWT指定七个默认字段供选择 

```json
iss：发行人
exp：到期时间
sub：主题
aud：用户
nbf：在此之前不可用
iat：发布时间
jti：JWT ID用于标识该JWT
```

这些预定义的字段并不要求强制使用。除以上默认字段外，我们还可以自定义私有字段，**一般会把包含用户信息的数据放到payload中**，如下例： 

```json
{
  "sub": "1234567890",
  "name": "Helen",
  "admin": true
}
```

> 默认情况下JWT是**未加密的**，因为只是采用**base64算法**，拿到JWT字符串后可以转换回原本的JSON数据，任何人都可以解读其内容，因此不要构建隐私信息字段，比如用户的密码一定不能保存到JWT中，以防止信息泄露。JWT只是适合在网络中**传输一些非敏感的信息**

#### Signature

签名哈希部分是对上面两部分数据签名，需要使用base64编码后的header和payload数据，通过指定的算法生成哈希，以确保数据不会被篡改。首先，需要指定一个密钥（secret）。该密码仅仅为保存在服务器中，并且不能向用户公开。然后，使用header中指定的签名算法（默认情况下为HMAC SHA256）根据以下公式生成签名

```java
HMACSHA256(base64UrlEncode(header)+"."+base64UrlEncode(payload),secret)
```

在计算出签名哈希后，JWT头，有效载荷和签名哈希的三个部分组合成一个字符串，每个部分用`.`分隔，就构成整个JWT对象

> 注意JWT每部分的作用，在服务端接收到客户端发送过来的JWT token之后：
>
> header和payload可以直接利用base64解码出原文，从header中获取哈希签名的算法，从payload中获取有效数据
> signature由于使用了不可逆的加密算法，无法解码出原文，它的作用是校验token有没有被篡改。服务端获取header中的加密算法之后，利用该算法加上secretKey对header、payload进行加密，比对加密后的数据和客户端发送过来的是否一致。注意secretKey只能保存在服务端，而且对于不同的加密算法其含义有所不同，一般对于MD5类型的摘要加密算法，secretKey实际上代表的是盐值

### JWT的种类（扩展）

其实JWT(JSON Web Token)指的是一种规范，这种规范允许我们使用JWT在两个组织之间传递安全可靠的信息，JWT的具体实现可以分为以下几种： 

- `nonsecure JWT`：未经过签名，不安全的JWT
- `JWS`：经过签名的JWT
- `JWE`：payload部分经过加密的JWT

## Bearer Token

Bearer  Token（持票人）：Bearer  Token是一种常见的**OAuth2  Access  Token类型**，用于提供简单的、无状态的身份验证。Bearer  Token不需要密钥签名，只需要在请求的"Authorization"头中以"Bearer "开头，携带Token进行验证。Bearer  Token具有**较短的有效期**，需要通过OAuth2的授权服务器进行刷新。Bearer Token的优点是**简单和高效**，但缺点是**安全性相对较弱**。  

**为什么在 Authorization标头里加“Bearer ”：**

这是因为 W3C 的 HTTP 1.0 规范，Authorization 的格式是： 

```
Authorization: <type> <authorization-parameters>
```

Bearer是授权的类型，常见的授权类型还有：

+ Basic 用于 http-basic 认证； 
+ Bearer 常见于 OAuth 和 JWT 授权； 
+ Digest MD5 哈希的 http-basic 认证 (已弃用) 
+ AWS4-HMAC-SHA256 AWS 授权 

Bearer代表Authorization头定义的schema

https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes

```
Authorization:Bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjZWVhZTU0NmNlYzg0ZjNlODQ5MTJmNDUxZjJkOTQyMyIsInN1YiI6IjQiLCJpc3MiOiJjaCIsImlhdCI6MTY5MTA3MTg5MywiZXhwIjoxNjkxMDc1NDkzfQ.hDQM04JZ3FAroeMaeGpwJ74wK9XlPr7qFqINjMzA-oQ
```



## JWT和Bearer Token的区别

经过一系列加密和签名算法之后，JWT变成了一个具有有效期的字符串（Token）,它是前后台信任通信的凭证

这个字符串。你可以把它放在Cookie里面自动发送，但是这样不能跨域，所以更好的做法是放在HTTP请求的头信息Authorization字段里面。

JWT被看作是携带详细信息的，可以作为Bearer token的一种实现，遵循了Bearer token的标准。

**详细区别：**

+ `Bearer Token`是一种**简单的身份验证机制**，它通常由服务器发放给客户端，用于标识客户端是否被授权执行某些操作。
+ `Bearer Token`本质上是一个**字符串**，客户端将其包含在`HTTP`请求的`Authorization`头部中发送到服务器进行身份验证。 
+ `Bearer Token`通常**没有明确的过期时间**，因此每次请求时，服务器都需要重新验证令牌的有效性 
+ `JWT`（JSON Web Token）是一种基于`JSON`的开放标准，用于在各个应用程序之间安全地传输信息。`JWT`通常由三个部分组成：头部、负载和签名。其中头部和负载都是`Base64`编码的`JSON`数据，签名则是使用私钥对头部和负载进行加密后得到的一串字符串。 
+ `JWT`**可以包含过期时间和其他自定义信息**，使得服务器可以更有效地控制访问权限
+ `Bearer Token`和`JWT`虽然都可以用于身份验证和授权，但它们的设计和用途存在很大的差异。`Bearer Token`只是一个简单的字符串，没有任何加密或解密的过程，因此不需要进行数据解密。而`JWT`则是经过加密的数据，需要使用私钥进行解密才能访问其中的负载数据。

## OAuth2

**OAuth2**：OAuth2（开放授权2.0）是一种关于**授权**（authorization）的**开放网络标准** ，**用于让用户授权第三方应用程序访问特定资源**。OAuth2定义了授权服务器、资源服务器和客户端之间的交互流程，通过令牌（token）来进行身份验证和授权。OAuth2主要解决的问题是用户授权和资源访问管理。 

### 四种角色

**资源拥有者（Resource owner） **

>  能够授予对受保护资源的访问权限的实体。当资源所有者是一个人时，它被称为最终用户

**资源服务器（Resource Server）**

> 托管受保护资源的服务器，能够使用访问令牌接受和响应受保护资源请求

**客户端（Client）**

>  代表资源所有者并经其授权发出受保护资源请求的应用程序。“客户”一词确实 不暗示任何特定的实现特征（例如， 应用程序是否在服务器、桌面或其他 设备上执行）。 

**授权服务器（Authorization server）**

> 服务器在成功 验证资源所有者并获得授权后向客户端颁发访问令牌。授权服务器和资源服务器之间的交互超出了本规范的范围。授权服务器 可以是与资源服务器相同的服务器，也可以是单独的实体。 单个授权服务器可以发布多个资源服务器接受的访问令牌。 

### 四种认证模式（扩展）

#### 授权码模式

Authorization Code（授权码模式）

**应用场景**

这种方式是最常用的流程，安全性也最高，它适用于那些有后端的 Web 应用。授权码通过前端传送，令牌则是储存在后端，而且所有与资源服务器的通信都在后端完成。这样的前后端分离，可以避免令牌泄漏

**流程**

1. 用户访问页面
2. 访问的页面将请求重定向到认证服务器
3. 认证服务器向用户展示授权页面，等待用户授权
4. 用户授权，认证服务器生成一个code和带上client_id发送给应用服务器然后，应用服务器拿到code，并用client_id去后台查询对应的client_secret
5. 将code、client_id、client_secret传给认证服务器换取access_token和refresh_token
6. 将access_token和refresh_token传给应用服务器
7. 验证token，访问真正的资源页面

#### 密码模式

Resource Owner Password Credentials Grant（密码模式）

**应用场景**

如果你高度信任某个应用，RFC 6749 也允许用户把用户名和密码，直接告诉该应用。该应用就使用你的密码，申请令牌，这种方式称为"密码式"（password）

**流程**

1. 用户访问用页面时，输入第三方认证所需要的信息(QQ/微信账号密码) 
2. 应用页面那种这个信息去认证服务器授权 
3. 认证服务器授权通过，拿到token，访问真正的资源页面 

#### 隐式授权模式

Implicit Grant (隐式授权模式)

**应用场景**

有些 Web 应用是纯前端应用，没有后端。这时就不能用上面的方式了，必须将令牌储存在前端。RFC 6749 就规定了第二种方式，允许直接向前端颁发令牌。这种方式没有授权码这个中间步骤，所以称为（授权码）“隐藏式”（implicit）

**流程**

1. 用户访问页面时，重定向到认证服务器。 
2. 认证服务器给用户一个认证页面，等待用户授权。 
3. 用户授权，认证服务器想应用页面返回Token 
4. 验证Token，访问真正的资源页面

#### 客户端凭证模式

Client Credentials Grant （客户端凭证模式）

**应用场景**

适用于没有前端的命令行应用，即在命令行下请求令牌

**流程**

1. 用户访问应用客户端
2. 通过客户端定义的验证方法，拿到token，无需授权
3. 访问资源服务器A
4. 拿到一次token就可以畅通无阻的访问其他的资源页面

如果你高度信任某个应用，RFC 6749 也允许用户把用户名和密码，直接告诉该应用。该应用就使用你的密码，申请令牌，这种方式称为"密码式"（password）

## Authorization

在HTTP请求头中，Authorization是用于对HTTP请求进行身份验证的字段。它遵循了基本的**HTTP身份验证规范**。

HTTP身份验证规范定义了一种客户端将其身份验证信息传递给服务器的方法。这通常发生在客户端尝试访问受限资源时。身份验证信息可以是用户名和密码、令牌、证书等。

Authorization字段的值通常由两部分组成：**认证类型**和**凭证**。认证类型指定了用于验证凭证的方法，如基本身份验证（Basic）、摘要身份验证（Digest）、Bearer身份验证等。凭证是经过特定编码方式处理的身份验证信息，根据认证类型的不同，凭证的格式有所差异。

比如，基本身份验证的Authorization字段的值格式为：Basic  \<credentials>，其中\<credentials>是使用Base64编码处理后的"用户名:密码"字符串。

Authorization字段的作用：

1.  身份验证：用于向服务器验证客户端的身份。服务器接收到请求后，会解析Authorization字段，根据其中的凭证信息进行身份验证。如果验证成功，则允许客户端继续访问受限资源；如果验证失败，则返回相应的错误信息。
2.  授权：通过验证身份，服务器可以判断该客户端是否有访问受限资源的权限。根据不同的授权策略，服务器可以决定是否允许客户端访问资源，并返回对应的结果。
3.  安全性：使用Authorization字段，可以在HTTP请求中传递加密的凭证信息，避免了明文传输敏感数据的风险。特别是在使用HTTPS协议时，整个请求都会通过SSL/TLS加密，保证了请求的安全性。

## 总结

+ token指用于身份验证和授权的令牌，是较为宽泛的概念
+ JWT（JSON  Web  Token）可看作token的一种实现方式，用于在不同实体之间安全地传输信息
+ Bearer Token基于OAuth2标准，JWT可以作为Bearer  Token的一种实现方式，可以简单理解为客户端储存的JWT字符串，不关注具体信息
+ OAuth2是一种关于授权的开放网络标准
+ Authorization是基于HTTP标准的身份验证字段，其包含Bearer Token实现

以上概念各自遵照着不同的标准，发挥不同的作用，但又相互关联，共同组成一套网络授权方案。

![token](https://chocoh.oss-cn-guangzhou.aliyuncs.com/assets/Web/token.png)