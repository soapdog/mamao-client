enyo.kind({
    name: "CodeConfirmPanel",
    kind: "FittableRows",
    fit: true,
    events: {
        onPanelChanged: ""
    },
    components: [
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Button", content: "Back", ontap: "goBack"},
            {name: "title", content: "GoMeetMe"}
        ]},
        {name: "body", fit: true, components: [
            {name: "displayBox", kind: "onyx.Groupbox", classes:"nice-padding", components: [
                {kind: "onyx.GroupboxHeader", name: "header", content: "Enter Code"},
                {kind: "onyx.InputDecorator", components: [
                    {kind: "onyx.Input", name: "input", onchange: "joinsession"}
                ]}
            ]},
            {name: "description", classes: "nice-padding center", components: [
                {
                    style: "text-align: left;",
                    content: "Please enter the code that was shared with you."
                },
                {
                    tag: "br"
                },
                {
                    kind: "onyx.Button",
                    content: "Join Meeting",
                    ontap: "joinSession",
                    classes: "onyx-blue",
                    style: "width: 90%"
                }

            ]}
        ]
        }
    ],
    rendered: function() {
        this.inherited(arguments);

        // WEB APP: pick code from URL
        if (window.location.hash) {
            this.$.input.setValue(window.location.hash.substring(1));
        }

        // APP: Session management
        if (PairModel.savedSession()) {
            this.log("saved session, restore code: "+ PairModel.code);
            this.$.input.setValue(PairModel.code);
        }
    },
    goBack: function() {
        this.doPanelChanged({panel: "home"});
    },
    joinSession: function() {

        var code = this.$.input.getValue();


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
                PairModel.save();
                this.doPanelChanged({panel: "positionUpdate"});
                return;
            }

            if (inResponse.err) {
                window.alert("No such meeting");
                PairModel.reset();
                this.doPanelChanged({panel: "home"});
                return;
            }
        });
        this.log("making request to /updateposition");


    }
});