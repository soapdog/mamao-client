enyo.kind({
    name: "PairModel",
    statics: {
        type: 0,
        pos: {},
        code: "",
        reset: function() {
            PairModel.code = "";
            PairModel.pos = {};
            PairModel.type = 0;
            localStorage.removeItem("pairmodel");
        },
        load: function() {

            if (PairModel.savedSession()) {
                var obj = JSON.parse(localStorage.getItem("pairmodel"));
                PairModel.code = obj.code;
                PairModel.pos = obj.pos;
                PairModel.type = obj.type;

                PairModel.logdata();
            }
        },
        logdata: function() {
            console.log("Dumping PairModel data:");
            console.log("code:", PairModel.code);
            console.log("pos:", PairModel.pos);
            console.log("type:", PairModel.type);
        },
        save: function() {
            var obj = {};
            obj.code = PairModel.code;
            obj.pos = PairModel.pos;
            obj.type = PairModel.type;
            localStorage.setItem("pairmodel", JSON.stringify(obj));
            console.log("saved: ", localStorage.getItem("pairmodel"));

        },
        savedSession: function() {
            var obj = {};
            if (localStorage.getItem("pairmodel") == null || localStorage.getItem("pairmodel") == 'undefined') {
                return false;
            } else {
                obj = JSON.parse(localStorage.getItem("pairmodel"));
                if (!obj.code) {
                    return false;
                }
                return true;
            }
        },

        cancelMeeting: function(inCallback) {
            console.log("Cancelling meeting for code " + PairModel.code +"...");
            var req = new enyo.Ajax({
                url: "http://app.gomeetmeapp.com/terminate",
                method: "POST",
                handleAs: "json"
            });
            var params = {
                code: PairModel.code
            };
            req.go(params);
            req.response(this, function(inSender, inResponse){
                console.log("response from server");
                console.log(inResponse);
                if (inResponse.status) {
                    console.log("Meeting terminated");
                    PairModel.reset();
                    inCallback();
                } else {
                    console.log("Error terminating meeting");
                    window.alert("Could not terminate meeting");
                }
            });
        }
    }

});