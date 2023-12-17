# MyBatis-Plus

## MyBatis-Plus简介

MyBatis-Plus（简称 MP）是一个 MyBatis的增强工具，在 MyBatis 的基础上只做增强不做改变，为 简化开发、提高效率而生。

### 特性

+ **无侵入**：只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑
+ **损耗小**：启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象操作
+ **强大的 CRUD 操作**：内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求
+ **支持 Lambda 形式调用**：通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错
+ **支持主键自动生成**：支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题
+ **支持 ActiveRecord 模式**：支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可进行强大的 CRUD 操作
+ **支持自定义全局通用操作**：支持全局通用方法注入（ Write once, use anywhere ）
+ **内置代码生成器**：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用
+ **内置分页插件**：基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询
+ **分页插件支持多种数据库**：支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、Postgre、SQLServer 等多种数据库
+ **内置性能分析插件**：可输出 SQL 语句以及其执行时间，建议开发测试时启用该功能，能快速揪出慢查询
+ **内置全局拦截插件**：提供全表 delete 、 update 操作智能分析阻断，也可自定义拦截规则，预防误操作

### **支持数据库**

任何能使用MyBatis进行 CRUD, 并且支持标准 SQL 的数据库，具体支持情况如下 

+ MySQL，Oracle，DB2，H2，HSQL，SQLite，PostgreSQL，SQLServer，Phoenix，Gauss ， ClickHouse，Sybase，OceanBase，Firebird，Cubrid，Goldilocks，csiidb 
+ 达梦数据库，虚谷数据库，人大金仓数据库，南大通用(华库)数据库，南大通用数据库，神通数据 库，瀚高数据库

### 配置

springboot依赖：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

自动扫描包：

```java
@MapperScan("com/chocoh/www/mapper")
```

配置数据源，开启日志：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/db_mybatis_test?serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=517184867
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.type=com.zaxxer.hikari.HikariDataSource

mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

## 基本CRUD

继承BaseMapper接口

```java
public interface UserMapper extends BaseMapper<User> {
}
```

简单的CRUD

```java
// 新增
userMapper.insert(user);
// 删除
userMapper.deleteById(user);
// 修改
userMapper.updateById(user);
// 查询
userMapper.selectList(null);
userMapper.selectById(1L);
userMapper.selectBatchIds(list);
userMapper.selectByMap(map);
```

## 通用Service

+ 通用 Service CRUD 封装IService接口，进一步封装 CRUD 采用 get 查询单行 remove 删 除 list 查询集合 page 分页 前缀命名方式区分 Mapper 层避免混淆
+ 泛型 T 为任意实体对象
+ 建议如果存在自定义通用 Service 方法的可能，请创建自己的 IBaseService 继承 Mybatis-Plus 提供的基类

继承IService接口

```java
public interface UserService extends IService<User> {
}
```

继承ServiceImpl类，实现对应接口

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}
```

简单的业务

```java
// 查询条数
userService.count();
// 无id则插入，有id则修改
userService.save(user);
userService.saveBatch(users);
// 删除
userService.removeById(1L);
userService.removeBatchByIds(ids);
// ......
```

## 常用注解

### @TableName

类名与表名不一致时

```java
@Data
@TableName("db_user")
public class User {
}
```

批量设置前缀

```properties
mybatis-plus.global-config.db-config.table-prefix=db_
```

### @TableId

MyBatis-Plus在实现CRUD时，会默认将id作为主键列，并在插入数据时，默认 基于雪花算法的策略生成id 

主键名不为"id"时

```java
@TableId(value = "t_id", type = IdType.AUTO)
private int id;
```

+ value属性对应主键
+ type属性定义主键策略
+ + `IdType.ASSIGN_ID`（默 认）基于雪花算法的策略生成数据id，与数据库id是否设置自增无关 
  + `IdType.AUTO`使用数据库的自增策略，注意，该类型请确保数据库设置了id自增， 否则无效 

配置全局主键策略

```properties
mybatis-plus.global-config.db-config.id-type=auto
```

### 雪花算法

雪花算法是由Twitter公布的分布式主键生成算法，它能够保证不同表的主键的不重复性，以及相同表的 主键的有序性。 

①核心思想： 长度共64bit（一个long型）。 

+ 首先是一个符号位，1bit标识，由于long基本类型在Java中是带符号的，最高位是符号位，正数是0，负 数是1，所以id一般是正数，最高位是0。 
+ 41bit时间截(毫秒级)，存储的是时间截的差值（当前时间截 - 开始时间截)，结果约等于69.73年。 
+ 10bit作为机器的ID（5个bit是数据中心，5个bit的机器ID，可以部署在1024个节点）。 
+ 12bit作为毫秒内的流水号（意味着每个节点在每毫秒可以产生 4096 个 ID）。 

②优点：整体上按照时间自增排序，并且整个分布式系统内不会产生ID碰撞，并且效率较高。 

### @TableField

实体类属性名和表字段名不一致

```java
@TableField("username")
private String name;
```

### @TableLogic

逻辑删除 

+ 物理删除：真实删除，将对应数据从数据库中删除，之后查询不到此条被删除的数据 
+ 逻辑删除：假删除，将对应数据中代表是否被删除字段的状态修改为“被删除状态”，之后在数据库 中仍旧能看到此条数据记录，使用场景：可以进行数据恢复 

数据库中创建逻辑删除状态列，设置默认值为0，实体类中添加逻辑删除属性

```java
@TableLogic
private Integer idDeleted;
```

被逻辑删除的数据默认不会被查询

## 条件构造器和常用接口

### wapper 

Wrapper ： 条件构造抽象类，最顶端父类 

+ AbstractWrapper ： 用于查询条件封装，生成 sql 的 where 条件 
+ + QueryWrapper ： 查询条件封装 
  + UpdateWrapper ： Update 条件封装 
  + AbstractLambdaWrapper ： 使用Lambda 语法 
  + + LambdaQueryWrapper ：用于Lambda语法使用的查询Wrapper 
    + LambdaUpdateWrapper ： Lambda 更新封装Wrapper 

#### QueryWrapper 

##### 组装查询条件

```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
List<User> users = userMapper.selectList(queryWrapper
        .like("username", "chocoh")
        .between("age", 20, 30)
        .isNotNull("email"));
