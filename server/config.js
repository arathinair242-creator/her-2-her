require('dotenv').config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://arathinair242_db_user:Doreamon2006@ac-sacmkyi-shard-00-00.swi9txf.mongodb.net:27017,ac-sacmkyi-shard-00-01.swi9txf.mongodb.net:27017,ac-sacmkyi-shard-00-02.swi9txf.mongodb.net:27017/her2her?ssl=true&replicaSet=atlas-27jw9j-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'her2her_secret_key_12345',
  PORT: process.env.PORT || 5001
};
