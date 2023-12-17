# SpringSecurity基础

## SpringSecurity简介

### 概述

Spring 是非常流行和成功的 Java 应用开发框架，Spring Security 正是 Spring 家族中的 成员。Spring Security 基于 Spring 框架，提供了一套 Web 应用安全性的完整解决方案。 

正如你可能知道的关于安全方面的两个主要区域是“认证”和“授权”（或者访问控 制），一般来说，Web 应用的安全性包括**用户认证**（Authentication）和**用户授权** （Authorization）两个部分，这两点也是 Spring Security 重要核心功能。 

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>2.0.32</version>
</dependency>
```

### 用户认证和用户授权

+ 用户认证指的是：验证某个用户是否为系统中的合法主体，也就是说用户能否访问 该系统。用户认证一般要求用户提供用户名和密码。系统通过校验用户名和密码来完成认 证过程。通俗点说就是系统认为用户是否能登录
+ 用户授权指的是验证某个用户是否有权限执行某个操作。在一个系统中，不同用户 所具有的权限是不同的。比如对一个文件来说，有的用户只能进行读取，而有的用户可以 进行修改。一般来说，系统会为不同的用户分配不同的角色，而每个角色则对应一系列的 权限。通俗点讲就是系统判断用户是否有权限去做某些事情。

### 攻击防护

- XSS（Cross-site scripting）
- CSRF（Cross-site request forgery）
- CORS（Cross-Origin Resource Sharing）
- SQL注入
- ...

### 权限模型

+ RBAC(Role Based Access Controll) 
+ ACL(Access Controll List) 

### SpringSecurity和Shiro 

**SpringSecurity**

+ 和 Spring 无缝整合。 
+ 全面的权限控制。 
+ 专门为 Web 开发而设计。 
+ + 旧版本不能脱离 Web 环境使用。 
  + 新版本对整个框架进行了分层抽取，分成了核心模块和 Web 模块。单独 引入核心模块就可以脱离 Web 环境。 
+ 重量级。 

**Shiro** 

+ 轻量级。Shiro 主张的理念是把复杂的事情变简单。针对对性能有更高要求 的互联网应用有更好表现。 
+ 通用性。
+ + 好处：不局限于 Web 环境，可以脱离 Web 环境使用。 
  + 缺陷：在 Web 环境下一些特定的需求需要手动编写代码定制。 

## 基本原理

SpringSecurity 本质是一个过滤器链`SecurityFilterChain` ： 

```java
org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFil
ter
org.springframework.security.web.context.SecurityContextPersistenceFilter 
org.springframework.security.web.header.HeaderWriterFilter
org.springframework.security.web.csrf.CsrfFilter
org.springframework.security.web.authentication.logout.LogoutFilter 
org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter 
org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter 
org.springframework.security.web.authentication.ui.DefaultLogoutPageGeneratingFilter
org.springframework.security.web.savedrequest.RequestCacheAwareFilter
org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter
org.springframework.security.web.authentication.AnonymousAuthenticationFilter 
org.springframework.security.web.session.SessionManagementFilter 
org.springframework.security.web.access.ExceptionTranslationFilter 
org.springframework.security.web.access.intercept.FilterSecurityInterceptor
```

代码底层流程：重点看三个过滤器： 

+ FilterSecurityInterceptor：是一个方法级的权限过滤器, 基本位于过滤链的最底部
+ ExceptionTranslationFilter：是个异常过滤器，用来处理在认证授权过程中抛出的异常
+ UsernamePasswordAuthenticationFilter ：对/login 的 POST 请求做拦截，校验表单中用户名，密码 

## 认证：Authentication 

Authentication接口: 它的实现类，表示当前访问系统的用户，封装了用户相关信息。

AuthenticationManager接口：定义了认证Authentication的方法

UserDetailsService接口：加载用户特定数据的核心接口。里面定义了一个根据用户名查询用户信息的方法。

UserDetails接口：提供核心用户信息。通过UserDetailsService根据用户名获取处理的用户信息要封装成UserDetails对象返回。然后将这些信息封装到Authentication对象中。

### 思路分析

**登录**

①自定义登录接口

+ 调用ProviderManager的方法进行认证，如果认证通过生成jwt
+ 把用户信息存入redis中

②自定义UserDetailsService

+ 在这个实现类中去查询数据库

**校验**

①定义Jwt认证过滤器

+  获取token
+  解析token获取其中的userid
+  从redis中获取用户信息
+  存入SecurityContextHolder

### JWT工具类%

```java
package com.chocoh.www.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * JWT工具类
 */
public class JwtUtil {
    /**
     * 有效期（1h）
     */
    public static final Long JWT_TTL = 60 * 60 * 1000L;
    /**
     * 设置秘钥明文
     */
    public static final String JWT_KEY = "chocoh";

