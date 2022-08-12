# 新手上路

## 准备

本文以 UEFI+GPT 的形式进行安装

### 1. vim 的使用

```bash
vim 1.txt   #创建并编辑名为1.txt的文件
```

```bash
:wq     # 保存退出
:q!     # 不保存，强制退出
dd      # 删除一行
2dd     # 删除两行
gg      # 回到文本第一行
shift+g  # 转到文本最后一行
/xxx    # 在文中搜索内容'xxx' 回车搜索，按n键转到下一个
?xxx   # 反向搜索
```

完整指南可以在终端中输入命令`vimtutor`来查看。

### 2.刻录启动优盘

准备一个 4G 以上的优盘，刻录一个安装启动盘。安装镜像 iso 在[下载页面](https://archlinux.org/download/)下载，还需要在 archlinux 下载页面下载`PGP signature`签名文件(不要从镜像源下载签名文件)，将签名文件和 iso 镜像置于同一文件夹，随后进行对镜像的签名校验，以保证下载的镜像是完整，无错误的，未被篡改的。若你使用 Linux,执行以下命令，确保输出完好的签名。具体镜像名根据名字自行修改。如果你使用其他系统，请自行搜索验证签名的方式。

```bash
gpg --keyserver-options auto-key-retrieve --verify archlinux-202x.0x.01-x86_64.iso.sig
```

------

Windows 下推荐使用[Rufus](https://rufus.ie/)https://github.com/balena-io/etcher)进行优盘刻录。具体操作请自行查阅，都非常简单。

Linux 下可以直接用 dd 命令进行刻录。注意 of 的参数为 sdx,不是 sdx1 sdx2 等。

```bash
sudo dd bs=4M if=/path/to/archlinux.iso of=/dev/sdx status=progress oflag=sync
```

> bs=4M 指定一个较为合理的文件输入输出块大小。
> status=progress 用来输出刻录过程总的信息。
> oflag=sync 用来控制写入数据时的行为特征。确保命令结束时数据及元数据真正写入磁盘，而不是刚写入缓存就返回。

### 3.进入主板 BIOS 进行设置

插入优盘并开机。在开机的时候，按下 F2/F8/F10/DEL 等(取决与你的主板型号，具体请查阅你主板的相关信息)按键，进入主板的 BIOS 设置界面。

### 4.关闭主板设置中的 Secure Boot

在类似名为 `security` 的选项卡中，找到一项名为 Secure Boot(名称可能略有差异)的选项，选择 Disable 将其禁用。

### 5.调整启动方式为 UEFI

在某些旧的主板里，需要调整启动模式为 UEFI,而非传统的 BIOS/CSM。在类似名为 `boot` 的选项卡中，找到类似名为 Boot Mode 的选项，确保将其调整为 UEFI only，而非 legacy/CSM。

### 6.调整硬盘启动顺序

在类似名为 `boot` 的选项卡中，找到类似名为 Boot Options(名称可能略有差异)的设置选项，将 USB 优盘的启动顺序调至首位。

### 7.准备安装

最后保存 BIOS 设置并退出，一般的按键是 F10。此时系统重启，不出意外你应该已经进入 archlinux 的安装界面。

## 基础安装

本节从安装最基础的无图形化 ArchLinux 系统开始。[官方安装指南](https://wiki.archlinux.org/index.php/Installation_guide)

### 1.连接网络

无线连接：

```bash
iwctl                           #执行iwctl命令，进入交互式命令行
device list                     #列出设备名，比如无线网卡看到叫 wlan0
station wlan0 scan              #扫描网络
station wlan0 get-networks      #列出网络 比如想连接YOUR-WIRELESS-NAME这个无线
station wlan0 connect YOUR-WIRELESS-NAME #进行连接 输入密码即可
exit                            #成功后exit退出
```

可以等待几秒等网络建立链接后再进行下面测试网络的操作。

```bash
ping www.baidu.com
```

------

**如果**你不能正常连接网络，首先确认系统已经启用网络接口[[1\]](https://wiki.archlinux.org/index.php/Network_configuration/Wireless#Check_the_driver_status)。

```bash
ip link  #列出网络接口信息，如不能联网的设备叫wlan0
ip link set wlan0 up #比如无线网卡看到叫 wlan0
```

**如果**随后看到类似`Operation not possible due to RF-kill`的报错，继续尝试`rfkill`命令来解锁无线网卡。

```bash
rfkill unblock wifi
```

### 2.更新系统时钟

```bash
timedatectl set-ntp true    #将系统时间与网络时间进行同步
timedatectl status          #检查服务状态
```

### 3.分区

这里总共设置三个分区，是一个**我们认为**较为通用的方案。此步骤会清除磁盘中全部内容，请事先确认。

- EFI 分区[[2\]](https://wiki.archlinux.org/title/EFI_system_partition#Mount_the_partition)： `/efi` 800M
- Swap分区：8G
- 根目录： `/` 100G
- 用户主目录： `/home` 剩余全部

> 这里根目录的大小仅为参考，一般来说个人日常使用的 linux 分配 100G 已经够用了。根目录最小建议不小于 50G，根目录过小会造成无法更新系统软件包等问题。

首先将磁盘转换为 gpt 类型，这里假设比如你想安装的磁盘名称为 sdx。如果你使用 NVME 的固态硬盘，你看到的磁盘名称可能为 nvme0n1。

```bash
lsblk                       #显示分区情况 找到你想安装的磁盘名称
parted /dev/sdx             #执行parted，进入交互式命令行，进行磁盘类型变更
(parted)mktable             #输入mktable
New disk label type? gpt    #输入gpt 将磁盘类型转换为gpt 如磁盘有数据会警告，输入yes即可
quit                        #最后quit退出parted命令行交互
```

接下来使用 cfdisk 命令对磁盘分区。进入 cfdisk 后的操作很直观，用键盘的方向键、Tab 键、回车键配合即可操作分配各个分区的大小与格式。一般建议将 EFI 分区设置为磁盘的第一个分区，据说有些主板如果不将 EFI 设置为第一个分区，可能有不兼容的问题。其中 EFI 分区选择`EFI System`类型，其余两个分区选择`Linux filesystem`类型。

```bash
cfdisk /dev/sdx #来执行分区操作,分配各个分区大小，类型
fdisk -l #分区结束后， 复查磁盘情况
```

### 5.格式化

```bash
mkfs.ext4  /dev/sdax            #格式化根目录和home目录的两个分区
mkfs.vfat  /dev/sdax            #格式化efi分区
```

### 6.挂载

在挂载时，挂载是有顺序的，先挂载根分区，再挂载 EFI 分区。 这里的 sdax 只是例子，具体根据你自身的实际分区情况来。

```bash
mount /dev/sdax  /mnt
mkdir /mnt/efi     #创建efi目录
mount /dev/sdax /mnt/efi
mkdir /mnt/home    #创建home目录
mount /dev/sdax /mnt/home
```

### 7.镜像源的选择

```bash
vim /etc/pacman.d/mirrorlist
```

其中的首行是将会使用的镜像源。添加中科大或者清华的放在最上面即可。

```
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
```

如果其速度不佳，可以手动指定其他镜像源。完整的镜像源列表可参考官方[镜像源生成器](https://archlinux.org/mirrorlist/)。

```bash
Server = https://mirror.archlinux.tw/ArchLinux/$repo/os/$arch   #东亚地区:中华民国
Server = https://mirror.0xem.ma/arch/$repo/os/$arch    #北美洲地区:加拿大
Server = https://mirror.aktkn.sg/archlinux/$repo/os/$arch    #东南亚地区:新加坡
Server = https://archlinux.uk.mirror.allworldit.com/archlinux/$repo/os/$arch    #欧洲地区:英国
Server = https://mirrors.cat.net/archlinux/$repo/os/$arch    #东亚地区:日本
```

### 8.安装系统

必须的基础包

```bash
pacstrap /mnt base base-devel linux linux-headers linux-firmware  #base-devel在AUR包的安装是必须的
```

> 若安装时出现密钥环相关错误，参考此文章[GnuPG-2.1 and the pacman keyring](https://archlinux.org/news/gnupg-21-and-the-pacman-keyring/)并执行其中的命令。
>
> 以上解决方案有时候会提示内存不够，可以编辑`/etc/pacman.conf`，在[core]下添加`SigLevel = Never`

必须的功能性软件

```bash
pacstrap /mnt dhcpcd iwd vim bash-completion   #一个有线所需(iwd也需要dhcpcd) 一个无线所需 一个编辑器 一个补全工具
```

### 9.生成 fstab 文件

fstab 用来定义磁盘分区

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

复查一下 /mnt/etc/fstab 确保没有错误

```bash
cat /mnt/etc/fstab
```

### 10.change root

把环境切换到新系统的/mnt 下

```bash
arch-chroot /mnt
```

### 11.时区设置

设置时区，在/etc/localtime 下用/usr 中合适的时区创建符号连接。如下设置上海时区。

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

随后进行硬件时间设置，将当前的正确 UTC 时间写入硬件时间。

```bash
hwclock --systohc
```

### 12.设置 Locale 进行本地化

Locale 决定了地域、货币、时区日期的格式、字符排列方式和其他本地化标准。

首先使用 vim 编辑 /etc/locale.gen，去掉 en_US.UTF-8 所在行以及 zh_CN.UTF-8 所在行的注释符号（#）。这里需要使用 vim 的寻找以及编辑功能，如果你忘记了，请翻到上一节复习 vim 的操作。

```bash
vim /etc/locale.gen
```

然后使用如下命令生成 locale。

```bash
locale-gen
```

最后向 /etc/locale.conf 导入内容

```bash
echo 'LANG=en_US.UTF-8'  > /etc/locale.conf
```

### 13.设置主机名

首先在`/etc/hostname`设置主机名

```bash
vim /etc/hostname
```

加入你想为主机取的主机名，这里比如叫 myarch。

接下来在`/etc/hosts`设置与其匹配的条目。

```
vim /etc/hosts
```

加入如下内容

```bash
127.0.0.1   localhost
::1         localhost
127.0.1.1   myarch
```

> 某些情况下如不设置主机名，在 KDE 下可能会存在网络情况变更时无法启动 GUI 应用的问题，在终端中出现形如`No protocol specified qt.qpa.xcb: could not connect to display`的错误，这种情况较为少见[[3\]](https://bbs.archlinux.org/viewtopic.php?id=241338)[[4\]](https://bbs.archlinux.org/viewtopic.php?id=243674)[[5\]](https://wiki.archlinux.org/title/Network_configuration#Local_hostname_resolution)。

### 14.为 root 用户设置密码

```bash
passwd root
```

### 15.安装微码

```bash
pacman -S intel-ucode   #Intel
pacman -S amd-ucode     #AMD
```

### 16.安装引导程序

```bash
pacman -S grub efibootmgr   #grub是启动引导器，efibootmgr被 grub 脚本用来将启动项写入 NVRAM。
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB
```

接下来编辑/etc/default/grub 文件，去掉`GRUB_CMDLINE_LINUX_DEFAULT`一行中最后的 quiet 参数，同时把 log level 的数值从 3 改成 5。这样是为了后续如果出现系统错误，方便排错。同时在同一行加入 nowatchdog 参数，这可以显著提高开关机速度。这里需要使用 vim 的编辑功能，如果你忘记了，请翻到上一节复习 vim 的操作。

```bash
vim /etc/default/grub
```

最后生成 GRUB 所需的配置文件

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

> 我们在之前的命令中指定了 bootloader-id 为 GRUB，这一般不会出现问题。然而在某些主板安装完成后，你会发现没有 nvme 启动条目。这是因为某些主板的 UEFI 固件在显示 UEFI NVRAM 引导条目之前，需要在特定的位置存放可引导文件，不支持自定义存放 efi 文件[[6\]](https://wiki.archlinux.org/index.php/GRUB#Default/fallback_boot_path)。解决方式是使用`--removable` 参数解决一些主板 NVRAM 的兼容性问题。

```bash
grub-install --target=x86_64-efi --efi-directory=/efi --removable
grub-mkconfig -o /boot/grub/grub.cfg
```

除此之外，如果你的主板是一些较老的型号，如 intel 9 系列以下或者较老 AMD 的主板，它们很可能不支持从 nvme 启动系统，虽然可以通过修改 BIOS 加入 NVME 支持模块来解决，但这不在本文讨论范围内。

### 17.完成安装

```bash
exit                # 退回安装环境#
umount -R  /mnt     # 卸载新分区
reboot              # 重启
```

注意，重启前要先拔掉优盘，否则你重启后还是进安装程序而不是安装好的系统。重启后，开启 dhcp 服务，即可连接网络

```bash
systemctl start dhcpcd  #立即启动dhcp
ping www.gnu.org      #测试网络连接
```

若为无线链接，则还需要启动 iwd 才可以使用 iwctl 连接网络

```bash
systemctl start iwd #立即启动iwd
iwctl               #和之前的方式一样，连接无线网络
```

到此为止，一个基础的，无 UI 界面的 Arch Linux 已经安装完成了。紧接着下一节，我们来安装图形界面。

> archlinux 在 2021 年 4 月在安装镜像中内置了一个[安装脚本](https://archlinux.org/packages/extra/any/archinstall/)，提供一些选项，即可快速安装。其和所有一键安装脚本类似，提供自动化，且不灵活的安装过程。不建议使用这种安装脚本，除了不灵活的原因，初学者也无法在这种安装过程中学到任何东西。如果你因为任何原因需要快速启动一个基础的 archlinux 环境，那么可以尝试此脚本。

## 魔法学院

### 1.安装

Qv2ray 和 V2rayA 是两款非常优秀的在 Linux 上可用的科学上网通用客户端。你可以把二者都安装，以作备用。其中 V2rayA 是一款浏览器客户端，它可以在服务器等 headless 环境中通过远程在浏览器端访问。Qv2ray 是一款经典的使用 QT 开发的 C/S 架构桌面端软件。

#### v2ray

v2ray 是使用 Qv2ray 以及 V2rayA 的前提。需要先进行安装。在前面[镜像源的选择]()一节中我们提到，读者应该尽快更换非威权国家的镜像源以保障自身的安全，**在此处安装 v2ray 之前是你更换非威权国家的镜像源的最晚时刻**。使用安全的镜像源安装 v2ray。

```bash
sudo pacman -S v2ray
```

如果在你的网络环境下，没有较快速度的或可达的安全镜像源来安装 v2ray,你可以执行如下命令安装 ArchLinuxStudio 为你提供的 v2ray 安装包。

```bash
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/v2ray-4.44.0-1-x86_64.pkg.tar.zst
sudo pacman -U v2ray-4.44.0-1-x86_64.pkg.tar.zst
```

#### V2rayA

V2rayA 是一个浏览器客户端，使用非常方便。由于作者提供了在墙内的下载地址，可以直接在 AUR 进行安装。安装后需启动服务。V2rayA 更新频繁，开发活跃，并且其安装和使用流程都对新手更加友好，推荐新人使用 V2rayA 进行科学上网。

```bash
paru v2raya-bin
sudo systemctl enable --now v2raya
```

随后在 KDE 菜单中搜索 v2raya，点击即可打开浏览器页面。登陆后在其中加入订阅即可使用。更多使用方法请看[官方文档](https://v2raya.org/)与[项目地址](https://github.com/v2rayA/v2rayA)

### Qv2ray 3.0

和上一节中所述相同的原因，由于[中国大陆政府封锁 Github](https://zh.wikipedia.org/wiki/对GitHub的审查和封锁#中华人民共和国)的原因，你很可能没有办法用正常 yay 的方式通过 AUR 安装[Qv2ray 3.0](https://github.com/Shadowsocks-NET/Qv2ray)，所以 ArchLinuxStudio 提供一组可以直接安装的包以供你使用。Qv2ray3.0 的 bin 仓库在于 AUR 的地址: [qv2ray-static-nightly-bin](https://aur.archlinux.org/packages/qv2ray-static-nightly-bin)。 Qv2ray3.0 的动态链接仓库在于 AUR 的地址: [qv2ray-git](https://aur.archlinux.org/packages/qv2ray-git)。Qv2ray 的安装与使用较为复杂，不建议新手使用。需要提醒的是，如果你使用动态链接的 Qv2ray,在其相关依赖更新后，你需要手动重新构建 Qv2ray。

```bash
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/qv2ray-git-3.0.0.rc1.r36.g0f1bf651-1-x86_64.pkg.tar.zst
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/libqv2ray-git-r160.eb10006-1-x86_64.pkg.tar.zst
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/qv2ray-plugin-interface-git-r88.b767b4c-1-x86_64.pkg.tar.zst
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/uvw-2.11.0_libuv_v1.43-1-x86_64.pkg.tar.zst
sudo pacman -U *.pkg.tar.zst
```

> github.io 也被中国大陆政府封锁，只是封锁力度暂时还没有很大。如你在此过程中卡住，可以尝试 ctrl+c 终止命令后重新尝试下载，也可尝试更换手机热点的网络环境再次进行下载。当你配置好全局代理后，你将不再需要担心任何网络封锁问题。我们将持续为本书读者提供突破互联网审查的可靠流程。

安装后在 Plugins 中，选择 V2ray V4 support，并进行 V2ray 的设置。现在你已经可以使用，你需要按照官方文档导入已有的链接或订阅，其余细节请详细阅读 [Qv2ray 的文档](https://qv2ray.net/)。有如下几个注意事项：

- Qv2ray3.0 中 VMESS MD5 与非 0 的 AlterID 的形式已不被支持，若你的机场或节点下发的 AlterID 是非 0 是无法使用的。如果服务端支持，你可将 AlterID 改为 0 来使用 VMessAEAD 形式。

- Qv2ray3.0 已经将机场的默认订阅类型改为规范:SIP008。如果你的机场订阅类型为 base64,则需要在分组->订阅设置->订阅类型 中，将 SIP008 改为 base64,否则你将拿不到任何订阅链接中的节点。

- 如果

  你先前使用过 2.x 的旧版本 Qv2ray ，需要删除旧版 Qv2ray 以及不兼容的配置，同时旧版 Qv2ray 与新版 Qv2ray 不能共存。

  ```bash
  rm -rf ~/.config/qv2ray
  sudo pacman -R qv2ray-dev-git
  ```

- Qv2ray 3.0 与旧版插件不兼容，原有 Qv2ray 2.x 旧版插件不可使用。目前 Qv2ray 3.0 集成了 VMess、Shadowsocks 以及 Trojan 的支持，并通过

  插件仓库

  提供 命令行插件、测速插件、Trojan-Go 和 Naive 的支持。如果你需要使用其中的插件，则需要自行编译，并将其置入目标目录

  ```
  ~.config/qv2ray/plugins/
  ```

  。同时，ArchLinuxStudio 也提供预先为你编译好的插件以方便你的使用。其中的 Trojan-Go 插件目前似乎并不能正常使用，其中的 hostname 以及 port 不能被正常解析

  [1]

  。当然你也可以自行编译插件，在CMakeLists.txt中解除你需要编译的插件的注释，随后进行编译。编译步骤可参考QvPlugins的Actions的

  workflow file

  。

  - [命令行插件](https://archlinuxstudio.github.io/ArchLinuxTutorial/res/QvPlugins/libQvPlugin-Command.so)
  - [测速插件](https://archlinuxstudio.github.io/ArchLinuxTutorial/res/QvPlugins/libQvPlugin-LatencyTest.so)
  - [Trojan-Go](https://archlinuxstudio.github.io/ArchLinuxTutorial/res/QvPlugins/libQvPlugin-TrojanGo.so)
  - [Naive](https://archlinuxstudio.github.io/ArchLinuxTutorial/res/QvPlugins/libQvPlugin-NaiveProxy.so)

### 3. 代理的初步设置

在经过上述步骤后，你应该已经有了 SOCKS5 代理以及 HTTP 代理的地址和端口。本小节描述如何单独为一些程序设置代理，但是需要提醒的是，这不是我们推荐的使用方式，如果你是 Linux 的日常重度使用者，你应该使用后续将会讲述的全局代理方式。

在节点链接后，你可在 KDE 的`系统设置` -> `网络设置` -> `代理`中设置代理。注意，`系统设置`中的代理配置在 KDE 桌面环境中并不是所有应用都会遵守，经过测试，chrome/chromium/brave 浏览器与 steam 等应用会遵循 KDE 的系统代理设置。没有遵循系统设置代理的应用还需要单独进行代理配置。下面说明几种常用的软件中单独配置代理的方式。

- Firefox 浏览器
  火狐浏览器自身的设置选项中存在代理配置，进行配置即可。

- 终端
  可以通过 export 命令设置当前终端的代理方式。比如使用 tldr 或 github raw 等资源需要设置 https 代理。

  ```bash
  export https_proxy=http://127.0.0.1:8889
  export http_proxy=http://127.0.0.1:8889
  export all_proxy=http://127.0.0.1:8889
  ```

  > 不同终端命令所识别的环境变量名不同，如 all_proxy 对 curl 生效，而对 wget 则不生效，具体可查看各个命令的 man page。

- code OSS
  File => Preference => Settings
  搜索 proxy，在其中填入 http 代理地址即可

- proxychains-ng
  如果对于一个应用，KDE 的全局代理不生效，在终端 export 了 ALL_PROXY 变量再用终端启动此应用代理也不生效，并且这个应用自身也没有配置代理的选项，此时可以尝试使用 proxychains-ng，它可以为单行命令配置代理。它是一个预加载的 hook，允许通过一个或多个 SOCKS 或 HTTP 代理重定向现有动态链接程序的 TCP 流量。

  ```bash
  sudo pacman -S proxychains-ng
  sudo vim /etc/proxychains.conf
  ```

  把配置文件中最后一行改为本地代理的 ip 和端口，如`socks5 127.0.0.1 1089`

  proxychains 不能够支持 yay 以及其他一些程序，详见[Incompatible with proxychains](https://github.com/Jguer/yay/issues/429)[proxychains4 with Go lang](https://github.com/rofl0r/proxychains-ng/issues/199)。这种情况可以使用透明代理。

### 4. 更加全面的系统级全局代理

由以上各部分可以看到，为各个软件单独设置代理是很麻烦的。如果你把 Linux 作为主力使用，那么配置透明代理也是必须的，如果你使用 V2rayA,那么可以很方便的在设置中开启全局代理。如果你的技术水平不高，建议你直接使用 V2rayA 的全局代理。如果你使用 Qv2ray，请阅读随后的[透明代理](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/rookie/transparentProxy)一节。

对于全局代理的情况下，开启 UDP 支持，DNS 请求也将被拦截并导入 v2ray 中，更详细的描述将在下节进行。

### 5. 为什么我们不建议使用分流代理？分流代理可能存在什么危险？

分流代理在大多数场景下指的是：在访问国内资源时，使用直连的方式，而在访问国外被墙的资源时，使用代理进行连接。这种网络的使用方式确实会非常方便，但是存在显而易见的危险，然而大众几乎并没有意识到这里的问题。

使用分流代理的方式非常容易泄露你自身的隐私信息，包括但不限于 IP 地址，浏览器以及硬件指纹(几乎可以唯一标记你这一个用户的指纹)等等一系列信息，并且可以将你使用的代理 IP 与你自身的真实 IP 进行对应。

举例来说，一个最常见的例子就是某个国外的网站使用了百度统计脚本，这时你的代理 IP 与真实 IP 的对应信息可以轻松的被这样的网站进行对应，这是非常危险的。 另一个例子就是一些恶意的邮件，比如你在使用国外的邮箱服务，接收到了一个恶意邮件，这个邮件中嵌入了一些国内的资源如图片，那么你的真实 IP 等信息也可以被轻松获取。

真实的例子不止以上两个，还有很多类似的情况存在。我们一直为了大众的隐私与安全而战，希望今后你可以放弃使用分流代理的网络连接方式。

## 使用 Qv2ray+cgproxy 配置透明代理

全局代理，也即透明代理。本节所述为真正的，操作系统级别的代理，而不是仅仅针对浏览器中全部网址的"全局代理"。之所以叫做透明代理，是因为这种系统级别的代理对于操作系统中的各个应用相当于是透明的，应用们感知不到代理的存在。之所以叫做全局代理，很明显意为操作系统级别的、全局的代理。这两个词汇在中文环境中经常同时使用，并且全局代理一词容易引起混淆。

本节主体原文收集自 [Qv2ray 用户组](https://t.me/Qv2ray_chat)，并非原创，我们仅在其基础上进行更新、完善与修正。[cgproxy 项目地址](https://github.com/springzfx/cgproxy)。

### 安装与设置

1. 安装`cgproxy`软件。可直接在 [AUR](https://aur.archlinux.org/packages/cgproxy/) 上安装。由于中国大陆政府封锁 Github 的原因，你很可能没有办法用正常 yay 的方式通过 AUR 安装 cgproxy，所以 ArchLinuxStudio 提供一组可以直接安装的包以供你使用。

```bash
wget https://archlinuxstudio.github.io/ArchLinuxTutorial/res/cgproxy-0.19-1-x86_64.pkg.tar.zst
sudo pacman -U cgproxy-0.19-1-x86_64.pkg.tar.zst
```

> github.io 也被中国大陆政府封锁，只是封锁力度暂时还没有很大。如你在此过程中卡住，可以尝试 ctrl+c 终止命令后重新尝试下载，也可尝试更换手机热点的网络环境再次进行下载。当你配置好全局代理后，你将不再需要担心任何网络封锁问题。我们将持续为本书读者提供突破互联网审查的可靠流程。

1. 在 Qv2ray 的“首选项-入站设置”的下方启用任意门设置选项。

   - 监听 ipv4 地址可填`127.0.0.1` 或 `0.0.0.0`，建议前者。若需双栈代理，则在监听 ipv6 地址填上`::1`（如果监听 ipv4 填了 0.0.0.0 则可不填）。
   - 嗅探选择 Full，Destination Override 的三项均勾选。
   - 模式选择“tproxy”。

   如果是复杂配置，则需要手动添加相应的 dokodemo-door 入站。由于目前版本复杂配置并没有提供 tproxy 选项，因此 tproxy 模式需要通过编辑 json 来实现。

2. 配置`cgproxy`，编辑`/etc/cgproxy/config.json`：

   - **在`cgroup_proxy`中括号里加上"/"（包含引号）**，`port`改为 Qv2ray 首选项里的透明代理的端口。
   - `cgproxy`默认配置是代理所有 tcp 和 udp，ipv4 和 ipv6 的流量，如果不希望代理其中的某种（些）流量，则将对应的`enable_xxx`改为 false。注意这里的配置要和 Qv2ray 选项里的配置一致（如，Qv2ray 选项里没有勾选 udp，则这里务必把`enable_udp`改为 false）。
   - 如果希望当本机作为网关设备时为连接到本机网关的其他设备（如连接到本机开设的 wifi 热点的设备）也提供透明代理，则把`enable_gateway`改为 true。

3. （重要）透明代理的基本原理是拦截系统发出的所有流量，并将这些流量转到代理工具里，从而实现让系统所有流量都走代理的目的。此时，为了避免流量出现死循环（即代理工具发出的流量又转回到代理工具里），需要将代理工具排除在透明代理环境外面。有两种方式可以实现这一点：

   - 通过`execsnoop`监控代理工具的启动，并自动将其移至透明代理环境外面：

     - `cgproxy`软件自带`execsnoop`支持，以上`cgproxy`测试过的发行版均可支持。
     - 编辑`/etc/cgproxy/config.json`，在`program_noproxy`中括号里加上"v2ray","qv2ray"（包含引号和逗号），以使`qv2ray`和`v2ray`发出的流量不经过透明代理。如果你的`v2ray`或`qv2ray`不在`PATH`里，则需要填写它们的绝对路径。

   - 在每次连接代理节点时，让`qv2ray`自己把自己移到透明代理环境外面：

     - 安装 Qvplugin-Command 插件，在插件设置里的“pre-connection”栏里加上一句

       ```
       sh -c "cgnoproxy --pid $(pgrep -x qv2ray)"
       ```

       即可。

4. （重要）如果启用了 udp 的透明代理（dns 也是 udp），则给 v2ray 二进制文件加上相应的特权：

   ```
   sudo setcap "cap_net_admin,cap_net_bind_service=ep" /usr/bin/v2ray
   ```

   否则 udp 的透明代理可能会出问题。

   > 如果每次更新了 v2ray 二进制文件，都需要重新执行此命令。

5. 启动透明代理服务：`systemctl start cgproxy.service`或`systemctl enable --now cgproxy.service`。

以上步骤完成后，透明代理应该能正常使用了。

### dns 配置说明

如果勾选了“dns 拦截”，且启用了 dns 和 udp 的透明代理，则 v2ray 会拦截对系统 dns 的请求，并将其转发到 v2ray 的内置 dns 里，即让 v2ray 内置 dns 接管系统 dns。但 v2ray 内置 dns 是会遵循路由规则的。

如果没勾选“dns 拦截”，则 v2ray 虽然不会让内置 dns 接管系统 dns，但如果启用了 dns 和 udp 的透明代理，则系统 dns 也会走透明代理进 v2ray，并遵循 v2ray 的路由规则。

因此，在启用了 dns 和 udp 的透明代理时，若系统 dns 或 v2ray 的内置 dns 配置不当，可能导致 dns 请求发不出去，从而影响正常上网。

由于 qv2ray 常见的路由规则是绕过国内 ip，国外 ip 均走代理。在这个情形中，以下两个配置是典型的有问题的 dns 配置方式：

- 配置了国外普通 dns 作为首选，但代理本身不支持 udp（此时 dns 查询的 udp 流量出不去，dns 无法查询）
- 配置了使用域名的 doh 作为首选。此时 doh 的域名无法被解析，从而 doh 也无法使用。

一般而言，如果并不在意将 dns 查询发给谁，那么，在绕过国内 ip 的情况下，只需要配置一个国内普通 dns 作为首选即可保证不会出问题。若代理本身不支持 udp，又希望使用国外 dns，则可以考虑使用使用 ip 的 doh（如`https://1.1.1.1/dns-query`等）。

如果需要更复杂的 dns 配置，建议参考[上游文档](https://www.v2ray.com/chapter_02/04_dns.html)，并选择合适的不会影响正常上网的 dns 配置。

------

在显示的为 firefox 等应用设置代理时，因为这些应用程序知道代理的存在，所以不会发出 DNS 请求。而透明代理的情况下，各应用感知不到代理的存在，所以会发出自己的 dns 请求。

这时通过 cgproxy 可将全部 tcp/udp 的流量(包括 DNS 查询)转给 v2ray。由于这种情况下，一定会有 DNS 查询流量的产生，所以为了保证本机不发出任何 DNS 请求(这是为了隐私和安全)，需要进行以下设置。此时需要分两种情况讨论。

- 如果不进行任何 v2ray 的内置 DNS 设置以及 DNS 拦截，那么 DNS 流量会使用本机的 DNS 设置如 8.8.8.8 发出，这种情况不论如何配置 v2ray（全局或者分流），只要保证对于 8.8.8.8 的请求能够通过代理发出即可。

- 如果 v2ray 通过形如如下路由规则，拦截经由 dokodemo-door 接收到的 dns 流量到 dns outbounds，那么 v2ray 是可以导向 DNS 查询流量到"dns-out"的 out bound 的，也即 dns-outbound 进行的"拦截"和"重新转发"。

  ```json
  rules:
  {
  "inboundTag": [
  "tproxy-in-1",
  "tproxy-in-2"
  ],
  "outboundTag": "dns-out",
  "port": "53",
  "type": "field"
  },
  ```

  此时 dns outbound 应该调用内置 DNS 设置进行解析，假如 v2ray 内置 DNS 设置为 1.1.1.1,此时原有对于 8.8.8.8 的 DNS 请求就会转而向 1.1.1.1 请求(随后对 1.1.1.1 的请求还是会遵循你的路由规则的)，并将结果返回给应用端。你可以通过开启 qv2ray 更详细的日志级别进行验证。

如果只是为了阻止本机发 dns 请求，完全可以不使用 fakedns。fakedns 在透明代理的条件下确实可以减少一次 dns 请求，理论上确实会快一点。但是也在有的文章指出如果所有域名都伪造 dns 返回可能会有问题。

题外话：使用 clientIP 可解决使用代理服务器解析 DNS 若返回国外 CDN 的网址时网速慢的情况，但是前提是你信任代理服务器和 DNS 服务器接收你的本地 IP,为了你的安全，不建议使用。

### 常见问题

- 启用透明代理后无法访问任何外网，且 v2ray 的 cpu 占用率飙升

  可能是流量陷入死循环了，检查第 4 步有没有正确配置。如果配置没问题，执行`systemctl status cgproxy.service`看下有没有诸如`info: process noproxy pid msg: xxx`之类的输出。如果没有，则说明 cgproxy 软件或 execsnoop 没有正常工作。注意 cgproxy 软件需要 cgroup v2。

  尝试退出 qv2ray，随后在终端里执行`cgnoproxy qv2ray`看是否恢复正常，如恢复正常，说明 cgproxy 正常工作，只是 execsnoop 没有正常工作。由于 execsnoop 一定程度上依赖于内核，非上述 cgproxy 测试过的发行版用户，建议使用第 4 步中的第 2 种方法。另外，对 kde 用户，5.19+版的 plasma 会给从 krunner 里启动的程序额外设置 cgroup，尽管 cgproxy 软件考虑到了这一点，但仍有极少数场合可能出现 plasma 设置的 cgroup 覆盖掉了 cgproxy 设置的 cgroup 的情况，此时通常重启一下 qv2ray 即可。

- 启用透明代理后，无法访问（部分）域名

  可能是 dns 无法解析（部分）域名。一般这种故障只发生在启用了 dns 及 udp 透明代理的时候。

  终端里执行`dig 无法访问的域名`看下报什么错：

  - 若出现类似`reply from unexpected source: 192.168.0.100#42050, expected 8.8.8.8#53`的报错，则检查第 5 步的有没有正确配置。
  - 若出现类似`connection timed out; no servers could be reache`的报错，则说明 dns 查询的流量出不去，此时往往是系统 dns 或 v2ray 内置 dns 配置不当。请检查是否出现了前文提到的几种不当配置。如果没有勾选“dns 拦截”，则此时 v2ray 虽然不会用内置 dns 接管系统 dns，但它仍然会让系统 dns 走透明代理，从而遵循 v2ray 的路由规则，此时需要检查系统 dns 是否是前文提到的那几种不当配置。

- 能不能分应用代理（如，下载 BT 时不能走代理）

  对于本机的程序，可以，可通过两种方式实现：

  - 通过`cgnoproxy`实现：如，在命令行中执行`cgnoproxy qbittorrent`，启动的 qbittorrent 程序就不会走透明代理。又如，在命令行中执行`cgnoproxy --pid 12345`，执行之后 pid 为 12345 的程序就不再走透明代理。这种方式可支持任何应用。
  - 通过`/etc/cgproxy/config.json`实现：在配置里的`program_noproxy`中括号里加上相应的应用即可。这种方式只支持可执行文件，不支持各种脚本。如希望把 clash 与 kde connect 加入 noproxy 规则，则在把此字段补全成["v2ray", "qv2ray", "clash", "/usr/lib/kdeconnectd"]即可。注意修改`config.json`之后，需要重启 cgproxy 服务才能生效，执行`systemctl restart cgproxy.service`即可。

  对于当本机作为网关设备时为连接到本机网关的其他设备，不行，那些设备的所有流量（到本机的流量除外）都必然会走代理。

- 透明代理环境中响应速度变慢

  由于 iptables 是在域名解析成 ip 之后，才对相应的流量进行重定向。因此，在透明代理环境中，访问一个域名 s 可能会需要解析至少 2 次 dns（系统解析一次，重定向到 v2ray 之后 v2ray 分流模块再解析一次）。因此，响应理论上是会变慢一点的，变慢的幅度取决于系统 dns 及 v2ray 的 dns 的响应速度。

- 开启 UDP 支持后报错`too many open files`

  核心问题是，Linux 系统定义了一系列限制，其中一种限制是最大打开文件数，并且有软限制和硬限制，具体的限制结果可以通过`ulimit -Sa`和`ulimit -Ha`查看。一般来说 arch 默认的软限制 open files 的值为 1024，这个数值太小。硬限制的 open files 的值为 524288，这个数值够大了。打开网页过多，或者开启 udp 加速的时候，连接数（打开的文件数）很容易超过 1024 这个数，所以就被限制住了。解决办法很简单，只需要修改系统级别的关于这个限制的配置文件，在/etc/security/limits.conf 文件的最末尾，加上下面这行，然后重启即可：

  ```bash
  *   soft    nofile  8192  #不要落下了最前面的星号
  ```

  - 使用 docker/libvirt 时与 cgproxy 不能正常使用。解决方法见[cgproxy issue3](https://github.com/springzfx/cgproxy/issues/3#issuecomment-637309706)

## 显卡驱动

现在是 2022 年，显卡驱动的安装在 Arch Linux 上已经变得非常容易。本文区分核芯显卡和独立显卡两大类描述显卡驱动的安装。**注意，确保你已经按照本教程之前的章节安装配置好科学上网、安装好必要的包后再向下进行，不要多个教程混着看，你可能漏掉了本教程前置步骤中的某些操作，从而造成问题。**

> 所有 AMD 显卡建议使用开源驱动。英伟达显卡建议使用闭源驱动，因为逆向工程的开源驱动性能过于低下，本文也只描述英伟达闭源驱动安装。如果你支持自由软件运动，请尽可能使用具有官方支持开源驱动的英特尔和 AMD 显卡。

### 核芯显卡

#### 英特尔核芯显卡

[官网文档](https://wiki.archlinux.org/index.php/Intel_graphics)

英特尔核芯显卡安装如下几个包即可。

```bash
sudo pacman -S mesa lib32-mesa vulkan-intel lib32-vulkan-intel
```

> `xf86-video-intel`arch wiki 里写的很多发行版不建议安装它，而应使用 xorg 的 modesetting 驱动(也就是什么都不用装的意思)。经过我们测试目前确实是默认 modesetting 驱动较为稳定。

注意，只有 Intel HD 4000 及以上的核显才支持 vulkan。

#### AMD 核芯显卡

对于具有核芯显卡的 AMD 处理器，需要先确定核显架构(Architecture)是什么，再决定安装什么驱动。推荐在 [techpowerup 网站](https://www.techpowerup.com/)进行查询，信息非常全面。在确定了显卡架构后，再根据架构对照[这个文档](https://wiki.archlinux.org/index.php/Xorg#AMD)决定安装什么驱动。**对于 GCN2.0 及以下架构的老显卡，直接安装开源 ATI 驱动即可，原本闭源的老旧的 Catalyst 驱动在 2021 年已被废弃。GCN2.0 及以下架构的老显卡也不要使用开源的 AMDGPU 驱动，因为其仅处于实验性质，需要各种自定义内核编译选项与配置，非常麻烦，得不偿失。**对于新型号，即 GCN3 架构及更新型的核芯显卡，直接安装开源驱动 AMDGPU 即可，也就是以下这几个包。

```bash
sudo pacman -S mesa lib32-mesa xf86-video-amdgpu vulkan-radeon lib32-vulkan-radeon libva-mesa-driver lib32-libva-mesa-driver mesa-vdpau lib32-mesa-vdpau
```

- 比如你的笔记本 cpu 是目前常见的 AMD R7 4800U，那么它的核显为 Vega 8。通过查询，可知其为 GCN 5.0 架构，那么对照 arch 官方文档，你可选择安装 AMDGPU 开源驱动。
- 再比如你的台式机 cpu 是目前常见的 锐龙 5 3400G，那么它的核显为 Vega 11。通过查询，可知其为 GCN 5.0 架构，那么对照 arch 官方文档，你可选择安装 AMDGPU 开源驱动。
- 再老一些的 apu A10-9700 处理器 ，它的核显为 Radeon R7。通过查询，可知其为 GCN 2.0 架构，那么对照 arch 官方文档，你选择安装 ATI 开源驱动。

### 独立显卡

这部分会分为仅有独立显卡(无核显)与同时拥有独立显卡和核芯显卡两种情况进行讲解。

#### 英伟达独立显卡

较新型号的独立显卡直接安装如下几个包即可。[官方文档](https://wiki.archlinux.org/index.php/NVIDIA)

```bash
sudo pacman -S nvidia nvidia-settings lib32-nvidia-utils #必须安装
```

如果是 GeForce 630 以上到 GeForce 920 以下的老卡，安装 [nvidia-470xx-dkms](https://aur.archlinux.org/packages/nvidia-470xx-dkms/)AUR及其 32 位支持包。使用 dkms 驱动同时需要 headers。

```bash
yay -S nvidia-470xx-dkms nvidia-settings lib32-nvidia-470xx-utils linux-headers
```

如果是 GeForce 630 以下到 GeForce 400 系列的老卡，安装 [nvidia-390xx-dkms](https://aur.archlinux.org/packages/nvidia-390xx-dkms/)AUR及其 32 位支持包。使用 dkms 驱动同时需要 headers。

```bash
yay -S nvidia-390xx-dkms nvidia-settings lib32-nvidia-390xx-utils linux-headers
```

再老的显卡直接使用[开源驱动](https://wiki.archlinux.org/index.php/Nouveau)即可。

```bash
sudo pacman -S mesa lib32-mesa xf86-video-nouveau
```

------

**在同时拥有核芯显卡和英伟达独立显卡的笔记本上安装驱动是大多数人关注的事情，这里着重讲述。**

> 再次提醒请按照本书前置章节配置好系统后再进行，不要多个教程混看，**尤其是一些过时的教程**。尤其需要注意的是确保 base-devel 包的安装以及配置好科学上网软件，以及使用 X11 模式。

[英伟达双显卡模式官方文档](https://wiki.archlinux.org/index.php/NVIDIA_Optimus) /// [optimus-manager 官方文档](https://github.com/Askannz/optimus-manager/wiki)

若为同时拥有核芯显卡与英伟达独显的笔记本电脑，同样需要按照上述步骤先安装各个软件包。除此之外还需要安装 optimus-manager。可以在核芯显卡和独立显卡间轻松切换。optimus-manager 提供三种模式，分别为仅用独显，仅用核显，和 hybrid 动态切换模式。

```bash
yay -S optimus-manager optimus-manager-qt
```

安装完成后重启即可使用。optimus-manager 安装完成后会默认 enable optimus-manager 的服务，你可在重启前检查其状态，若没有 enable 则手动将其 enable。重启后在菜单栏搜索 optimus-manager 点击即可使用。可在其设置中设置开机自动启动。

```bash
sudo systemctl enable optimus-manager
```

此时你应该已经可以进行显卡切换了，如果有问题，请详细阅读 optimus-manager 的文档，里面有详细的描述。由于各类问题太多，本文不进行描述，optimus-manager 的文档很详尽，请自行查看。此处仅列出几项较为重要的注意事项:

- 如果需要在独显和核显模式间切换，要注意你没安装各类 GPU 监控插件，它们会阻止显卡切换，导致不可预料的错误。
- 不要使用 Nvidia Control Panel 中的`Save to X Configuration file`按钮。会导致配置冲突。
- 在显卡之间的切换时，重新登陆后如在 splash screen 卡住或者黑屏，可以尝试在 tty1 tty2 之间进行切换。
- 如果你在安装 optimus manager 并重启后，直接黑屏卡死，不能进入系统，很有可能是遇到了常见的"ACPI ISSUE"，简单来说，这是笔记本制造商的实现问题。可以尝试在内核启动参数中加入`acpi_osi=! acpi_osi="Windows 2009"` 后再尝试。[[1\]](https://github.com/Askannz/optimus-manager/wiki/FAQ,-common-issues,-troubleshooting#when-i-switch-gpus-my-system-completely-locks-up-i-cannot-even-switch-to-a-tty-with-ctrlaltfx)

最后详细说下动态切换模式。本质上其还是使用官方的 [PRIME](https://wiki.archlinux.org/index.php/PRIME#PRIME_render_offload)对闭源驱动的方法进行切换。需要设置三个环境变量，或者用 nvidia-prime 包提供的命令 prime-run，二者本质也是一样的，都是设置三个环境变量。

```bash
sudo pacman -S nvidia-prime
prime-run some_program #使用prime-run前缀来用独显运行某些程序
```

对于 AMD 核显+N 卡独显的读者，optimus-manager 对于这套组合的支持目前已经发布，最新可用版本为 1.4。

------

**如果你不是强烈追求能效控制以及注重电池寿命的用户，那么可以不用往下看了，如果你是，那么需要针对你的硬件以及笔记本型号尝试正确的电源管理方式。此部分的设置可能导致黑屏，并且尝试过程可能较长，也会遇到各类问题，请根据你个人的操作水平自行斟酌是否操作**

电源控制做的事情是，在只用核显的模式下，确保正确关闭独立显卡。而在混合模式下，绝大多数情况下 Nvidia 模块实际是始终开启的，电源控制并不生效。这件事情其实很复杂，因为对于不同的显卡型号，以及笔记本型号的组合，可行的方案都是不同的。笼统来说，最广泛适用的办法是 bbswitch。但仍不建议上来就按照此方式安装使用，因为某些特定的硬件就是会出问题，也就是黑屏。这里建议按照 optimus-manager 官方的文档一步一步来，按步骤尝试，最后找到属于你自己的电脑合适的电源管理方式。**此[文档](https://github.com/Askannz/optimus-manager/wiki/A-guide--to-power-management-options)必须详细阅读！**

针对大多数笔记本适用的 Bbswitch,此处进行安装使用的讲解。首先安装包 bbswitch。若使用其它内核，则安装包 bbswitch-dkms。

```bash
sudo pacman -S bbswitch #安装 bbswitch 切换方式
```

接下来右键点击 optimus-manager 的托盘设置，在 Optimus 选项卡中的 switch method 选择 Bbswitch 即可。

#### AMD 独立显卡

AMD 独立显卡的驱动安装步骤实际上 AMD 核芯显卡是相同的，都需要先确定架构，然后选定正确的驱动安装即可。真正需要关注的是如何在核芯显卡和独立显卡间进行切换。可以使用 [PRIME](https://wiki.archlinux.org/title/PRIME#For_open_source_drivers_-_PRIME) 对开源驱动的双显卡切换方式。

此外，可以使用 `glmark2`，`DRI_PRIME=1 glmark2` 分别对核显和独显进行测试，选择分数更高的一个进行使用。可以在 steam 游戏的启动前缀中加入`DRI_PRIME=1 mangohud %command%`来使用独显。(关于 [mangohud](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/play/software?id=性能监控))。

笔记本上使用独立显卡运行 steam 游戏的另一个例子。

```bash
DRI_PRIME=1 steam steam://rungameid/570 #运行dota2
DRI_PRIME=1 steam steam://rungameid/730 #运行cs go
```

### 性能测试

[官方文档](https://wiki.archlinux.org/index.php/benchmarking)。

最传统和广为人知的方式为使用`glxgears`命令进行测试，其属于[mesa-utils](https://www.archlinux.org/packages/extra/x86_64/mesa-demos/)包。但其仅仅只能提供简单的测试场景及帧数显示，只测试了当前 OpenGL 功能的一小部分，功能明显不足。我们推荐如下两种工具。

#### glmark2

glmark 提供了一系列丰富的测试，涉及图形单元性能（缓冲，建筑，照明，纹理等）的不同方面，允许进行更全面和有意义的测试。 每次测试单独计算帧速率。 最终，用户根据以前的所有测试获得了一个成绩分数。在 archlinux 上属于包[glmark2](https://aur.archlinux.org/packages/glmark2/)AUR

#### Unigine benchmark

Unigine 3D 引擎是一个更全面的基准测试工具。 截止目前有五个版本，从旧到新分别是

- sanctuary(2007)
- tropics(2008)
- heaven(2009)
- valley(2013)
- superposition(2017)

可从[AUR](https://aur.archlinux.org/packages/?O=0&K=Unigine)下载全部版本。它们均为专有软件。

### 显卡信息查看

对于英伟达显卡，nvidia-settings 这个包即可全面的展示显卡相关信息。

对于 AMD 显卡，稍微麻烦一些，通过 yay 安装 radeon-profile-git 这个包，同时安装其依赖 radeon-profile-daemon，最后启动这个进程。即可以图形化的方式查看 amd 显卡信息。[github 项目地址](https://github.com/marazmista/radeon-profile)

```bash
sudo systemctl enable --now radeon-profile-daemon.service
```

注意，不要对左下角的 auto low high 进行更改 有 bug 会卡死。同时，显存占用在某些型号显卡上展示可能有误。

### 后续

如果作为一个普通使用者，到这里你的系统已经配置完毕了。不会命令行也没太大关系，你可以慢慢探索 KDE 这个桌面环境，记住时常用如下命令或 Discover 软件更新系统即可。

```bash
sudo pacman -Syyu #更新官方仓库
yay -Syyu #同时更新官方仓库与AUR
```

接下来你可以查阅娱乐、办公、多媒体等章节了解更多使用软件的安装与使用。如果你需要成为一名较为专业的人员，那么请阅读进阶、以及编程等章节。

