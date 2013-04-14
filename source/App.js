enyo.kind({
    name: "App",
    kind: "Panels",
    fit: true,
    draggable: false,
    arrangerKind: "CardArranger",
    handlers: {
        onPanelChanged: "panelChanged"
    },
    components: [
        {kind: "enyo.Signals", ondeviceready: "deviceReady"},
        {kind: "HomePanel", name: "home"},
        {kind: "RegistrarUsuarioPanel", name: "registrarUsuario"},
        {kind: "MapaPanel", name: "mapa"}
    ],
    panelChanged: function(inSender, inEvent) {
        var p = {home: 0, registraUsuario: 1, mapa: 2, positionConfirm: 3, positionUpdate: 4};

        if (inEvent.panel == "mapa") {
            this.$.mapa.acquirePosition();
        }

        this.log("changing panel to " + inEvent.panel + " " +p[inEvent.panel]);
        this.setIndex(p[inEvent.panel]);
    },
    deviceReady: function() {
        this.log("device is ready, listening for the back button");
        document.addEventListener("backbutton", enyo.bind(this, this.backButtonPressed), false);
    },
    backButtonPressed: function(inSender, inEvent) {
        var p = ["HomePanel", "RegistrarUsuarioPanel", "MapaPanel", "PositionConfirmPanel", "PositionUpdatePanel"];
        var currentPanel = p[this.index];
        var components = this.getComponents();

        if (this.backCalled) {
            this.backCalled = false;
            return;
        }

        this.backCalled = true;

        this.log("Back button pressed");
        this.log("Current panel is " + currentPanel);
        this.log(components);

        components[this.index + 2].goBack();



    }
});