```

##### 组装排序条件

```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
List<User> users = userMapper.selectList(queryWrapper
        .orderByDesc("age")
        .orderByAsc("id"));
```

##### 组装删除条件

```java
userMapper.delete(new QueryWrapper<User>()
        .isNull("email"));
```

##### 条件的优先级

```java
User user = new User();
user.setPassword("123456");
// WHERE (username LIKE ? AND age > ? OR email IS NULL)
userMapper.update(user, new QueryWrapper<User>()
        .like("username", "c")
        .gt("age", 20)
        .or()
        .isNull("email"));
// WHERE (username LIKE ? AND (age > ? OR email IS NULL))
userMapper.update(user, new QueryWrapper<User>()
        .like("username", "c")
        .and(i -> i.gt("age", 20).or().isNull("email")));
```

##### 组装select语句

```java
// 只查询username和age字段
List<Map<String, Object>> maps = userMapper.selectMaps(new QueryWrapper<User>()
        .select("username", "age"));
```

##### 子查询

```java
List<User> users = userMapper.selectList(new QueryWrapper<User>()
                .inSql("id", "select id form user where id >= 10"));
```

##### condition

```java
List<User> users = userMapper.selectList(new QueryWrapper<User>()
        .like(StringUtils.isNotBlank(username), "username", "c")
        .ge(ageBegin != null, "age", ageBegin)
        .le(ageEnd != null, "age", ageEnd));
```

#### UpdateWrapper

```java
userMapper.update(null, new UpdateWrapper<User>()
        .set("age", 18)
        .set("username", "chocoh")
        .like("username", "c")
        .and(i -> i.gt("age", 20).or().isNull("email")));
```

#### LambdaQueryWrapper

```java
userMapper.selectList(new LambdaQueryWrapper<User>()
        .like(StringUtils.isNotBlank(username), User::getUsername, "c")
        .ge(ageBegin != null, User::getAge, ageBegin)
        .le(ageEnd != null, User::getAge, ageEnd));
```

#### LambdaUpdateWrapper 

```java
userMapper.update(null, new LambdaUpdateWrapper<User>()
        .set(User::getAge, 18)
        .set(User::getUsername, "chocoh")
        .like(User::getUsername, "c")
        .and(i -> i.gt(User::getAge, 20).or().isNull(User::getEmail)));
```

## 插件

### 分页插件

```java
@Configuration
public class MyBatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

```java
Page<User> userPage = userMapper.selectPage(new Page<User>(1, 5), null);
List<User> list = userPage.getRecords();
System.out.println("当前页："+userPage.getCurrent());
System.out.println("每页显示的条数："+userPage.getSize());
System.out.println("总记录数："+userPage.getTotal());
System.out.println("总页数："+userPage.getPages());
System.out.println("是否有上一页："+userPage.hasPrevious());
System.out.println("是否有下一页："+userPage.hasNext());
```

### xml自定义分页

```java
Page<User> selectPageVo(@Param("page") Page<User> page, @Param("age") Integer age);
```

