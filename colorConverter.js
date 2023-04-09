import chroma from 'chroma-js';

const colorData = {
    "hue": 299.47,
    "saturation": 0.3504,
    "kelvin": 2500
};
function HSK_to_Hex(data) {
    const color = chroma.temperature(data.kelvin).set('hsl.h', data.hue).set('hsl.s', data.saturation);
    return color.hex();
    
}

export default HSK_to_Hex