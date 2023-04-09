import Lifx from 'lifx-node-wrapper';
import dotenv from "dotenv";
import netatmo from "netatmo";
dotenv.config();

const lifx = new Lifx(process.env.lifx_token);
const netatmo_api = new netatmo({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    username: process.env.username_netatmo,
    password: process.env.password
});

let lights;
let miku_tuba;
let setToDanger = false;

const checkCO2Levels = (data) => {
    const CO2Levels = data[0].dashboard_data.CO2;
    if (CO2Levels > 1000) {
        if (!setToDanger) {
            console.log(`CO2 levels are too high: ${CO2Levels} ppms`);
            if (miku_tuba.power === 'on') {
                lifx.SetState(miku_tuba.id, 'on', '#ff0000', miku_tuba.brightness).catch(console.error);
                setToDanger = true;
            } else {
                console.log('Miku tuba is off');
            }
        }
    } else {
        console.log(`CO2 levels are fine: ${CO2Levels} ppms`);
        if (setToDanger) {
            if (miku_tuba.power === 'on') {
                lifx.SetState(miku_tuba.id, 'on', '#fee7a5', miku_tuba.brightness).catch(console.error);
            } else {
                console.log('Miku tuba is off');
            }
            setToDanger = false;
        }
    }
};

const getLightsData = async () => {
    try {
        const lightsData = await lifx.ListLights('all');
        lights = lightsData.data;
        miku_tuba = lights.find(light => light.label === 'Miku tuba');
    } catch (err) {
        console.error(err);
    }
};

const getStationsData = async () => {
    try {
        const data = await new Promise((resolve, reject) => {
            netatmo_api.getStationsData((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        checkCO2Levels(data);
    } catch (err) {
        console.error(err);
    }
};

const run = async () => {
    if (!lights) await getLightsData();
    await getStationsData();
};

console.log('Starting up...');
run().catch(console.error);
setInterval(run, 5 * 60 * 1000);

