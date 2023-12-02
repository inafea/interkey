jQuery.getJSON("/assets/scripts/environment.json", function (environment) {
    configureRest(environment)
})
.then(function() {
    window.pageBootstrap && window.pageBootstrap();
})

function configureRest(variables) {

    //////////////////////
    //// AXIOS CONFIG ////
    //////////////////////

    window.rest = axios.create({
        baseURL: variables.app_server_url,
        timeout: 15000,
        headers: {}
    });

    window.rest.environment = {};

    window.rest.environment.name = variables.environment;
    window.rest.environment.branch = variables.branch;
    window.rest.environment.server_url = variables.app_server_url;
    window.rest.environment.app_frontend_url = variables.app_frontend_url;
    window.rest.environment.stripe_public = variables.stripe_public;

    window.rest.identify = function(email, payload) {
        try {
            if (variables.logrocket && window.LogRocket) {
                window.LogRocket.identify(email, payload);
            }
            if (variables.fullstory && window.FS) {
                FS.identify(email, {displayName: email, email:email, userInfo: payload});
            }
            if (variables.amplitude && window.amplitude) {
                payload.branch = window.rest.environment.branch;
                window.amplitude.getInstance().setUserId(email);
                window.amplitude.getInstance().setUserProperties(payload);
            }
        } catch (error) {
            console.log(error);
        }
    }

    window.rest.logOut = function() {
        window.localStorage.clear();
        window.location = "/login";
    }

    window.rest.unsubscribe = function(element) {
        var payload = {};
        payload['notificationFrequency'] = 0;
        window.rest.put(
            'users/' + JSON.parse(window.localStorage.getItem("current_user"))["id"],
            payload
        ).then(function (user) {
            $(element).find('#unsubText').css("color", "#fff").html("CORRECTLY UNSUBSCRIBED!");
            $(element).parent().css({"background": "#e93446", "border": "none"});
            window.localStorage.setItem("current_user", JSON.stringify(user));
        }).catch(function (error) {
            // Manage Exceptions
            console.log('didnt work')
        })
    }

    window.rest.terminate = function(element) {
        var payload = {};
        window.rest.post('users/' + JSON.parse(window.localStorage.getItem("current_user"))["id"] + '/make-inactive')
            .then(function (response) {
                window.localStorage.clear();
                window.location = "/";
            })
            .catch(function (error) {
                console.log('Error in terminating account');
            });
    }

    window.rest.getCookie = function(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    window.rest.interceptors.request.use(function (config) {
        if (window.localStorage.getItem("access_token")) {
            config.headers.Authorization = "Bearer " + window.localStorage.getItem("access_token");
            config.headers['Cache-Control'] = "no-cache,no-store,must-revalidate,max-age=-1,private";
            var date = new Date();
            date.setTime(+ date + (1000 * 86400000));
            const expiration = date.toGMTString();
            window.document.cookie = "crossdomain_auth_token=" + window.localStorage.getItem("access_token") + ";expires=" + expiration + ";path=/;domain=.coffeestrap.com";
        } else {
            window.document.cookie = 'crossdomain_auth_token=;path=/;domain=.coffeestrap.com;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    window.rest.interceptors.response.use(function (response) {
        if (window.rest.environment.name === "production") {
            // console.log(response.data.id)
            // console.log(response.data.email)
            // console.log(response)
            // console.log(window.rest.identify)
            // console.log(window.amplitude)
            try {
                if (response.data.id && response.data.email) {
                    // console.log(response.data.email, response.data)
                    window.rest.identify(response.data.email, response.data);
                }
            } catch(e) {
                console.error("Analytics could not identify user")
            }
        }
        return response.data;
    }, function (error) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        console.error("Request to: " + error.request.responseURL + " failed with following info:");
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data.message);
        } else {
            console.log(error)
        }
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        var hint = "";
        if (error.response) { 
            if (!error.response.data.message || typeof (error.response.data.message) === undefined) {
                hint = "Ouch, it looks like server is currently unavailable."
            } else if (jQuery.type(error.response.data.message) === "string") {
                hint = capitalize(error.response.data.message);
            } else if ( jQuery.type(error.response.data.message) === "object") {
                hint = capitalize(error.response.data.message[Object.keys(error.response.data.message)[0]])
            }
            return Promise.reject({
                status: error.response.status,
                message: hint
            });
        } else {
            return Promise.reject({
                status: error,
                message: error
            });
        }
    });

    //////////////////////
    //// GET PARAMETERS //
    //////////////////////

    window.rest.getParameterByName = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}