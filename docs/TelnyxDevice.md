<a name="TelnyxDevice"></a>

## TelnyxDevice
Represents the software phone running in a web browser or other context.

**Kind**: global class  

* [TelnyxDevice](#TelnyxDevice)
    * [new TelnyxDevice(config)](#new_TelnyxDevice_new)
    * [.authorize()](#TelnyxDevice+authorize)
    * [.initiateCall(phoneNumber)](#TelnyxDevice+initiateCall) ⇒ <code>Object</code>

<a name="new_TelnyxDevice_new"></a>

### new TelnyxDevice(config)
Create a new TelnyxDevice.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration Object |

<a name="TelnyxDevice+authorize"></a>

### telnyxDevice.authorize()
Connect to SIP server

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+initiateCall"></a>

### telnyxDevice.initiateCall(phoneNumber) ⇒ <code>Object</code>
Make a phone call

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Returns**: <code>Object</code> - TelnyxCall  

| Param | Type | Description |
| --- | --- | --- |
| phoneNumber | <code>String</code> | The desination phone number to connect to |

