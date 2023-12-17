## HashMap

### 简介

HashMap底层采用**哈希表**存储数据，是一种对于**增删改查数据性能都较好**的结构。

**哈希值**：根据hashCode方法计算出来的对象的int类型的表现形式。该方法定义在Objext类中，默认使用地址值计算，重写后根据内部属性计算。

+ 数据结构：**数组+链表+红黑树**
+ **由键决定：无序、不重复、无索引**
+ key和value都可以为null
+ 线程不安全
+ 如果键储存引用数据类型，需要重写`hashCode`和`equals`方法。

---

**jdk1.8** 之前 HashMap 由**数组+链表**组成，数组是HashMap的主体，链表则是主要为了解决哈希冲突而存在的。**jdk1.8** 以后在解决哈希冲突时有了较大的变化，当**链表长度大于阈值**（或者红黑树的边界值，默认为 8 ）并且当前**数组的长度大于 64** 时，此时此索引位置上的所有数据改为使用**红黑树**存储。

将链表转换成红黑树前会判断，即便阈值大于 8，但是数组长度小于 64，此时并不会将链表变为红黑树，而是选择逬行数组扩容。

### 哈希冲突

当我们对某个元素进行哈希运算，得到一个存储地址，然后要进行插入的时候，发现已经被其他元素占用了，其实这就是所谓的**哈希冲突**，也叫**哈希碰撞**。

哈希冲突的解决方案有多种:开放定址法（发生冲突，继续寻找下一块未被占用的存储地址），再散列函数法，链地址法，而HashMap即是采用了**链地址法**，也就是**数组+链表**的方式。

### hashCode和equals

在Java中，每个对象都有一个默认的hashCode()方法，用于返回对象的哈希码。哈希码是用来快速判断两个对象是否相等的一种方式。equals()方法用于判断两个对象是否相等。

根据Java规范，如果两个对象使用equals()方法判断为相等，则它们的hashCode()方法应返回相同的值。这是因为在存储和操作对象集合，如HashMap、HashSet等时，会依赖于hashCode()方法的返回值。当我们向集合中添加元素时，程序首先会计算元素的哈希码，并将元素根据哈希码放入对应的位置。此时，如果两个对象使用equals()方法判断为相等，但它们的hashCode()方法返回不同的值，那么它们就会被认为是不同的对象，从而导致无法正确地操作集合。

因此，为了维护hashCode()方法与equals()方法之间的一致性，如果重写了equals()方法，就必须同时重写hashCode()方法，使得equals()方法判断为相等的对象，它们的hashCode()方法返回值也相等。

### 扩容机制

HashMap的扩容机制是通过调整哈希表的容量来实现的。当哈希表中的元素数量达到了负载因子（load factor）乘以容量的阈值时，即超过了临界值，就需要进行扩容操作。 

1. 创建一个新的哈希表，其容量通常为原始容量的**两倍**。
2. **遍历**原始哈希表中的每个桶（bucket），将每个非空桶中的元素**重新分配**到新的哈希表中对应的桶中。
3. 在重新分配元素的过程中，需要使用新的哈希函数计算各元素的哈希值，以确保元素能够被正确地插入到新的哈希表中。
4. 扩容完成后，原始哈希表将被丢弃，新的哈希表成为当前的哈希表。

### 源码分析

#### 元素

**Node**

哈希值、key、value、下一结点

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;

...
```

**TreeNode**

父结点、左子结点、右子结点、颜色

`TreeNode<K,V>`继承`LinkedHashMap.Entry<K,V>`、`LinkedHashMap.Entry<K,V>`又继承`HashMap.Node<K,V>`

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // red-black tree links
        TreeNode<K,V> left;
        TreeNode<K,V> right;
        TreeNode<K,V> prev;    // needed to unlink next upon deletion
        boolean red;

...
```

**table**

记录数组地址值

```java
transient Node<K,V>[] table;
```

**数组默认长度**，1左移4位：16

```java
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
```

**默认加载因子**

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

#### put

**调用无参方法创建HashMap**

默认加载因子赋值

```java
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}
```

**此时table并未赋值**

数组创建时机：添加元素时（put方法）

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

+ 第四个参数表示：键重复，值不保留，会覆盖

+ 调用了hash()方法，计算hash值再做一些额外处理
+ 被覆盖返回覆盖值，没有覆盖返回null

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