    public static String getUuid() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    /**
     * 生成jwt
     */
    public static String createJwt(String subject) {
        JwtBuilder builder = getJwtBuilder(subject, null, getUuid());
        return builder.compact();
    }

    /**
     * 生成jwt（设置超时时间）
     */
    public static String createJwt(String subject, Long ttlMillis) {
        JwtBuilder builder = getJwtBuilder(subject, ttlMillis, getUuid());
        return builder.compact();
    }

    /**
     * 创建token
     */
    public static String createJwt(String id, String subject, Long ttlMillis) {
        JwtBuilder builder = getJwtBuilder(subject, ttlMillis, id);
        return builder.compact();
    }

    private static JwtBuilder getJwtBuilder(String subject, Long ttlMillis, String uuid) {
        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
        SecretKey secretKey = generalKey();
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        if (ttlMillis == null) {
            ttlMillis = JwtUtil.JWT_TTL;
        }
        long expMillis = nowMillis + ttlMillis;
        Date expDate = new Date(expMillis);
        return Jwts.builder()
                // 唯一的ID
                .setId(uuid)
                // 主题,可以是JSON数据
                .setSubject(subject)
                // 签发者
                .setIssuer("ch")
                // 签发时间
                .setIssuedAt(now)
                //使用HS256对称加密算法签名, 第二个参数为秘钥
                .signWith(signatureAlgorithm, secretKey)
                .setExpiration(expDate);
    }

    /**
     * 生成加密后的秘钥 secretKey
     */
    public static SecretKey generalKey() {
        byte[] encodedKey = Base64.getDecoder().decode(JwtUtil.JWT_KEY);
        return new SecretKeySpec(encodedKey, 0, encodedKey.length, "AES");
    }

    /**
     * 解析
     */
    public static Claims parseJwt(String jwt) throws Exception {
        SecretKey secretKey = generalKey();
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(jwt)
                .getBody();
    }
}
```

### 数据库校验用户

#### UserDetailsService

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名查询用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (Objects.isNull(user)) {
            throw new RuntimeException("用户名错误");
        }
        // TODO 根据用户查询权限信息，添加到UserDetails中

        // 返回UserDetails对象
        return new LoginUser(user);
    }
}
```

