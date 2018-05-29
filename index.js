const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

let Service, Characteristic;

module.exports = function(homebridge) {
    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerAccessory("switch-plugin", "LED", accessory)
};

function accessory(log, config) {
    this.log = log;
    this.LED = new Gpio(+config['pin'], 'out');
    this.status = 0; // 0 - off, 1 - on.

    process.on('SIGTERM', () => {
        this.LED.writeSync(0); // Turn off led.
        this.LED.unexport(); // Clear resources.

        process.exit(0);
    });
}

accessory.prototype = {
    getServices: function () {
        let informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "cheshir corp.")
            .setCharacteristic(Characteristic.Model, "LED lighter")
            .setCharacteristic(Characteristic.SerialNumber, "01234");

        let switchService = new Service.Switch("LED");
        switchService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getSwitchOnCharacteristic.bind(this))
            .on('set', this.setSwitchOnCharacteristic.bind(this));

        this.informationService = informationService;
        this.switchService = switchService;
        return [informationService, switchService];
    },
    getSwitchOnCharacteristic: function (next) {
        console.log(`Status: ${this.status}`);

        return next(null, getReadableStatus(this.status))
    },

    setSwitchOnCharacteristic: function (on, next) {
        this.log(`Switch to ${this.status ^ 1} status`);

        this.status ^= 1;
        this.LED.writeSync(this.status);

        return next();
    }
};

function getReadableStatus(status) {
    return status ? "On" : "Off"
}
