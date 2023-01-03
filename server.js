const express = require('express')
const {MongoClient} = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const app = express();

function run () {

    const db = client.db('ccc-db');
    const dbCollection = db.collection('userData');

    async function findUserCode (user_code) {
        try {
            const resultantData = await dbCollection.findOne({user_code: user_code});
            console.log(resultantData)

            return (
                resultantData
            )
        } finally {
            // await client.close();
        }
    }

    async function insertUserSave (user_data) {

        let randomString = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 8; i++ ) {
            randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        let parsed_data = JSON.parse(user_data);

        let reconstructed_data = {
            user_code: randomString,
            game_data: {
                cookieAmount: parsed_data.cookieAmount,
                autoClickerAmt: parsed_data.autoClickerAmt,
                clickFactoryAmt: parsed_data.clickFactoryAmt,
                solarClickerAmt: parsed_data.solarClickerAmt,
                clickGalaxyAmt: parsed_data.clickGalaxyAmt,
            }
        }
        console.log(reconstructed_data)

        const result = await dbCollection.updateOne({user_code: randomString}, {$setOnInsert: reconstructed_data}, {upsert: true})
        if(result.upsertedId !== null) {
            console.log(`A document has been inserted with the _id: ${result.upsertedId}`);
            return (
                randomString
            )
        } else {
            await insertUserSave(user_data);
        }
    }

    app.get('/api', async (req, res) => {
        console.log(req.query.user_code)
        res.json(await findUserCode(req.query.user_code))
    })

    app.get('/save', async (req, res) => {
        console.log(req.query.user_data)
        res.json(await insertUserSave(req.query.user_data))
    })

    app.listen(5000, () => {
        console.log("Server Opened On Port 5000")
    })
}

run()