#### UserDetails%

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser implements UserDetails {
    private User user;
    private List<String> permissions;
    @JSONField(serialize = false)
    private List<GrantedAuthority> authorities;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (authorities != null) {
            return authorities;
        }
        authorities = permissions.stream().
                map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

注意：如果要测试，需要往用户表中写入用户数据，并且如果你想让用户的密码是明文存储，需要在密码前加{noop}。 

### 密码加密存储

实际项目中我们不会把密码明文存储在数据库中。 

+ 默认使用的PasswordEncoder要求数据库中的密码格式为：{id}password 。它会根据id去判断密码的加密方式。但是我们一般不会采用这种方式。所以就需要替换PasswordEncoder。
+ 我们一般使用SpringSecurity为我们提供的BCryptPasswordEncoder。
+ 我们只需要使用把BCryptPasswordEncoder对象注入Spring容器中，SpringSecurity就会使用该PasswordEncoder来进行密码校验。
+ 我们可以定义一个SpringSecurity的配置类，SpringSecurity要求这个配置类要继承WebSecurityConfigurerAdapter。

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

在 Spring Security 5.7.0-M2 中，弃用了 `WebSecurityConfigurerAdapter`，Spring 鼓励用户转向基于组件的安全配置。 

### 登陆登出%

+ 接下我们需要自定义登陆接口，然后让SpringSecurity对这个接口放行，让用户访问这个接口的时候不用登录也能访问。
+ 在接口中我们通过AuthenticationManager的authenticate方法来进行用户认证，所以需要在SecurityConfig中配置把AuthenticationManager注入容器。 
+ 认证成功的话要生成一个jwt，放入响应中返回。并且为了让用户下回请求时能通过jwt识别出具体的是哪个用户，我们需要把用户信息存入redis，可以把用户id作为key。 

```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 关闭csrf
                .csrf().disable()
                // 不通过Session获取SecurityContext
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                // 对于登录接口，允许匿名访问
                .antMatchers("/user/login").anonymous()
                // 除上面外的所有请求全部需要鉴权认证
                .anyRequest().authenticated();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
```

```java
@RequestMapping("/user/login")
public String login(String username, String password) {
    return loginService.login(username, password);
```

```java
@Service
public class LoginServiceImpl implements LoginService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public String login(String username, String password) {
        // 获取Authentication
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        Authentication authenticate = authenticationManager.authenticate(authenticationToken);
        if(Objects.isNull(authenticate)){
            throw new RuntimeException("用户名或密码错误");
        }
        // 使用id生成token
        LoginUser loginUser = (LoginUser) authenticate.getPrincipal();
        String id = loginUser.getUser().getId().toString();
        String jwt = JwtUtil.createJwt(id);
        // 将用户信息存入redis
        redisTemplate.opsForValue().set("test:login:" + id, JSON.toJSONString(loginUser));
        // 把token响应给前端
        return jwt;
    }
    
    @Override
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        Long id = loginUser.getUser().getId();
        redisTemplate.delete("test:login:" + id);
    }
}
```

### 认证过滤器%

+ 我们需要自定义一个过滤器，这个过滤器会去获取请求头中的token，对token进行解析取出其中的id。
+ 使用id去redis中获取对应的LoginUser对象。
+ 然后封装Authentication对象存入SecurityContextHolder 

```java
@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 获取token
        String token = request.getHeader("token");
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }
        // 解析token
        String id;
        try {
            Claims claims = JwtUtil.parseJwt(token);
            id = claims.getSubject();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("token非法");
        }
        // 从redis中获取用户信息
        String json = redisTemplate.opsForValue().get("test:login:" + id);
        LoginUser loginUser = JSON.parseObject(json, LoginUser.class);
        if(Objects.isNull(loginUser)){
            throw new RuntimeException("用户未登录");
        }
        // 存入SecurityContextHolder
        // TODO 获取权限信息封装到Authentication中
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginUser,null,null);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        filterChain.doFilter(request, response);
    }
}
```

```java
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Autowired
    private JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 关闭csrf
                .csrf().disable()
                //不通过Session获取SecurityContext
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                // 对于登录接口 允许匿名访问
                .antMatchers("/user/login").anonymous()
                // 除上面外的所有请求全部需要鉴权认证
                .anyRequest().authenticated()
                .and()
                // 把token校验过滤器添加到过滤器链中
                .addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
```

## 授权：Authorization 

### 基本流程

在SpringSecurity中，会使用默认的FilterSecurityInterceptor来进行权限校验。在FilterSecurityInterceptor中会从SecurityContextHolder获取其中的Authentication，然后获取其中的权限信息。当前用户是否拥有访问当前资源所需的权限。

​ 所以我们在项目中只需要把当前登录用户的权限信息也存入Authentication。

​ 然后设置我们的资源所需要的权限即可。

### 限制访问资源所需权限

SpringSecurity为我们提供了基于注解的权限控制方案，这也是我们项目中主要采用的方式。我们可以使用注解去指定访问对应的资源所需的权限。 

但是要使用它我们需要先开启相关配置。

```java
@EnableGlobalMethodSecurity(prePostEnabled = true)
```

在接口中使用@PreAuthorize注解规定权限

```java
@RequestMapping("/hello")
@PreAuthorize("hasAuthority('test')")
public String hello(){
    return "hello";
}
```

### 封装权限信息%

在查询出用户后还要获取对应的权限信息，封装到UserDetails中返回。

修改之前JwtAuthenticationTokenFilter中的TODO代码

````java
// 获取权限信息封装到Authentication中
UsernamePasswordAuthenticationToken authenticationToken =
    new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
````

修改UserDetailsServiceImpl中的代码

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名查询用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (Objects.isNull(user)) {
            throw new RuntimeException("用户名错误");
        }
        // 根据用户查询权限信息，添加到UserDetails中，例如根据RBAC调用Mapper查询，这里模拟权限
        List<String> list = new ArrayList<>(Collections.singletonList("test"));
        // 返回UserDetails对象
        LoginUser loginUser = new LoginUser();
        loginUser.setUser(user);
        loginUser.setPermissions(list);
        return loginUser;
    }
}
```

### 其它权限校验方法

我们前面都是使用@PreAuthorize注解，然后在在其中使用的是hasAuthority方法进行校验。SpringSecurity还为我们提供了其它方法例如：hasAnyAuthority，hasRole，hasAnyRole等。

这里我们先不急着去介绍这些方法，我们先去理解hasAuthority的原理，然后再去学习其他方法你就更容易理解，而不是死记硬背区别。并且我们也可以选择定义校验方法，实现我们自己的校验逻辑。

+ hasAuthority方法实际是执行到了SecurityExpressionRoot的hasAuthority，大家只要断点调试既可知道它内部的校验原理。它内部其实是调用authentication的getAuthorities方法获取用户的权限列表。然后判断我们存入的方法参数数据在权限列表中。

+ hasAnyAuthority方法可以传入多个权限，只有用户有其中任意一个权限都可以访问对应资源。
+ hasRole要求有对应的角色才可以访问，但是它内部会把我们传入的参数拼接上 ROLE_ 后再去比较。所以这种情况下要用用户对应的权限也要有 ROLE_ 这个前缀才可以。 
+ hasAnyRole有任意的角色就可以访问。它内部也会把我们传入的参数拼接上 ROLE_ 后再去比较。所以这种情况下要用用户对应的权限也要有 ROLE_ 这个前缀才可以。 

### 自定义权限校验方法

```java
@Component("ex")
public class SGExpressionRoot {

