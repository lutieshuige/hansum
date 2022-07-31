## 一：系统搭建

### arch安装

> **启动方式是UEFI而非BIOS（重要）**
>
> **因为EFI分区用的是windows的 而这个区还只有100MB 所以建议借助一些分区工具比如傲梅分区进入PE把这个区扩大 具体操作可以直接百度**

#### 0. 下载 [ISO](https://www.archlinux.org/download/)

#### 1. 硬盘分区

分区使用Windows的磁盘管理就行，没必要用DiskGenius

这里我使用的分区方案是 只额外分一个区来挂载 / 目录 EFI利用Windows的EFI分区

不使用swap分区 而是swap文件

#### 2. 制作启动U盘

制作工具建议使用 [Rufus](https://link.zhihu.com/?target=https%3A//rufus.ie/)，写入方式为DD而非ISO，选项那选择GPT而非默认的MBR

#### 3. BISO设置

保持上一步制作好的启动U盘一直插着

开机出现品牌logo时狂按对应键进入BIOS设置比如我的Matebook就是F2

进去之后：

1. 禁用safeboot 

2. 如果你的硬盘是NVMe的，把 **从硬盘的启动方式** 改成 **AHCI**

3. 修改启动顺序，把U盘的启动顺序放到最上面（此处小心，不要delete任何东西）

完成之后退出重启，重启之后就是选择，回车进入arch iso

#### 4. 检查网络

输入下面指令检查：

```bash
ip a
```

如果你用的是无线连接需要按照下面的步骤连接到无线网：

```bash
iwctl
device list
station wlan0 scan
station wlan0 get-networks
station wlan0 connect WIFI名称
# 接着输入密码
exit
pacman -Syyy
# 使用reflector来获取速度最快的6个镜像，并将地址保存至/etc/pacman.d/mirrorlist
reflector -c China -a 6 --sort rate --save /etc/pacman.d/mirrorlist
```

#### 5. 硬盘

检查硬盘：

```bash
lsblk
```

如果没有看到之前划分好的空间，不要慌，那是因为之前只是划了空间，并没有建立分区

建立分区：

```bash
cfdisk /dev/nvme0n1
# 选择 Free space --> 选择 New 回车 --> 输入分区大小 --> 选择 Write 回车 --> 输入 yes 回车 --> 写入完成 选择 Quit 回车退出

```

检查分区情况：

```bash
lsblk
```

分区格式化：

```bash
mkfs.ext4 /dev/nvm0n1p5
```

挂载分区：

```bash
mount /dev/nvme0n1p5 /mnt
```

检查EFI分区号：

```bash
lsblk
```

建立boot文件夹：

```bash
mkdir /mnt/boot
```

挂载EFI分区：

```bash
mount /dev/nvme0n1p2 /mnt/boot
```

#### 6. 安装基本系统

执行

```bash
pacstrap /mnt base linux linux-firmware nano
```

等待安装完毕

（如果你不想用默认的内核，也可以使用linux-lts, linux-zen, linux-hardened，具体介绍请看[Wiki](https://link.zhihu.com/?target=https%3A//wiki.archlinux.org/index.php/kernel)）

#### 7. 生成fstab文件

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

检查生成的fstab文件

```bash
cat /mnt/etc/fstab
```

#### 8. 正式配置新系统

1.切换到装好的系统

```bash
arch-chroot /mnt
```

2.建立swapfile（建议，没有swap空间无法休眠）

> 在 ext4 上使用 swapfile 的用户请注意，升级到 5.7.x 内核后可能出现诸如「kernel: swapon: swapfile has holes」这样的报错而无法启用 swapfile 。使用 dd 命令创建 swapfile （而非 fallocate） 可能可以解决问题，也可以回退 5.6 系列内核等待上游修复。
> Arch Linux 错误跟踪：[https://bugs.archlinux.org/task/66921](https://link.zhihu.com/?target=https%3A//bugs.archlinux.org/task/66921)
> 内核错误跟踪：[https://bugzilla.kernel.org/sho](https://link.zhihu.com/?target=https%3A//bugzilla.kernel.org/show_bug.cgi%3Fid%3D207585)

如果之前安装的内核是linux-lts：

```bash
fallocate -l 2GB /swapfile
```

注意：命令中是 **小写字母l** 而非 数字1 也非 字母i的大写

如果之前安装的内核不是linux-lts，这里创建swapfile需要使用dd命令：

```bash
dd if=/dev/zero of=/swapfile bs=2048 count=1048576 status=progress
```

这里分了2G作为swapfile

改权限

```bash
chmod 600 /swapfile
```

建立swap空间

```bash
mkswap /swapfile
```

激活swap空间

```bash
swapon /swapfile
```

修改/etc/fstab文件

```bash
nano /etc/fstab
```

到文件末尾输入

```text
/swapfile none swap defaults 0 0
```

保存推出

3.设置时区

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

或

```bash
timedatectl set-timezone Asia/Shanghai
```

同步硬件时钟

```bash
hwclock --systohc
```

4.设置locale

```bash
nano /etc/locale.gen
```

Ctrl+W 输入 #en_US 回车 找到UTF-8那一行 删掉前面的#（取消注释）

Ctrl+W 输入 #zh_CN 回车 找到UTF-8那一行 删掉前面的#（取消注释）

保存退出

生成locale

```bash
locale-gen
```

创建并写入/etc/locale.conf文件

```bash
nano /etc/locale.conf 
```

填入内容，注意这里只能填这个

```bash
LANG=en_US.UTF-8
```

5.创建并写入hostname

```bash
nano /etc/hostname
```

这里我写入的是 arch 作为hostname，你也可以输别的

保存退出

6.修改hosts

```bash
nano /etc/hosts
```

写入内容（中间的空白用tab而非空格），arch替换为你之前在hostname里写入的内容，其他都按照图里面的写（注意最后一行的ip是127.0.1.1）

保存退出

7.为root用户创建密码

```text
passwd
```

然后输入并确认密码（linux终端的密码没有回显，输完直接回车就好）

8.创建启动器

安装基本的包，这里使用grub为启动器

```bash
pacman -S grub efibootmgr networkmanager network-manager-applet dialog wireless_tools wpa_supplicant os-prober mtools dosfstools ntfs-3g base-devel linux-headers reflector git sudo
```

**如果你不知道这些包的作用，请务必确保输入的指令与上面的一致**

检查完毕回车，需要选择直接回车就好，等待安装结束

如果你是intel的cpu，需要安装intel的微码文件

```text
pacman -S intel-ucode
```

如果是amd

```text
pacman -S amd-ucode
```

2021.06.16更新：

> Grub 2.06 更新 os-prober 用户需要手动干预
>
> grub 2.06 更新已经进入官方源，本次更新有以下两个需要注意的变化：
> \1. 如果您正在使用 os-prober 生成其他系统的引导项，grub 2.06 不再自动启用 os-prober，您需要添加 GRUB_DISABLE_OS_PROBER=false 至 /etc/default/grub 配置文件中并且重新运行 grub-mkconfig
> \2. grub 2.06 现在会自动添加 固件设置菜单 引导项目，无需手动创建

鉴于此需要手动启用os-prober来确保Windows能被正确识别：

输入

```text
vim /etc/default/grub
```

在里面找一条空行输入

```text
GRUB_DISABLE_OS_PROBER=false
```

之后:wq回车保存退出

完成之后输入

```bash
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=Arch
```

确保输入指令完全正确回车

生成grub.cfg

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

#### 9. 退出新系统并取消挂载

```bash
exit
```

```bash
unmount -a
reboot
```

启动时请拔出u盘

#### 10. 进入装好的Arch系统并激活网络

进去之后 先输入 root 回车 输入密码 回车

启动网络服务

```text
systemctl enable --now NetworkManager
```

设置WiFi

```text
nmtui
```

选择 `Active a connection`并回车

选择你要连接到的WiFi 输入密码 回车 然后退出

#### 11. 新建用户并授权

```text
useradd -m -G wheel mir
```

wheel后面是你的用户名，这里输入的是mir

为用户创建密码

```text
passwd mir
```

输入并确认密码

#### 12. 安装显卡驱动

```bash
pacman -S nvidia nvidia-utils
```

#### 13. 安装Display Server

这里用的是开源世界最为流行的xorg

```text
pacman -S xorg
```

出现选择直接回车即可

#### 14. 安装Display Manager

这里需要按你要安装的桌面环境而定，这里没有列出的可以自己去ArchWiki查

Gnome：

```text
pacman -S gdm
```

KDE：

```text
pacman -S sddm
```

Xfce || DDE：

```text
pacman -S lightdm lightdm-gtk-greeter
```

设置开机自动启动，以gdm为例：

```text
systemctl enable gdm
```

如果是别的请将这里的gdm替换为你安装的那个dm

#### 15. 安装Desktop Environment

Gnome：

```text
pacman -S gnome
```

KDE：

```text
pacman -S plasma kde-applications packagekit-qt5
```

Xfce：

```text
pacman -S xfce4 xfce4-goodies
```

DDE：

```text
pacman -S deepin deepin-extra
```

同样 需要选择时直接回车

#### 16. 添加archlinuxcn源

```text
nano /etc/pacman.conf
```

在最后加上下面两行（我这里使用了北外的镜像站）

```text
[archlinuxcn]
Server = https://mirrors.bfsu.edu.cn/archlinuxcn/$arch
```

同时取消对multilib源的注释

保存退出之后同步并安装archlinuxcn-keyring

```text
pacman -Syu && pacman -S archlinuxcn-keyring
```

最后不要忘记安装中文的字体，如果这一步不装进去图形界面之后还是要装：

```text
pacman -S ttf-sarasa-gothic noto-fonts-cjk
```

我这里安装的是更纱黑体和noto cjk，包比较大，耐心等待安装完毕。

最后重启

```text
reboot
```

在grub界面选择archlinux回车

当你看到登录界面时，恭喜你，一个相对完整的Arch安装完毕，Enjoy it！

## 二：基本配置

安装完成后，在系统设置、区域设置、语言中添加简体中文语言包，然后在区域选项中选择中文并重新注销即可将语言变更为中文。

manjaro 换源，执行以下命令：

```text
$ sudo pacman-mirrors -c China
```

添加 archlinuxcn 源，获得更多的包：

```text
$ sudo vi /etc/pacman.conf

[archlinuxcn]
SigLevel = Optional TrustAll
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```

更新系统、软件：

```text
$ sudo pacman -Syyu
```

下载 yay AUR 助手或者paru 助手，后续更新系统、下载软件等均可以使用 yay 命令代替 pacman 命令：

```text
$ sudo pacman -S yay
$ sudo pacman -S paru

```

安装 base-devel，yay 命令构建包时会使用到：

```text
$ sudo pacman -S base-devel
```

选择性下载常用终端工具：

```text
$ sudo pacman -S tree python-pip neovim neofetch screenkey figlet iputils

# tree：玩 Linux 的朋友都知道该命令
# python-pip：Python 用户必备
# neovim：vim 党福音
# neofetch：查看系统信息
# screenkey：显示按下的键
# figlet：生成一个 logo
# iputils：允许用户使用 ping 命令
```

双系统共享蓝牙

1. win10 配对蓝牙

2. manjaro配对蓝牙()

3. 切换到win10, 到微软官网下载[PSTools](https://docs.microsoft.com/zh-cn/sysinternals/downloads/psexec)

4. 将压缩包解压，以管理员身份运行cmd,执行以下代码，自动打开注册表

   ```
   psexec.exe -s -i regedit
   ```

5. 找到如下地址

   ```
   HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\BTHPORT\Parameters\Keys\
   ```

6. 记录以下参数

   ```
   f0fdb797276b
   IRK,  dd 68 05 84 5f 4b 50 aa c3 ed 5e 16 f2 35 b9 14
   LTK,  fd e8 01 07 1c 88 b3 1d 36 48 94 20 61 c1 a4 b0
   EDIV, 1103
   ERand,  13410137271075353808
   其中IRK,EDIV和ERand需要10进制
   
   ```

7. 切换至manjaro系统

   ```
   $ sudo -i 
   $ cd /var/lib/bluetooth/
   $ ls
   $ cd A0:51:0B:8D:1A:70
   $ mv F0\:FD\:B7\:97\:27\:6A/ F0\:FD\:B7\:97\:27\:6B/
   $ cd F0\:FD\:B7\:97\:27\:6B/
   $ nano info
   
   [IdentityResolvingKey]
   Key=DD6805845F4B50AAC3ED5E16F235B914
   
   [LongTermKey]
   Key=B0A4C161209448361DB3881C0701E8FD
   EDiv=1103
   Rand=13410137271075353808
   
   LTK: 需要倒叙写入info中
   
   
   
   
   ```

8. 重启系统

   ```
   reboot
   ```

## 三：安装常用软件

### 输入法配置

安装fcitx5

```
sudo pacman -S fcitx5-qt fcitx5-gtk  
```

安装fcitx5配置

```
sudo pacman -S fcitx5-configtool
```

配置编辑 `etc/environment`

```
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
```

如果还不支持请尝试运行`sudo pacman -S fcitx5-im`

### qq

```bash
paru icalingua++
```

### 微信

```bash
paru deepin-wine-wechat
```



### 功耗管理

```
sudo pacman -S tlp
paru tlpui
sudo systemctl enable tlp.server
sudo systemctl start tlp.server
```

### 命令行代理神器

```
sudo pacman -S proxychains-ng
```

然后去改proxychains的配置文件`/etc/proxychains.conf`:

```
socks5 127.0.0.1 1080
```

使用方法：

`proxychains4 wget url` 就可以进行使用了

### node管理神器nvm

由于 nvm 的设计方式，您必须在使用它之前对其进行源代码分析:

```
source /usr/share/nvm/init-nvm.sh
```

您可能希望在您的 shell 启动文件中使用它，例如:

```
echo 'source /usr/share/nvm/init-nvm.sh' >> ~/.bashrc
# 如果在zsh shell 就换成 ~/.zshrc
```

接下来就是使用`nvm`：

```
# 安装最新版本
nvm install --lts
# 设置镜像
npm config set registry https://registry.npm.taobao.org/
npm config get
```

#### 接口测试神器

```bash
paru apipost
```



### Github配置

> 由于linux自带git,所以不需要安装

1. 配置用户名、邮箱

```
git config --global user.name ""
git config --global user.email ""
ssh-keygen -t rsa -C "邮箱"
# 复制密钥
sudo vim ~/.ssh/id_rsa.pub
```

2. 粘贴密钥到主页

3. 关联项目

```
git remote add origin "ssh项目地址"
```

4. 本地项目操作

```
git pull origin master
```

### mongodb

#### 安装配置

```bash
# 1. 安装包
paru mongodb
# 启动服务
sudo systemctl start mongodb.service
# 查看是否启动成功
sudo systemctl status mongodb
# 设置开机启动
sudo systemctl enable mongodb 
```

若显示 **active** 则表示启动成功，否则排查错误：

检查 mongod.service 是否配置为使用正确的数据库位置。添加`--dbpath /var/lib/mongodb` 到 `ExecStart` 行末：

```
ExecStart=***/mongodb.conf --dbpath /var/lib/mongodb
```

然后重启服务

```bash
sudo systemctl restart mongodb.server
```

> **注意**：要防止 system 在90秒后杀死 MongoDB，请编辑 MongoDB.service。
>
> ```
> sudo vim /usr/lib/systemd/system/mongodb.service
> TimeoutStopSec=infinity
> ```

#### 使用

访问 MongoDB Shell：

```bash
mongosh
```

  或者指定了身份验证

```bash
mongosh -u username
```

创建验证账户：

```
mongosh
use admin
db.createUser({
	user:"myUserAdmin",
	pwd:"abc123",
	roles: [{ role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase"]
})
```

将以下内容附加到/etc/monGodb.conf:

```
/etc/mongodb.conf
security:
  authorization: "enabled"
```

[Restart](https://wiki.archlinux.org/title/Restart) `mongodb.service`.

## 四：其他问题

#### 去除GNOME密匙环

先关闭自动登录，然后删除

rm -R /home/lckiss/.local/share/keyrings

重启即可



## nodeJS

- 认识`nodeJS`
- 开发环境搭建
- 模块规范
- `npm`使用
- `nvm`使用
- `yarn`使用
- `ES`模块化写法
- 内置模块`http`
- 内置模块`url`
- 内置模块`fs`
- 内置模块`zlib`
- 路由
- `express`

### 认识`nodeJS`

`nodeJS`是一个基于chrome V8 引擎的 JavaScript 运行环境。

它的优点：

1. 异步非阻塞I/O
2. 特别适用于I/O密集型应用
3. 事件循环机制
4. 单线程
5. 跨平台

它的缺点：

1. 回调地狱
2. 单线程，处理不好CPU密集型任务

应用场景：

1. Web服务API，比如RESTful API
2. 服务器渲染页面
3. 后端的Web服务，比如跨域、服务器端的请求

### 开发环境搭建

安装`node`

### 模块化规范

`nodeJS`起初遵循`common JS`规范，后面也支持`ES`规范

`common JS`格式：

1. 请求`require`
2. 暴露`module.exports`，也等同于`exports`

### npm使用

1. 初始化项目：`npm init -y`

2. 安装包：`npm i xxx` (`npm install xxx --save`的简写形式)

### nvm使用

`node`的版本管理工具

1. 安装最新版：`nvm use --lts`

### ES模块化写法

`package.json`中添加`"type":"module"`

### 内置模块-http

#### 创建服务器

```js
const http = requrie('http')
http.createServer((req,res)=>{
    // 此处可以写入text、html、json等格式，需要通过res.writeHead(200,{})指定`content-type`类型
    res.write()
    res.end()
}).listen(3000)

```

#### jsonp

原理：通过后端拿到前端传递过来的`cb`参数，以`cb(data)`的形式返回给客户端去执行。

#### cors

原理：通过给`ACAO`设置为`*`，来放开浏览器跨域的限制。

### 内置模块-fs

```js
const fs = require("fs")

// 创建文件夹
// 修改文件夹
// 删除文件夹
// 写入文件
// 追加文件内容
// 读取文件
```



### express

基本使用：

```js
const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('hello express!')
})

app.listen(3000)
```

`express`做了以下封装：

1. `app`实例
   1. 基本路由
   2. 中间件（处理回调）
      1. 应用级
      2. 路由级
      3. 错误（放在最后）
      4. 内置
      5. 第三方
2. 响应对象`send`方法
3. 请求对象

   1. 获取`get`请求的参数 `res.query`
   2. 获取`post`请求的参数 `res.body`
   
      1. 假如前端传递参数格式为`application/x-www-form-urlencoded`，需要借助内置中间件`express.urlencoded({extended:false})`
      2. 假如前端传递参数格式为`application/json`，需要借助内置中间件`express.json({extended:false})`      
4. 托管静态资源（中间件形式）
5. 服务器和客户都渲染
   1. 前后端分离
   2. 后端渲染
      1. 配置模板引擎`app.set()`

#### app实例

基本路由：

```js
app.get('/', (req,res)=>{
    
})
app.post('/login', (req,res)=>{
    
})
```

中间件（处理回调）

```js
// 应用级中间件
app.use((req,res,next)=>{
    ...
    next();
})
```

```js
// homeRouter.js
const express = require('express')
const router = express.Router()

router.get('/',(req,res)=>{
    res.send('home');
})
module.exports = router

// index.js
const homeRouter = require('./homeRouter')
app.use(homeRouter)
```

#### 请求对象

获取`get`请求的参数：

```js
res.query
```

获取`post`请求的参数：

```js
// 前端传递application/x-www-form-urlencoded格式参数
express.urlencoded({extended:false})
// 前端传递application/json格式参数
express.json({extended:false})
```

#### 托管静态资源

```js
app.use(express.static('public'))
```

#### 生成器

```
npm i -g express-generator
```

## 数据库

### MongoDB

> 非关系型数据库

首先了解下术语：

| SQL术语/概念 | MongoDB术语/概念 | 解释/说明                            |
| ------------ | ---------------- | ------------------------------------ |
| database     | database         | 数据库                               |
| table        | collection       | 数据库表/集合                        |
| row          | document         | 数据记录行/文档                      |
| column       | field            | 数据字段/域                          |
| index        | index            | 索引                                 |
| table joins  |                  | 表连接。MongoDB不支持                |
| primary key  | primary key      | 主键，MongoDB自动将_id字段设置为主键 |

命令行——数据库操作

```bash
> db
test
> use demo
> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
# show dbs 只能查出来有集合的数据库
# 删除数据库 db.dropDatabase()	
```

命令行——集合操作：

```bash
# 1. 创建集合
> db.createCollection('users')
{ ok: 1 }
# 2. 获取数据库（带集合的）
> show dbs
admin   40.00 KiB
config  60.00 KiB
demo     8.00 KiB
local   72.00 KiB
# 2. 创建并获取集合
demo> db.createCollection('news')
{ ok: 1 }
demo> db.getCollectionNames()
[ 'news', 'users' ]
# 3. 删除集合
demo> db.news.drop()
true
# 4. 插入数据文档
demo> db.users.save({username:'hansum',age:18})
TypeError: db.users.save is not a function
demo> db.users.insert({username:'hansum',age:18})
DeprecationWarning: Collection.insert() is deprecated. Use insertOne, insertMany, or bulkWrite.
{
  acknowledged: true,
  insertedIds: { '0': ObjectId("62e4d48f6b9951789bfc3da3") }
}
demo> db.users.insertOne({username:'hansum',age:18})
{
  acknowledged: true,
  insertedId: ObjectId("62e4d49f6b9951789bfc3da4")
}
# 5. 获取数据文档
demo> db.users.find()
[
  {
    _id: ObjectId("62e4d48f6b9951789bfc3da3"),
    username: 'hansum',
    age: 18
  },
  {
    _id: ObjectId("62e4d49f6b9951789bfc3da4"),
    username: 'hansum',
    age: 18
  }
]
# 6. 插入多条集合文档
demo> db.users.insertMany([{username:'jacob',age:19},{username:'holden',age:20}])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("62e4d5a46b9951789bfc3da5"),
    '1': ObjectId("62e4d5a46b9951789bfc3da6")
  }
}
demo> db.users.find()
[
  {
    _id: ObjectId("62e4d48f6b9951789bfc3da3"),
    username: 'hansum',
    age: 18
  },
  {
    _id: ObjectId("62e4d49f6b9951789bfc3da4"),
    username: 'hansum',
    age: 18
  },
  {
    _id: ObjectId("62e4d5a46b9951789bfc3da5"),
    username: 'jacob',
    age: 19
  },
  {
    _id: ObjectId("62e4d5a46b9951789bfc3da6"),
    username: 'holden',
    age: 20
  }
]
# 7. 删除集合文档
demo> db.users.remove({age:18})
DeprecationWarning: Collection.remove() is deprecated. Use deleteOne, deleteMany, findOneAndDelete, or bulkWrite.
{ acknowledged: true, deletedCount: 2 }
demo> db.users.find()
[
  {
    _id: ObjectId("62e4d5a46b9951789bfc3da5"),
    username: 'jacob',
    age: 19
  },
  {
    _id: ObjectId("62e4d5a46b9951789bfc3da6"),
    username: 'holden',
    age: 20
  }
]
demo> db.users.remove({}) # 此操作是删除所有数据，慎重使用
# 8. 更新集合文档
demo> db.users.update({username:'jacob'},{age:18})
DeprecationWarning: Collection.update() is deprecated. Use updateOne, updateMany, or bulkWrite.
MongoInvalidArgumentError: Update document requires atomic operators
demo> db.users.updateOne({username:'jacob'},{age:18})
MongoInvalidArgumentError: Update document requires atomic operators
demo> db.users.updateOne({username:'jacob'},{$set:{age:18}})
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
demo> db.users.updateOne({username:'holden'},{$inc:{age:10}})
# 9. 查找集合文档
demo> db.users.find({age:{$gt:10}}) # 年龄大于10
demo> db.users.find({age:{$gte:10}}) # 年龄大于等于10
demo> db.users.find({age:{$lt:18}}) # 年龄小于18
demo> db.users.find({age:{$lte:18}}) # 年龄小于等于18
demo> db.users.find({username:/jaco/}) # 名字包含jaco
demo> db.users.find({},{username:1}) # 查询只返回username字段
demo> db.users.find({},{_id:0}) # 查询不返回id字段
demo> db.users.find().sort({age:1}) # 查询age字段正序
demo> db.users.find().sort({age:-1}) # 查询age字段倒序
demo> db.users.find().limit(5) # 查询前五条
demo> db.users.find().skip(10) # 查询十条以后
demo> db.users.find().skip(5).limit(10) # 查询5～10条
demo> db.users.find({}，{$or:[{age:18},{age:19}]}) # 或
demo> db.users.findOne({}) # 第一条数据
demo> db.users.findOne({}).count() # 计数
```

### express中操作

搭建后台环境：

```bash
# 这里利用express生成器自动生成
mkdir mongodb-express-test & cd _
npx express-generator --view=ejs
npm i nodemon
npm start
```

前端页面：

```html
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
    <h1>mongodb的CRUD演示</h1>
    <div>
      <div>用户名 <input type="text" id="username"> </div>
      <div>密码 <input type="password" id="password"> </div>
      <div>年龄 <input type="number" id="age"> </div>
      <div> <button type="submit" id="register">注册</button> </div>
    </div>
    <script>
      register.onclick = () =>{
        console.log(username.value, password.value, age.value);
        fetch('/api/user/add',{
          method:"POST",
          body:JSON.stringify({
            username:username.value,
            password:password.value,
            age:age.value
          }),
          headers:{
            "Content-Type":"application/json"
          }
        }).then(res=>res.json()).then(res=>{
          console.log(res);
        })
      }
    </script>
  </body>
</html>
```

后端编写接口：

```js
// app.js
app.use('/api', usersRouter);

// usersRouter
var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/user/add',(req,res,next)=>{
  console.log(req.body);
  // 插入数据库
  res.send({
    ok:1
  })
})
module.exports = router;
```

安装`mongoose`模块：

```bash
npm i mongoose
```

配置`mongoose`：`mkdir config/db.config.js`

```js
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/hansum_project')
// 插入集合和数据（文档），数据库hansum_project会自动创建
```

引入数据库模块：`bin/www`

```js
// 引入数据库
require('../config/db.config.js')
```

开始写入数据库：

```js
// userRouter
UserModel.create({
    username,
    password,
    age
})
// 1. 创建一个模型（user）————对应数据库的集合（users）
// model/UserModel.js
const Schema = mongoose.Schema
const userType = {
    username:String,
    password:String,
    age:Number
}
const UserModel = mongoose.model('user',new Schema(userType))

module.exports = UserModel
```

### 接口规范

`RESTful`风格：`get`、`post`、`put`、`delete`

### 业务分层

`MVC`：

```
model(servi)		// 处理数据
controllers // 业务逻辑
views		// 展示页面
```

