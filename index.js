const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midleware
app.use(cors());
app.use(express.json());

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden Access' });
//         }
//         console.log('decoded', decoded);
//         req.decoded = decoded;
//         next();
//     });
//     // console.log('inside verifyJWT', authHeader);
// }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gjwmj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('warehouseManagement').collection('items');
        // const myItemCollection = client.db('warehouseManagement').collection('myitems');

        //AUTH
        // app.post('/login', async (req, res) => {
        //     const user = req.body;
        //     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '180d'
        //     });
        //     res.send({ accessToken });
        // })

        //ITEMS API 
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });


        //POST
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem);
            res.send(result);
        });

        //DELETE    

        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });

        //Updated Quantity

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await itemCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

        //myitem api 

        app.get('/myitem', async (req, res) => {
            // const decodedEmail = req.decoded.email;
            const email = req.query.email;
            // if(email === decodedEmail){

            // }
            const query = { email: email };
            const cursor = itemCollection.find(query);
            // const cursor = myItemCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);

            // else {
            //     res.status(403).send({ message: 'Forbidden Access' })
            // }

        });

        app.post('/myitem', async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            // const result = await myItemCollection.insertOne(item);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running warehouse management server');
});

app.listen(port, () => {
    console.log('listening to port', port);
});
