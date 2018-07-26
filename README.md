Vinli Node.js SDK
=================

[![npm version](https://badge.fury.io/js/vinli.svg)](http://badge.fury.io/js/vinli)
[![Build Status](https://travis-ci.org/vinli/vinli-node.svg)](https://travis-ci.org/vinli/vinli-node)

[![NPM](https://nodei.co/npm/vinli.png?downloads=true)](https://nodei.co/npm/vinli/)


> This SDK and accompanying documentation is a work in progress. There are areas that are still to be completed and finalized. We welcome your feedback. Please post any errors as issues on GitHub and Vinli engineering will respond as quickly as possible. And stay tuned for updates over the next few weeks as we bring more features to the SDK.

A Node.js client for interacting with the Vinli Platform from within your application.

```bash
npm install --save vinli
```

Create a new application from the Vinli Developer Portal (https://dev.vin.li).  From within your Node.js application, set up the client:

```javascript
var Vinli = require('vinli')

var client = new Vinli({
  appId: 'b3fcb3c2-0b7e-4c9a-a6a1-f53e365c2fd9',
  secretKey: 'C023z8T6f39WSZrLSqqf'
});
```

When creating a client, you must pass either a `appId` and `secretKey` or `accessToken`.

```javascript
var Vinli = require('vinli')

var client = new Vinli({
  accessToken: 'HWaBnDis9eZcHTMYQpKsE0mfsQT3qgKMRnpaVrivQ9GmhlXtLuE1'
});
```

Objects
-------

- [App](#app)
- [Device](#device)
- [Vehicle](#vehicle)
- [Rule](#rule)
- [Event](#event)
- [Subscription](#subscription)
- [Trip](#trip)
- [Code (diagnostics)](#code)


Conventions
-----------

### Promises

The client is designed exclusively following the Promise/A+ specification (https://promisesaplus.com/).  Specifically, it uses the popular Q library (https://github.com/kriskowal/q), and all asynchronous operations return a Promise.

### Arrays and Pagination

Functions that return multiple items in a paginated form (i.e. App#devices()) return an object containing the following properties:

* `list` - an array containing this page of objects
* `total` - When the function returns a "item-style" pagination (using `limit` and `offset`), the `total` represents the total number of items in all pages.  If the function returns a "stream-style" pagination (using `since` and `until`), the `remaining`
* `remaining` - If the function returns a "stream-style" pagination (using `since` and `until`), the `remaining` property will contain the total number of items on all subsequent pages after this one.
* `next`, `prev`, `first`, `prior`, etc - For each page link returned from the server, a convenience method is given.  This method returns a promise that resolves to that page.  Additionally, these functions only appear when that page exists, for example, it's possible to pull pages using the `next` function as long as the `next` function exists.  This allows for iterating through the entirety of the list programmatically.


### Fetch vs. Forge

Most of the types listed below have two methods to create instances: `.fetch(id)` and `.forge(id)`.  The differences between the two are listed below:

* `fetch(id)` - will call the Vinli platform to retrieve all of the information about this item.
* `forge(id)` - allows you to skip the fetch when you don't need this information.  For instance, if you know the id of a Device, but want to get all of that device's trips.  Calling

	```javascript
	client.Device.fetch('a8774ce8-9892-46bb-99ce-d26a861291f1').then(function(device){
	  return device.trips();
	}).then(function(trips){
	  // do something with `trips`
	});
	```

	will retrieve information about the Device from the platform, then call the Trips server to get the device's trips.  The first call is unnecessary and will count as a transaction against your application.  Instead, using `forge` will skip the first API call and will instead create an "empty" Device:

	```javascript
	client.Device.forge('a8774ce8-9892-46bb-99ce-d26a861291f1').trips().then(function(trips){
	  // do something with `trips`
	});
	```

It's important to understand two things about using `forge`:

1. `forge` returns the actual object, not a promise, so you can act on it without the `then` boilerplate.
2. The object returned from `forge` has no properties besides the `id` that was set.

	```javascript
	var vehicle = client.Vehicle.forge('1002fdd0-6b4e-450e-8b14-fa457b499db7');
	console.log(vehicle.id); // => '1002fdd0-6b4e-450e-8b14-fa457b499db7'
	console.log(vehicle.vin); // => undefined
	```
vs.

```javascript
client.Vehicle.fetch('1002fdd0-6b4e-450e-8b14-fa457b499db7').then(function(vehicle){
	console.log(vehicle.id); // => '1002fdd0-6b4e-450e-8b14-fa457b499db7'
	console.log(vehicle.vin); // => 'JHMBA6122HC361229'
})
	```


App
----

#### `addDevice(deviceInfo)`

Adds a device to your application, giving your application access to that device's data.  `deviceInfo` is an object containing one and only one of the following:

* `id` - if you know the platform's deviceId for the device (UUID)
* `caseId` - if you know the physical case Id printed on the outside of the device.

Note that, with the exception of enterprise applications, the user must have granted access to the device through the MyVinli OAuth flow.

#### `removeDevice(deviceId)`

Removes the device associated with the given `deviceId` from your application.

#### `devices(options)`

Returns a list of devices associated with your application.  Accepts `limit` and `offset` pagination options.


Auth
-----

#### `exchange(authCode, redirectUrl, clientId, clientSecret)`

For server applications that use the OAuth client type of "server", this method is used to exchange a user's OAuth token.  This method returns a token that the server can use to make calls to Auth Services on behalf of the user. The authCode provided to this method must be obtained using the same clientId used to exchange to token.


User
----

Users are retrieved using the authorization token received from the Auth.exchange() method above.

#### `User.forge(authToken)`

Creates a User object with the given `authToken` without calling the platform for any additional information.  Useful with the `devices()` method below.


#### `User.fetch(authToken)`

Fetches the user associated with the `authToken`. User information includes:

* `email`
* `firstName`
* `lastName`
* `image`


### `devices()`

Gets an array of devices that the user has associated with their account and has authorized for this application. This method requires the User object to be forged beforehand.

Device
------

#### `Device.forge(id)`

Creates a Device object with the given `id`.


#### `Device.fetch(id)`

Fetches a Device from the platform for the given device `id`.  Because fetching a Device does not provide any other information beside the id, the `forge` method should be used in favor of `fetch` for devices.


### Device State Information

The following methods act on Vinli's Platform Services.

#### `vehicles([options])`

Retrieves a list of Vehicles that have been associated with this Device. Accepts `limit` and `offset` pagination options.


#### `latestVehicle()`

Retrieves the single most recent vehicle associated with the Device.


### Telemetry

#### `messages([options])`

Retrieves a part of the stream of messages transmitted by this Device. Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent messages.


#### `message(id)`

Retrieves a single message for the given ID.  The message must have been generated by this device.


#### `snapshots(fields, [options])`

Retrieves a part of the stream of snapshots transmitted by this Device that contain the given fields. `fields` is an array of parameters keys.  For a list of available parameters, check [https://dev.vin.li/parameters.json](https://dev.vin.li/parameters.json).  For example:

    client.Device.forge('ba355b36-67db-4224-af29-c13c738d14e3').snapshots(['vehicleSpeed', 'rpm', 'coolantTemp'])

Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent snapshots containing the given fields.


#### `locations([fields, options])`

Retrieves a part of the stream of locations transmitted by this Device. Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent locations.



### Device's Rules

#### `rules([options])`

Retrieves a list of Rules for the Device.  Accepts `limit` and `offset` pagination options.


#### `createRule(rule)`

Creates a Rule for this device.


### Device's Subscriptions

#### `subscriptions([options])`

Retrieves a list of Subscriptions for the Device.  Accepts `limit` and `offset` pagination options.


#### `createSubscription(subscription)`

Creates a Subscription for this device. The `options` parameter must have the following:

* `eventType` - A valid [event type](http://docs.vin.li/en/latest/web/event-services/overview.html#event-types).
* `url` - URL to call when the subscription is triggered


### Device's Trips

#### `trips([options])`

Retrieves a list of Trips for the Device.  This method returns Trips in reverse chronological order and accepts `limit` and `offset` pagination options.


### Device's Safety Services

#### `collisions([options])`

Retrieves a list of Collisions for the Device.  Accepts `limit` and `offset` pagination options.



Vehicle
-------

#### `Vehicle.forge(id)`

Creates a Vehicle object with the given `id`.

#### `Vehicle.fetch(id)`

Retrieves the Vehicle from the Vinli Platform with the given `id`.

#### `trips([options])`


Event
-----

#### `Event.forge(id)`

Creates a Event object with the given `id`.

#### `Event.fetch(id)`

Retrieves the Event from the Vinli Platform with the given `id`.


Subscription
------------

#### `Subscription.forge(id)`

Creates a Subscription object with the given `id`.

#### `Subscription.fetch(id)`

Retrieves the Subscription from the Vinli Platform with the given `id`.

#### `notifications([options])`

Retrieves the Notifications for this Subscription.  Accepts `limit` and `offset` pagination options.

#### `delete()`

Deletes this Subscription.


Rule
----

#### `Rule.forge(id)`

Creates a Rule object with the given `id`.

#### `Rule.fetch(id)`

Retrieves the Rule from the Vinli Platform with the given `id`.

#### `Rule.fill(id)`

Fills in information about the Rule.  This is useful in situations where a Rule was retrieved via Device.rules().  When retrieved this way, Rules do not contain boundary information.

#### `events([options])`

Retrieves the Events for this Rule.  Accepts `limit` and `offset` pagination options.

#### `subscriptions([options])`

Retrieves the Subscriptions for this Rule.  Accepts `limit` and `offset` pagination options.

#### `createSubscription([options])`

Creates a new Subscription for this Rule. The `options` parameter must have the following:

* `eventType` - Can be 'rule-*', 'rule-enter', or 'rule-leave'
* `url` - URL to call when the subscription is triggered
* `appData` - Optional string containing additional data that will be delivered to the above URL

#### `delete()`

Deletes this Rule.


Trip
----

#### `Trip.forge(id)`

Creates a Trip object with the given `id`.

#### `Trip.fetch(id)`

Retrieves the Trip from the Vinli Platform with the given `id`.

#### `messages([options])`

Note: In order to retrieve the messages for a given Trip, the Trip object must have been created by the `fetch` method.

Retrieves a part of the stream of messages transmitted by this Device. Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent messages.

#### `locations([fields, options])`

Note: In order to retrieve the locations for a given Trip, the Trip object must have been created by the `fetch` method.

Retrieves a part of the stream of locations transmitted by this Device. Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent locations.

#### `snapshots(fields, [options])`

Note: In order to retrieve the snapshot for a given Trip, the Trip object must have been created by the `fetch` method.

Retrieves a part of the stream of snapshots transmitted by this Device. Accepts `limit`, `since`, and `until` stream pagination options.  Without any options, this method will return the most recent snapshots.

Code
----

#### `Code.fetch(id)`

Retrieves the DTC occurrence information from the Vinli Platform with the given `id`.

#### `Code.search(number, [options])`

This method is meant to provide this information for a given DTC code (number) so that your Application can present useful information to the end-user.
Accepts `limit` and `offset` pagination options.
