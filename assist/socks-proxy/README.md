### 如何配置socks代理

配置ssh socks代理

```
Host 192.168.197.?, 172.31.160.87
   # 如果用默认端口，这里是 github.com，如果想用443端口，这里就是 ssh.github.com 详见 https://help.github.com/articles/using-ssh-over-the-https-port/
   HostName %h
   Port 22
   User paas
   # 如果是 HTTP 代理，把下面这行取消注释，并把 proxyport 改成自己的 http 代理的端口
   # ProxyCommand socat - PROXY:10.10.80.242:%h:%p,proxyport=6667
   # 如果是 socks5 代理，则把下面这行取消注释，并把 6666 改成自己 socks5 代理的端口
   ProxyCommand nc -v -x 127.0.0.1:2080 %h %p
```