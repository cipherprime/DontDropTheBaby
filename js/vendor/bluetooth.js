var bluetoothDevice;
var myCharacteristic;

var log = console.log;

var serviceUuid = '0bd51666-e7cb-469b-8e4d-2742f1ba77cc';
var characteristicUuid = 'e7add780-b042-4876-aae1-112855353cc1';

async function onStartButtonClick() {
    try {
        log('Requesting Bluetooth Device...');
        const device = await navigator
            .bluetooth
            .requestDevice({
                filters: [
                    {
                        services: [serviceUuid]
                    }
                ]
            });

        log('Connecting to GATT Server...');
        const server = await device
            .gatt
            .connect();

        log('Getting Service...');
        const service = await server.getPrimaryService(serviceUuid);

        log('Getting Characteristic...');
        myCharacteristic = await service.getCharacteristic(characteristicUuid);

        await myCharacteristic.startNotifications();

        log('> Notifications started');
        myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function onStopButtonClick() {
    if (myCharacteristic) {
        try {
            await myCharacteristic.stopNotifications();
            log('> Notifications stopped');
            myCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
        } catch (error) {
            log('Argh! ' + error);
        }
    }
}

function handleNotifications(event) {
    let value = event.target.value;
    let a = [];

    let decoder = new TextDecoder();

    for (let i = 0; i < value.byteLength; i++) {
        a.push(value.getUint8(i));
    }
    let result = decoder.decode(new Uint8Array(a));
    if (result.startsWith('0')) {
        logValue(1, result.substring(1));
    }
    else if (result.startsWith('1')) {
        logValue(2, result.substring(1));
    }
}

function logValue(channel, value) {
    const lastValueOne = 64;
    var dataZero = parseFloat(value);
    var emgValueZero = ((dataZero - 44.0 ) / 212.0) * 9320 * Math.pow((parseInt(lastValueOne) / 13.0), -0.893) * 4.13522;
    // log(channel + '> ' + emgValueZero);

    var functionName = channel === 1 ? 'updateChannel1Text' : 'updateChannel2Text';
    if(window.gameInstance) {
        window.gameInstance.SendMessage('UpdateTextGameObject', functionName, Math.round(emgValueZero).toString());
    }

    window.dispatchEvent( new CustomEvent('value', {
      detail: { channel, value }
    }));
}

var bluetoothDevice;

async function onScanButtonClick() {
    let options = {
        filters: []
    };

    let filterService = document
        .querySelector('#service')
        .value;
    if (filterService.startsWith('0x')) {
        filterService = parseInt(filterService);
    }
    if (filterService) {
        options
            .filters
            .push({services: [filterService]});
    }

    let filterName = document
        .querySelector('#name')
        .value;
    if (filterName) {
        options
            .filters
            .push({name: filterName});
    }

    let filterNamePrefix = document
        .querySelector('#namePrefix')
        .value;
    if (filterNamePrefix) {
        options
            .filters
            .push({namePrefix: filterNamePrefix});
    }

    bluetoothDevice = null;
    try {
        log('Requesting Bluetooth Device...');
        bluetoothDevice = await navigator
            .bluetooth
            .requestDevice(options);
        bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
        connect();
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function connect() {
    log('Connecting to Bluetooth Device...');
    await bluetoothDevice
        .gatt
        .connect();
    log('> Bluetooth Device connected');
}

function onDisconnectButtonClick() {
    if (!bluetoothDevice) {
        return;
    }
    log('Disconnecting from Bluetooth Device...');
    if (bluetoothDevice.gatt.connected) {
        bluetoothDevice
            .gatt
            .disconnect();
    } else {
        log('> Bluetooth Device is already disconnected');
    }
}

function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    log('> Bluetooth Device disconnected');
}

function onReconnectButtonClick() {
    if (!bluetoothDevice) {
        return;
    }
    if (bluetoothDevice.gatt.connected) {
        log('> Bluetooth Device is already connected');
        return;
    }
    try {
        connect();
    } catch (error) {
        log('Argh! ' + error);
    }
}
