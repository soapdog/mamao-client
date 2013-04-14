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
                "Dominando o mundo!",
                "Desejo de informação",
                "Pink, o que vamos fazer hoje?",
                "Its Alive!!! ALIIIIVEEE!!!!",
                "Mamão é mais barato que tomate...",
                "Alugamos este espaço"
            ]
        },
        {tag: "div", fit: true, classes: "center fundo", components:[
            {
                tag: "br"
            },
            {
                tag: "img",
                classes: "logo",
                attributes: {
                    src: "/assets/img/logo_mamao.png"
                }
            },
            {
                tag: "br"
            },
            {
                kind: "onyx.Button",
                name: "registrarUsuario",
                classes: "nice-padding-top round onyx-mamao home-button",
                content: "Login",
                ontap: "registraUsuario"
            },
            {tag: "br"},
            {
                kind: "onyx.Button",
                name: "instalarBtn",
                classes: "nice-padding-top round onyx-mamao home-button",
                content: "Instalar",
                ontap: "installApp"
            }
        ]},
        {kind: "onyx.Toolbar", classes: "center", content: "The Feito Na Feira Group", ontap: "tapLogo"}
    ],
    rendered: function() {
       this.inherited(arguments);
       if (!navigator.mozApps) {
           console.log("not moz apps");
           this.$.instalarBtn.hide();
       }

       var p = JSON.parse(localStorage.getItem("usuario"));

       if (p && p.email) {
            this.doPanelChanged({panel: "mapa"});
       }
    },
    registraUsuario: function(inSender, inEvent) {
        this.doPanelChanged({panel: "registraUsuario"});
    },
    tapLogo: function() {
        window.open("http://www.arialcon.com");
    },
    installApp: function() {
        var manifestURL = (location.href.substring(0, location.href.lastIndexOf("/")) + "/manifest.webapp");

        var installapp = navigator.mozApps.install(manifestURL);

        installapp.onsuccess = function(data) {
            // App foi instalada
            console.log("app instalado");
        };

        installapp.onerror = function() {
            // App não foi instalada, informações em
            // installapp.error.name
            console.log("App não instalado: " + installapp.error.name);
        };
    }
});