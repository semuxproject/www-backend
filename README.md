## Backend of semux.org
This repository includes: 
* Testnet Faucet: https://www.semux.org/testnetfaucet

### Requirements 
* PostgreSQL v9.5+
* Node.js v8.9.4+

### Installation 
1. Copy sample config file and fill with your DB and wallet credentials 
```cp config/sample.config.json config/config.json```

2. Install dependencies ```npm install```

3. Run DB migrations ```./node_modules/sequelize-cli/lib/sequelize db:migrate```

3. Start app using PM2 or node: ```./node_modules/pm2/bin/pm2 start package.json```