```xml
<sql id="BaseColumns">id,username,age,email</sql>
<select id="selectPageVo" resultType="User">
	SELECT <include refid="BaseColumns"></include> FROM t_user WHERE age > #{age}
</select>
```

### 乐观锁

> 一件商品，成本价是80元，售价是100元。老板先是通知小李，说你去把商品价格增加50元。小 李正在玩游戏，耽搁了一个小时。正好一个小时后，老板觉得商品价格增加到150元，价格太 高，可能会影响销量。又通知小王，你把商品价格降低30元。 
>
> 此时，小李和小王同时操作商品后台系统。小李操作的时候，系统先取出商品价格100元；小王 也在操作，取出的商品价格也是100元。小李将价格加了50元，并将100+50=150元存入了数据 库；小王将商品减了30元，并将100-30=70元存入了数据库。是的，如果没有锁，小李的操作就 完全被小王的覆盖了。 
>
> 现在商品价格是70元，比成本价低10元。几分钟后，这个商品很快出售了1千多件商品，老板亏1 万多。
>
> 上面的故事，如果是乐观锁，小王保存价格前，会检查下价格是否被人修改过了。如果被修改过 了，则重新取出的被修改后的价格，150元，这样他会将120元存入数据库。 
>
> 如果是悲观锁，小李取出数据后，小王只能等小李操作完之后，才能对价格进行操作，也会保证 最终的价格是120元**。**

**乐观锁实现流程** 

数据库中添加version字段 取出记录时，获取当前version   

更新时，version + 1，如果where语句中的version版本不对，则更新失败 

```java
@Version
private Integer version;
```

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```

可以增加自旋锁保证业务执行

## 通用枚举

```java
@Getter
public enum SexEnum {
    MALE(1, "男"),
    FEMALE(2, "女");
    
    // 设置性别信息为枚举项，会将@EnumValue注解所标识的属性值存储到数据库
    @EnumValue
    private Integer sex;
    private String sexName;

    SexEnum(Integer sex, String sexName) {
        this.sex = sex;
        this.sexName = sexName;
    }
}
```

```properties
mybatis-plus.type-enums-package=com/chocoh/www/enums
```

```java
user.setSex(SexEnum.MALE);
// INSERT INTO t_user ( username, age, sex ) VALUES ( ?, ?, ? )
userMapper.insert(user);
```

## 代码生成器

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.1</version>
</dependency>
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.31</version>
</dependency>
```

```java
FastAutoGenerator.create("url", "username", "password")
    .globalConfig(builder -> {
        builder.author("baomidou") // 设置作者
            .enableSwagger() // 开启 swagger 模式
            .fileOverride() // 覆盖已生成文件
            .outputDir("D://"); // 指定输出目录
    })
    .dataSourceConfig(builder -> builder.typeConvertHandler((globalConfig, typeRegistry, metaInfo) -> {
        int typeCode = metaInfo.getJdbcType().TYPE_CODE;
        if (typeCode == Types.SMALLINT) {
            // 自定义类型转换
            return DbColumnType.INTEGER;
        }
        return typeRegistry.getColumnType(metaInfo);

    }))
    .packageConfig(builder -> {
        builder.parent("com.baomidou.mybatisplus.samples.generator") // 设置父包名
            .moduleName("system") // 设置父包模块名
            .pathInfo(Collections.singletonMap(OutputFile.xml, "D://")); // 设置mapperXml生成路径
    })
    .strategyConfig(builder -> {
        builder.addInclude("t_simple") // 设置需要生成的表名
            .addTablePrefix("t_", "c_"); // 设置过滤表前缀
    })
    .templateEngine(new FreemarkerTemplateEngine()) // 使用Freemarker引擎模板，默认的是Velocity引擎模板
    .execute();
```

查看官网

## 多数据源

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
    <version>3.5.0</version>
</dependency>
```

```yaml
spring:
  ## 配置数据源信息
  datasource:
    dynamic:
      ## 设置默认的数据源或者数据源组,默认值即为master
      primary: master
      ## 严格匹配数据源,默认false.true未匹配到指定数据源时抛异常,false使用默认数据源
      strict: false
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/mybatis_plus?characterEncoding=utf-8&useSSL=false
          driver-class-name: com.mysql.cj.jdbc.Driver
          username: root
          password: 123456
        slave_1:
          url: jdbc:mysql://localhost:3306/mybatis_plus_1?characterEncoding=utf-8&useSSL=false
          driver-class-name: com.mysql.cj.jdbc.Driver
          username: root
          password: 123456
```

```java
@DS("master")
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}

@DS("slave_1")
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {
}
```