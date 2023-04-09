import Lifx from 'lifx-node-wrapper';
import dotenv from "dotenv";
import netatmo from "netatmo";
import HSK_to_Hex from './colorConverter.js';
dotenv.config()

const lifx = new Lifx(process.env.lifx_token)
const netatmo_api = new netatmo({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    username: process.env.username_netatmo,
    password: process.env.password
});

console.log('Starting up...')
let setToDanger = false;
let defaultColor;

async function run() {
    await netatmo_api.getStationsData(async (err, data) => {
        const C02Levels = data[0].dashboard_data.CO2;
        if (C02Levels > 1000) {
            if (!setToDanger) {
                console.log(`CO2 levels are too high: ${C02Levels} ppms`)
                const miku_tuba = (await lifx.ListLights('label:Miku tuba')).data[0];
                if (miku_tuba.power === 'on') {
                    defaultColor = HSK_to_Hex(miku_tuba.color);
                    console.log(`Saved and setted default color as ${defaultColor}`)
                    await lifx.SetState(miku_tuba.id, 'on', '#ff0000', miku_tuba.brightness)
                    console.log(`Turned lights red`)
                    setToDanger = true;
                } else {
                    console.log('Miku tuba is off')
                }
            }
        } else {
            console.log(`CO2 levels are fine: ${C02Levels} ppms`)
            if (setToDanger) {
                const miku_tuba = (await lifx.ListLights('label:Miku tuba')).data[0];
                if (miku_tuba.power === 'on') {
                    await lifx.SetState(miku_tuba.id, 'on', defaultColor || '#fee7a5', miku_tuba.brightness)
                } else {
                    console.log('Miku tuba is off')
                }
                setToDanger = false;
            }
        }
    });
}
await run()
setInterval(run, 5 * 60 * 1000);
