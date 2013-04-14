enyo.kind({
    name: "PositionUpdatePanel",
    kind: "FittableRows",
    fit: true,
    events: {
        onPanelChanged: ""
    },
    components: [
        {kind: "onyx.Toolbar", name:"header", style: "on-top", components: [
            {kind: "onyx.Button", content: "End", ontap: "goBack"},
            {content: "Route"},
            {kind: "onyx.Button", content: "Refresh", ontap: "reScanPosition"}
        ]},
        {name: "body", fit: true, components: [
            {name: "displayBox", kind: "onyx.Groupbox", classes:"nice-padding", components: [
                {kind: "onyx.GroupboxHeader", content: "Information"},
                {name:"display", classes:"nice-padding", content:"Finding route..."}
            ]}
        ]
        }
    ],
    position: {},
    isMapVisible: true,
    locateUserAndCreateMap: function() {
        this.log("geolocating...")
        if (!this.$.geolocation) {
            this.createComponent({
                name: "geolocation",
                kind: "rok.geolocation",
                watch: false,
                timeout: 30000,
                maximumAge: 3000,
                enableHighAccuracy: true,
                onSuccess: "geolocationSuccessCallback",
                onError: "geolocationErrorCallback"
            });
        } else {
            this.$.gmaps.destroy();
            this.$.tapbar.destroy();
            this.$.geolocation.getPosition();
        }
    },
    geolocationSuccessCallback: function(inSender, inPosition) {
        this.log("called from "+inSender);
        this.position = inPosition;
        this.log(inPosition.coords);
        if (!this.$.gmaps) {

            if (this.$.body) {
                this.$.body.destroy();
            }

            this.log("Creating Directions Service component");

            this.createComponent({
                name: "gmaps",
                kind: "Google.DirectionsService",
                fit: true,
                latitude: this.position.coords.latitude,
                longitude: this.position.coords.longitude,
                onMapCreated: "mapCreated",
                onResultError: "resultError"
            });

            this.createComponent({
                name: "tapbar",
                kind: "onyx.MoreToolbar",
                components: [
                    {kind: "onyx.MenuDecorator", onSelect: "changeTransportRoute", components: [
                        {content: "Mode"},
                        {kind: "onyx.Menu", components: [
                            {content: "Car"},
                            {content: "Walking"},
                            {content: "Mass Transit"},
                            {content: "Bicycle"}
                        ]}
                    ]},
                    {kind: "onyx.Button", name: "mapInstructionsToggle", content: "Directions", ontap: "showInstructionsOrMap"}
                ]
            });

            this.log("after component creation.");

        } else {
            this.log("updating Directions Service component");
            this.updatePositionOnServer(inSender, inPosition);
        }
        this.render();
    },
    resultError: function(inSender, inEvent) {
       if (inEvent.status === "ZERO_RESULTS") {
           alert("No route for transport mode: " + PairModel.mode + " please select other mode.");
       } else {
           alert("Error: " + inEvent.status);
       }
    },
    mapCreated: function(inSender, inEvent) {
        this.log("map created");
        this.getPositionAndUpdateRoute();

    },
    reScanPosition: function(){
        this.$.gmaps.destroy();
        this.$.tapbar.destroy();
        this.$.geolocation.getPosition();
    },
    updatePositionOnServer: function(inSender, inPosition) {
        this.log("my sender is "+inSender);
        this.position = inPosition;
        this.log(inPosition.coords);

        var code = PairModel.code;
        PairModel.pos.lat = inPosition.coords.latitude;
        PairModel.pos.lng = inPosition.coords.longitude;

        var params = {
            latitude: PairModel.pos.lat,
            longitude: PairModel.pos.lng,
            user: PairModel.type,
            code: code.toUpperCase()
        };
        var req = new enyo.Ajax({
            url: "http://app.gomeetmeapp.com/updateposition",
            method: "POST",
            handleAs: "json"
        });
        req.go(params);
        req.response(this, function(inSender, inResponse){
            this.log("response from server");
            this.log(inResponse);
            if (inResponse.code) {
                PairModel.code = inResponse.code;
                this.getPositionAndUpdateRoute();
            }

            if (inResponse.err) {
                this.terminate(enyo.bind(this, function() {
                    this.$.gmaps.destroy();
                    this.$.geolocation.destroy();
                    this.$.tapbar.destroy();
                    this.doPanelChanged({panel: "home"});
                }));
            }
        });
        this.log("making updatePosition request");

    },
    goBack: function(inSender, inEvent) {
        if (window.confirm("Going back will terminate your meeting. Do you want to proceed?")) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.terminate(enyo.bind(this, function() {
                this.$.gmaps.destroy();
                this.$.geolocation.destroy();
                this.$.tapbar.destroy();
                this.doPanelChanged({panel: "home"});
            }));
        }
    },
    geolocationErrorCallback: function() {
        this.$.display.setContent("Could not find your position.");
    },
    changeTransportRoute: function(inSender,inEvent) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        switch(inEvent.content) {
          case "Car":
              PairModel.mode = "CAR";
              break;
          case "Walking":
              PairModel.mode = "WALK";
              break;
          case "Mass Transit":
              PairModel.mode = "MASSTRANSIT";
              break;
          case "Bicycle":
              PairModel.mode = "BICYCLE";
              break;
          default:
              PairModel.mode = "CAR";
              break;
        };
        this.getPositionAndUpdateRoute();

    },
    showInstructionsOrMap: function() {
        if (this.isMapVisible) {
            this.$.gmaps.showInstructions();
            this.isMapVisible = false;
            this.$.mapInstructionsToggle.setContent("Map");
        } else {
            this.$.gmaps.showMap();
            this.isMapVisible = true;
            this.$.mapInstructionsToggle.setContent("Directions");
        }
        this.$.header.render();
    },
    terminate: function(callback) {
        this.log("terminating pair");
        var req = new enyo.Ajax({
            url: "http://app.gomeetmeapp.com/terminate",
            method: "POST",
            handleAs: "json"
        });
        req.go({
            code: PairModel.code
        });
        req.response(this, function(inSender, inResponse){
            this.log(inResponse);
            if (inResponse.status) {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                PairModel.reset();
                callback();
            }
        });
    },
    getPositionAndUpdateRoute: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.log("new getPositionAndUpdateRoute iteration");
        var req = new enyo.Ajax({
            url: "http://app.gomeetmeapp.com/getpairdata",
            method: "POST",
            handleAs: "json"
        });
        req.go({
            code: PairModel.code
        });
        req.response(this, function(inSender, inResponse){
            this.log(inResponse);
            if (inResponse.err) {
                PairModel.reset();
                this.doPanelChanged({panel: "home"});
                return true;
            }

            var data = {
                mode: PairModel.mode,
                origin: {
                    latitude: inResponse.user2lat,
                    longitude: inResponse.user2long
                },
                destination: {
                    latitude: inResponse.user1lat,
                    longitude: inResponse.user1long
                }
            };

            this.log(data);
            this.$.gmaps.calculateRoute(data);

            // await sync
            //this.timer = setTimeout(enyo.bind(this, "reScanPosition"), 12000);
            this.checkIfMeetingIsAlive();
        });
    },
    checkIfMeetingIsAlive: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.log("Checking if meeting is alive...");
        var req = new enyo.Ajax({
            url: "http://app.gomeetmeapp.com/getpairdata",
            method: "POST",
            handleAs: "json"
        });
        req.go({
            code: PairModel.code
        });
        req.response(this, function(inSender, inResponse){
            this.log(inResponse);
            if (inResponse.err) {
                this.$.gmaps.destroy();
                this.$.geolocation.destroy();
                this.$.tapbar.destroy();
                localStorage.removeItem("pairmodel");
                this.doPanelChanged({panel: "home"});
                return true;
            }

            // save code to localstorage so that we can
            // restore session if the app closes.
            PairModel.save();

            // await sync
            this.timer = setTimeout(enyo.bind(this, "checkIfMeetingIsAlive"), 12000);
        });
    }
});