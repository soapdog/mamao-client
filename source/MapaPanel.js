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
        this.$.gmaps.destroy();
        this.$.geolocation.destroy();
        this.$.tapbar.destroy();
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
                longitude: this.position.coords.longitude
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
        var tipo;
        var data = {};
        switch (inEvent.originator.content) {
            case "Foco de Dengue":
                tipo = "dengue";
                break;
            case "Lixo":
                tipo = "lixo";
                break
            case "Buraco":
                tipo = "buraco"
                break;
        }

        data.tipo = tipo

        var pos = this.$.gmaps.getUserPosition();

        this.$.gmaps.addMarker(pos.lat, pos.lng, data);
    }
});