    public boolean hasAuthority(String authority){
        //获取当前用户的权限
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        List<String> permissions = loginUser.getPermissions();
        //判断用户权限集合中是否存在authority，自定义其他复杂校验方法
        return permissions.contains(authority);
    }
}
```

在SPEL表达式中使用 @ex相当于获取容器中bean的名字未ex的对象。然后再调用这个对象的hasAuthority方法

```java
@PreAuthorize("@ex.hasAuthority('system:dept:list')")
```

## 异常处理器

我们还希望在认证失败或者是授权失败的情况下也能和我们的接口一样返回相同结构的json，这样可以让前端能对响应进行统一的处理。要实现这个功能我们需要知道SpringSecurity的异常处理机制。

+ 在SpringSecurity中，如果我们在认证或者授权的过程中出现了异常会被**ExceptionTranslationFilter**捕获到。在ExceptionTranslationFilter中会去判断是认证失败还是授权失败出现的异常。
+ 如果是**认证过程**中出现的异常会被封装成**AuthenticationException**然后调用**AuthenticationEntryPoint**对象的方法去进行异常处理。
+ 如果是**授权过程**中出现的异常会被封装成**AccessDeniedException**然后调用**AccessDeniedHandler**对象的方法去进行异常处理。
+ 所以如果我们需要自定义异常处理，我们只需要自定义AuthenticationEntryPoint和AccessDeniedHandler然后配置给SpringSecurity即可。

①自定义实现类

```java
@Component
public class AccessDeniedHandlerImpl implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ResponseResult result = new ResponseResult(HttpStatus.FORBIDDEN.value(), "权限不足");
        String json = JSON.toJSONString(result);
        WebUtils.renderString(response,json);

    }
}
```

```java
@Component
public class AuthenticationEntryPointImpl implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        ResponseResult result = new ResponseResult(HttpStatus.UNAUTHORIZED.value(), "认证失败请重新登录");
        String json = JSON.toJSONString(result);
        WebUtils.renderString(response,json);
    }
}
```

②配置给SpringSecurity

```java
http.exceptionHandling()
    .authenticationEntryPoint(new AuthenticationEntryPointImpl())
    .accessDeniedHandler(new AccessDeniedHandlerImpl());
```

## 跨域

浏览器出于安全的考虑，使用 XMLHttpRequest对象发起 HTTP请求时必须遵守同源策略，否则就是跨域的HTTP请求，默认情况下是被禁止的。 同源策略要求源相同才能正常进行通信，即协议、域名、端口号都完全一致。

前后端分离项目，前端项目和后端项目一般都不是同源的，所以肯定会存在跨域请求的问题。

所以我们就要处理一下，让前端能进行跨域请求。

①先对SpringBoot配置，运行跨域请求 

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
      // 设置允许跨域的路径
        registry.addMapping("/**")
                // 设置允许跨域请求的域名
                .allowedOriginPatterns("*")
                // 是否允许cookie
                .allowCredentials(true)
                // 设置允许的请求方式
                .allowedMethods("GET", "POST", "DELETE", "PUT")
                // 设置允许的header属性
                .allowedHeaders("*")
                // 跨域允许时间
                .maxAge(3600);
    }
}
```

②开启SpringSecurity的跨域访问

```java
//允许跨域
http.cors();
```

## CSRF

CSRF是指跨站请求伪造（Cross-site request forgery），是web常见的攻击之一。

SpringSecurity去防止CSRF攻击的方式就是通过csrf_token。后端会生成一个csrf_token，前端发起请求的时候需要携带这个csrf_token,后端会有过滤器进行校验，如果没有携带或者是伪造的就不允许访问。

我们可以发现CSRF攻击依靠的是cookie中所携带的认证信息。但是在前后端分离的项目中我们的认证信息其实是token，而token并不是存储中cookie中，并且需要前端代码去把token设置到请求头中才可以，所以CSRF攻击也就不用担心了。

## 认证处理器和退出处理器

实际上在UsernamePasswordAuthenticationFilter进行登录认证的时候，如果登录成功了是会调用AuthenticationSuccessHandler的方法进行认证成功后的处理的。如果认证失败了是会调用AuthenticationFailureHandler的方法进行认证失败后的处理的。

我们也可以自己去自定义认证成功处理器和认证失败处理器进相应处理。退出登录处理器原理一样。





