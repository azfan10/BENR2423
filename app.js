const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://m001-student:123@sandbox.xhvge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const { faker } = require('@faker-js/faker');
const randomName = faker.name.findName(); 
const randomPhone = faker.phone.phoneNumber();
const randomDate = faker.date.past(); 
client.connect(err => {
    if (err) {
      console.log(err.message)
      return
    }
    console.log('Connected to MongoDB');

   //client.db().admin().listDatabases.then(result => {
    //console.log(result);
       // })

    client.db('sample_training').collection('training').insertOne({ 
    Name:randomName,
    NumberPhone:randomPhone,
    Date:randomDate
   })
  
   // client.close();
 });