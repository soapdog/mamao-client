enyo.kind({
    name: "HomePanel",
    kind: "FittableRows",
    fit: true,
    events: {
        onPanelChanged: ""
    },
    components: [
        {
            kind: "PortsHeader",
            title: "Mamão",
            taglines: [
                "Domindando o mundo!",
                "Desejo de informação"
            ]
        },
        {tag: "div", fit: true, classes: "center", components:[
            {
                kind: "onyx.Button",
                name: "registrarUsuario",
                classes: "nice-padding-top round onyx-blue home-button",
                content: "Login",
                ontap: "registraUsuario"
            }
        ]},
        {kind: "onyx.Toolbar", classes: "center", content: "The Feito Na Feira Group", ontap: "tapLogo"}
    ],
    registraUsuario: function(inSender, inEvent) {
        this.doPanelChanged({panel: "registraUsuario"});
    },
    tapLogo: function() {
        window.open("http://www.arialcon.com");
    }
});