参数准备好后传给putVal()方法

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    // 定义局部变量记录数组hash值
    Node<K,V>[] tab;
    // 临时第三方变量，记录键值对地址值
    Node<K,V> p;
    // n表示当前数组长度，i表示索引
    int n, i;
    // table赋值给局部变量，记录数组地址值
    // 第一次创建，数组不存在，赋值为null，执行if中的语句
    if ((tab = table) == null || (n = tab.length) == 0)
        // 调用resize()方法：
        // 1.第一次添加数据，创建默认长度16，加载因子0.75的数组
        // 2.不是第一次添加，判断元素是否达到扩容条件，如果达到了，会吧数组扩容为两倍，并把数据全部转移到新的哈希表中
        // 把当前数组的长度赋值给n
        n = (tab = resize()).length;
    
    
    // 用数组长度跟键的哈希值进行计算，计算出当前键值对对象在数组中应存入的位置
    // 获取数组中对于元素的数据赋值给p
    if ((p = tab[i = (n - 1) & hash]) == null)
        // p == null 创建一个键值对对象，直接放到数组中
        tab[i] = newNode(hash, key, value, null);
    
    
    // p != null 当前位置存在结点
    else {
        Node<K,V> e; K k;
        // 如果键不一样，返回false
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        
        
        // 判断数组中的键值对是否是红黑树的结点
        else if (p instanceof TreeNode)
            // 如果是则调用putTreeVal方法按照红黑树规则将结点添加到树中
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            
            
            // 如果不是则按照链表的方式
            for (int binCount = 0; ; ++binCount) {
                // 下一结点赋值给e
                if ((e = p.next) == null) {
                    // 下一结点为null，创建结点挂在下面
                    p.next = newNode(hash, key, value, null);
                    // 判断链表长度是否超过8，超过则调用treeifyBin方法
                    // treeifyBin方法底层还会判断数组长度是否大于64，如果满足条件则将链表转为红黑树
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                
                
                // 如果哈希值一样，调用equals方法比较内部属性是否相同，相同则break
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        
        
        // 上面break后，e不为null，表示键是一样的，值会被覆盖
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                // 将新值赋值给旧值
                e.value = value;
            afterNodeAccess(e);
            // 返回旧值
            return oldValue;
        }
    }
    // 并发修改异常有关
    ++modCount;
    // 判断是否进行扩容，htreshold记录扩容时机（16*0.75=12）
    if (++size > threshold)
        resize();
    // 与LinkedHashMap有关
    afterNodeInsertion(evict);
    return null;
}
```
## ConcurrentHashMap

### 简介

`ConcurrentHashMap`和`HashMap`一样，是一个存放键值对的容器。使用`hash`算法来获取值的地址，因此时间复杂度是O(1)。查询非常快。 同时，`ConcurrentHashMap`是线程安全的`HashMap`。专门用于多线程环境。 

### jdk1.8

在jdk1.7中是采用`Segment` + `HashEntry` + `ReentrantLock`的方式进行实现的，而1.8中放弃了Segment臃肿的设计，取而代之的是采用`Node` + `CAS` + `Synchronized`来保证并发安全进行实现。 

- JDK1.8的实现降低锁的粒度，JDK1.7版本锁的粒度是基于Segment的，包含多个HashEntry，而JDK1.8锁的粒度就是HashEntry（首节点）
- JDK1.8版本的数据结构变得更加简单，使得操作也更加清晰流畅，因为已经使用synchronized来进行同步，所以不需要分段锁的概念，也就不需要Segment这种数据结构了，由于粒度的降低，实现的复杂度也增加了
- JDK1.8使用红黑树来优化链表，基于长度很长的链表的遍历是一个很漫长的过程，而红黑树的遍历效率是很快的，代替一定阈值的链表，这样形成一个最佳拍档

### 线程安全策略

`ConcurrentHashMap`使用了锁分段技术来提高并发访问性能。具体来说，ConcurrentHashMap将整个数据结构划分为多个段，每个段都有自己的锁。

当一个线程需要对ConcurrentHashMap进行读操作时，它只需要获取相应段的锁（可以理解为数组中的链表或者红黑树），而不会阻塞其他段。这样可以允许多个线程同时进行读操作，提高并发性能。而在写操作时，ConcurrentHashMap会获取整个数据结构的写锁，确保同一时间只有一个线程能够修改数据。

通过这种分段锁的方式，ConcurrentHashMap保证了整个数据结构的线程安全性，同时也提供了较好的并发性能。不过需要注意的是，虽然ConcurrentHashMap提供了线程安全的操作，但在特定场景下仍需要额外的同步措施，例如迭代器遍历时的快照机制。

#### 分段锁

ConcurrentHashMap 中的分段锁称为**Segment**，它的内部结构是维护一个HashEntry数组，同时 Segment 还继承了ReentrantLock。

当需要 put 元素的时候，并不是对整个ConcurrentHashMap进行加锁，而是先通过hashcode来判断它放在哪一个分段中，然后对该分段进行加锁。所以当多线程put的时候，只要不是放在同一个分段中，就可以实现并行的插入。分段锁的设计目的就是为了细化锁的粒度，从而提高并发能力。

#### CAS

**CAS(Compare-And-Swap)：比较并交换**

- CAS就是通过一个原子操作，用预期值去和实际值做对比，如果实际值和预期相同，则做更新操作。
- 如果预期值和实际不同，我们就认为，其他线程更新了这个值，此时不做更新操作。
- 而且这整个流程是原子性的，所以只要实际值和预期值相同，就能保证这次更新不会被其他线程影响。

---

CAS机制中使用了3个基本操作数：内存地址V，旧的预期值A，要修改的新值B。

更新一个变量的时候，只有当变量的预期值A和内存地址V当中的实际值相同时，才会将内存地址V对应的值修改为B。

从思想上来说，**synchronized属于悲观锁**，悲观的认为程序中的并发情况严重，所以严防死守，**CAS属于乐观锁**，乐观地认为程序中的并发情况不那么严重，所以让线程不断去重试更新。 

---

**CAS的缺点：**

+ **CPU开销过大**，并发量比较高的情况下，如果许多线程反复尝试更新某一个变量，却又一直更新不成功，循环往复，会给CPU带来很到的压力。
+ **不能保证代码块的原子性**，CAS机制所保证的知识一个变量的原子性操作，而不能保证整个代码块的原子性。比如需要保证3个变量共同进行原子性的更新，就不得不使用synchronized了。
+  **ABA问题**，这是CAS机制最大的问题所在。ABA问题指的是在CAS机制中，当一个变量从A值经过多次修改后又恢复到了A值，但是这期间可能有其他线程修改了这个变量，导致在使用CAS机制进行检查时会误判为没有被修改。ABA问题可以通过增加版本号（或称为标记位、时间戳等）来避免。每次对变量进行修改时，除了更新变量的值外，还要同时更新版本号，这样在使用CAS机制进行检查时不仅需要比较变量的值是否与预期一致，还需要比较版本号是否相同。如果版本号不同，则说明期间有其他线程修改过变量。 

### 源码分析

#### table

使用**volatile**修饰节点数组，保证其**可见性**，**防止指令重排**，但**不保证原子性**

```java
transient volatile Node<K,V>[] table;
```

#### put

ConcurrentHashMap使用JUC包中通过直接操作内存中的对象，将比较与替换合并为一个原子操作的乐观锁形式（CAS）来进行简单的值替换操作，对于一些含有复杂逻辑的流程对Node节点对象使用synchronize进行同步

1. 首先，根据要存储的key计算出其对应的哈希值。
2. 根据哈希值映射到一个hash桶中。
3. 使用CAS（Compare and Swap）操作检查是否有其他线程正在对该hash桶进行修改。如果有，则将操作切换为使用synchronized关键字来同步访问。
4. 如果没有冲突的话，将当前的Entry插入到hash桶中。
5. 如果在插入新的Entry之前查找到已经存在相同key的Entry，则用新的value替换原来的value。

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    // 获取hash值
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh; K fk; V fv;
        // 如果tab为空则初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        // 如果数组槽位为空
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 以cas方式进行替换，替换成功就中断循环，替换失败则进行下一次循环
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
                break;                   // no lock when adding to empty bin
        }
        // 一种特殊结点
        else if ((fh = f.hash) == MOVED)
            // 帮助扩容
            tab = helpTransfer(tab, f);
        else if (onlyIfAbsent // check first node without acquiring lock
                 && fh == hash
                 && ((fk = f.key) == key || (fk != null && key.equals(fk)))
                 && (fv = f.val) != null)
            return fv;
        // 如果槽位不为空，并且不是forwarding节点
        else {
            V oldVal = null;
            // 利用锁写入数据，锁住整个槽位
            synchronized (f) {
                // 判断槽位中的值是否发生变化，变化则重新走流程
                if (tabAt(tab, i) == f) {
                    // 如果是链表
                    if (fh >= 0) {
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            // 覆盖操作
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            // 新增结点
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key, value);
                                break;
                            }
                        }
                    }
                    // 如果是红黑树
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                              value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                    else if (f instanceof ReservationNode)
                        throw new IllegalStateException("Recursive update");
                }
            }
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    // 转为红黑树
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}
```

#### get

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

根据计算出来的hashcode寻址，如果就在桶上那么直接返回  

如果是红黑树那就按照树的方式获取值

都不满足那就按照链表的方式遍历获取值

#### initTable

初始化容器

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        // sizeCtl，代表着初始化资源或者扩容资源的锁，必须要获取到该锁才允许进行初始化或者扩容的操作
        if ((sc = sizeCtl) < 0)
            // 放弃当前cpu的使用权，让出时间片，线程计入就绪状态参与竞争
            Thread.yield(); // lost initialization race; just spin
        // 比较并尝试将sizeCtl替换成-1，如果失败则继续循环
        else if (U.compareAndSetInt(this, SIZECTL, sc, -1)) {
            try {
                //进行一次double check防止在进入分支前，容器发生了变更
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    //初始化容器
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

#### sizeCtl

+ sizeCtl > 0，数组未初始化，初始容量为16
+ sizeCtl = 0，数组未初始化，记录初始容量
+ sizeCtl = -1，表示table正在初始化
+ sizeCtl < -1，容器正在扩容，有-(n+1)个线程正在参与扩容

```java
private transient volatile int sizeCtl;
```

 