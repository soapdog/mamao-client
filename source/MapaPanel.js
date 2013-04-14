enyo.kind({
    name: "MapaPanel",
    kind: "FittableRows",
    fit: true,
    events: {
        onPanelChanged: ""
    },
    components: [
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Button", content: "Voltar", ontap: "goBack"},
            {content: "Mapa"}
        ]},
        {name: "body", fit: true, components: [
            {name: "displayBox", kind: "onyx.Groupbox", classes:"nice-padding", components: [
                {kind: "onyx.GroupboxHeader", content: "Information"},
                {name:"display", classes:"nice-padding", content:"Pegando posição..."}
            ]}
            ]
        }
    ],
    position: {},
    acquirePosition: function() {
        var p = JSON.parse(localStorage.getItem("usuario"));
        this.log(p);
        if (p && p.email) {
            this.usuario = p;
        }
        this.log("geolocating...")
        if (!this.$.geolocation) {
            this.createComponent({
                name: "geolocation",
                kind: "rok.geolocation",
                watch: false,
                timeout: 30000,
                maximumAge: 3000,
                enableHighAccuracy: true,
                onSuccess: "succ",
                onError: "err"
            });
        } else {
            this.$.gmaps.destroy();
            this.$.tapbar.destroy();
            this.$.geolocation.getPosition();
        }
    },
    goBack: function(inSender, inEvent) {
        if (this.$.gmaps) {
            this.$.gmaps.destroy();
            this.$.geolocation.destroy();
            this.$.tapbar.destroy();
        }
        this.doPanelChanged({panel: "home"});
    },
    succ: function(inSender, inPosition) {
        this.position = inPosition;
        this.log(inPosition.coords);
        this.$.body.hide();
        if (!this.$.gmaps) {
            this.log("creating gmaps component");
            this.createComponent({
                name: "gmaps",
                kind: "GoogleMap",
                fit: true,
                latitude: this.position.coords.latitude,
                longitude: this.position.coords.longitude,
                onMarkerMoved: "markerMoved",
                onMapCreated: "mapCreated"
            });
            this.createComponent({
                name: "tapbar",
                kind: "onyx.Toolbar",
                components: [
                    {kind: "onyx.MenuDecorator", onSelect: "newMamao", components: [
                        {content: "Novo Problema"},
                        {kind: "onyx.Menu", floating: true, components: [
                            {content: "Foco de Dengue"},
                            {content: "Buraco"},
                            {content: "Lixo"}
                        ]}
                    ]},
                    {
                        kind: "onyx.Button",
                        content: "Me Encontre",
                        ontap: "acquirePosition"
                    }
                ]
            });
        } else {
            this.log("updating gmaps component");
           this.$.gmaps.setCenter(this.position.coords.latitude, this.position.coords.longitude);
        }
        this.render();
    },
    err: function() {
        this.$.display.setContent("Could not find your position.");
        this.$.display.render();
    },
    newMamao: function(inSender, inEvent) {
        var data = {};
        var postData = {
            data: {}
        };
        var pos = this.$.gmaps.getCenterPosition();

        switch (inEvent.originator.content) {
            case "Foco de Dengue":
                data.tipo = "dengue";
                data.titulo = "Foco de Dengue";
                break;
            case "Lixo":
                data.tipo = "lixo";
                data.titulo = "Lixo na Rua";
                break
            case "Buraco":
                data.tipo = "buraco"
                data.titulo = "Buraco";
                break;
        }

        postData.email = this.usuario.email;
        postData.data.tipo = data.tipo;
        postData.data.longitude = pos.lng;
        postData.data.latitude = pos.lat;



        var request = new enyo.Ajax({
            url: mamaoServer + "/novomamao",
            handleAs: "json",
            method: "POST"
        });
        // send parameters the remote service using the 'go()' method
        request.go({
            email: this.usuario.email,
            tipo: data.tipo,
            latitude: pos.lat,
            longitude: pos.lng,
            titulo: data.titulo
        });
        // attach responders to the transaction object
        request.response(this, function(inSender, inResponse) {
            // extra information from response object
            console.log(inResponse);

            if (inResponse) {
                this.$.gmaps.addMarker(inResponse);
            } else {
                alert("Ocorreu um erro ao gravar o problema.");
            }

        });



    },
    markerMoved: function(inSender, inData) {
        console.log("data: ", inData);
        var request = new enyo.Ajax({
            url: mamaoServer + "/atualizamamao",
            handleAs: "json",
            method: "POST"
        });
        // send parameters the remote service using the 'go()' method
        request.go({
            email: this.usuario.email,
            _id: inData._id,
            tipo: inData.tipo,
            latitude: inData.latitude,
            longitude: inData.longitude,
            titulo: inData.titulo
        });
        // attach responders to the transaction object
        request.response(this, function(inSender, inResponse) {
            // extra information from response object
            console.log(inResponse);

            if (inResponse) {
                console.log("problema salvo");
            } else {
                alert("Ocorreu um erro ao atualizar o problema.");
            }

        });
    },
    mapCreated: function() {
        console.log("ja temos mapa");
        var request = new enyo.Ajax({
            url: mamaoServer + "/pegamamoes",
            handleAs: "json",
            method: "GET"
        });
        // send parameters the remote service using the 'go()' method
        request.go();
        // attach responders to the transaction object
        request.response(this, function(inSender, inResponse) {
            // extra information from response object
            var i,
                len;
            console.log(inResponse);

            if (inResponse) {
                console.log("resultados: " + inResponse.length);
                //console.log(inResponse);
                for(i = 0, len = inResponse.length; i < len; i++) {
                    console.log(inResponse[i]);
                    if (inResponse[i].latitude) {
                        this.$.gmaps.addMarker(inResponse[i]);
                    }
                }
            } else {
                alert("Ocorreu um erro ao atualizar o problema.");
            }

        });
    }
});