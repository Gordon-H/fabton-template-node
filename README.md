### 简介
采用fabric的node sdk封装了区块链钱包、CA、合约调用等功能，提供restful API供业务后台调用。  
此程序可以部署到各个企业内部，由各企业自己维护CA、钱包等功能，保障隐私性。  

### 目录说明
application:应用程序代码，提供restful API供后台业务程序调用  
contract:合约代码，使用Node.js编写，需要预先安装到节点上并进行部署  
devmode:与合约的dev mode相关的文件，方便开发和调试  
gateway:区块链网络的配置信息，包括peer、orderer、channel等相关信息  
wallet:钱包目录。很重要！需要挂载到可靠的目录并进行备份  

### 启动步骤
- **通过Dev Mode运行调试合约**
```
cd contract
npm install
npm run dev-init
npm start
npm run dev-deploy
```
运行合约后，如果需要修改代码，只需要重启合约即可生效，无需install、upgrade或instantiate

- **启动应用服务**
```
cd application/
npm install
npm start
```
swagger在线API文档：  
http://localhost:3000/api-docs
