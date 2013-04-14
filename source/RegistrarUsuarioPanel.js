enyo.kind({
    name: "RegistrarUsuarioPanel",
    kind: "FittableRows",
    fit: true,
    events: {
        onPanelChanged: ""
    },
    components: [
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Button", content: "Voltar", ontap: "goBack"},
            {name: "title", content: "Login"}
        ]},
        {name: "body", fit: true, components: [
            {kind: "onyx.Groupbox", classes:"nice-padding", components: [
                {kind: "onyx.GroupboxHeader", content: "Email"},
                {kind: "onyx.InputDecorator", components: [
                    {kind: "onyx.Input", name: "email", style: "width: 100%", placeholder: "Seu email"}
                ]}
            ]},
            {kind: "onyx.Groupbox", classes:"nice-padding", components: [
                {kind: "onyx.GroupboxHeader", content: "Nome Completo"},
                {kind: "onyx.InputDecorator", components: [
                    {kind: "onyx.Input", name: "nome", style: "width: 100%", placeholder: "Seu nome completo"}
                ]}
            ]},
            {name: "description", classes: "nice-padding center", components: [
                {
                    kind: "onyx.Button",
                    content: "Fazer Login",
                    ontap: "login",
                    classes: "onyx-blue",
                    style: "width: 90%"

                }
            ]}
        ]
        }
    ],
    rendered: function() {
        this.inherited(arguments);
        var p = JSON.parse(localStorage.getItem("usuario"));

        if (p.email) {
            this.$.email.setValue(p.email);
            this.$.nome.setValue(p.nome);
            this.render();
        }
    },
    goBack: function() {
        this.doPanelChanged({panel: "home"});
    },
    login: function() {
        var myEmail = this.$.email.getValue();
        var myNome = this.$.nome.getValue();
        var postData = {
            email: myEmail,
            nome: myNome
        }
        this.log("salvando " + myEmail + "/" + myNome);

        // set up enyo.AjaxProperties by sending them to the enyo.Ajax constructor
        var request = new enyo.Ajax({
            url: mamaoServer + "/novomamoeiro",
            handleAs: "json",
            method: "POST"
        });
        // send parameters the remote service using the 'go()' method
        request.go(postData);
        // attach responders to the transaction object
        request.response(this, function(inSender, inResponse) {
            // extra information from response object
            console.log(inResponse);

            if (inResponse.email) {
                localStorage.setItem("usuario", JSON.stringify(inResponse));
                this.doPanelChanged({panel: "mapa"});
            } else {
                alert("Ocorreu um erro no login.");
            }

        });
    }

});