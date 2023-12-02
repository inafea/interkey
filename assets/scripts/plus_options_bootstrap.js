window.pageBootstrap = function () {

    window.activateSmoothScroll = function () {
        ///////////////////////////////////////
        /// SMOOTH SCROLL ///
        ///////////////////////////////////////
        // Select all links with hashes
        $('a[href*="#"]')
            // Remove links that don't actually link to anything
            .not('[href="#"]')
            .not('[href="#0"]')
            .click(function (event) {
                // On-page links
                console.log('smoothscroll')
                if (
                    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                    location.hostname == this.hostname
                ) {
                    // Figure out element to scroll to
                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    // Does a scroll target exist?
                    if (target.length) {
                        // Only prevent default if animation is actually gonna happen
                        event.preventDefault();
                        $('html, body').animate({
                            scrollTop: target.offset().top
                        }, 300, function () {
                            // Callback after animation
                            // Must change focus!
                            var $target = $(target);
                            $target.focus();
                            if ($target.is(":focus")) { // Checking if the target was focused
                                return false;
                            } else {
                                $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                                $target.focus(); // Set focus again
                            };
                        });
                    }
                }
            });
    }



    /////////////////////////////
    ///Plus Options BOOTSTRAP//
    ////////////////////////////
    this.pageBootstrap.plus_options = function () {
        console.log("plus options page detected")

        window.rest.get("auth/current")
            .then(function (response) {
                console.log("logged")
                if (response.roles) {
                    if (response.roles.buyer) {
                        window.location = "/dashboard"; 
                    } else {
                        bootstrapApp(response);
                    }
                } else {
                    window.location = "/country"; 
                }
            })
            .catch(function (error) {
                // window.location = "/login";
                window.location = "/country"; 
                console.log("not logged")
                // bootstrapApp(false)
            });

        function bootstrapApp(user) {
            console.log("app bootstrapped");
            console.log(user);

            if (!window.VueSelect) {
                window.VueSelect = {};
            }
            // VUE FREE PLAN CARD WIDGET           
            window.vuePlusOptionsWidget = new Vue({
                props: {
                    selectedPlan: {
                        type: String,
                        default: ''
                    },
                    selectedLanguage: {
                        type: String,
                        default: 'English'
                    },
                    topics: {
                        type: String,
                        default: user.help_need || ""
                    },
                    validTopics: {
                        type: Boolean,
                        default: false
                    },
                    topicsError: {
                        type: String,
                        default: ""
                    },
                    validityTopics: {
                        type: String,
                        default: "",
                    },
                    selectedCountry: {
                        type: Object,
                        default: null
                    },
                    snl: {
                        type: Object,
                        default: false
                    },
                    nativeLanguagePlaceholder: {
                        type: String,
                        default: 'Select your language'
                    },
                    nativeLanguageOptions: {
                        type: Array,
                        default: window.languages.list.slice(1),
                    },
                    sll: {
                        type: Object,
                        default: false
                    },
                    learningLanguagePlaceholder: {
                        type: String,
                        default: "Select partner's language"
                    },
                    learningLanguageOptions: {
                        type: Array,
                        default: window.languages.list.slice(1),
                    },
                    stripeHandler: {
                        type: Object,
                        default: false
                    },
                    processingPayment: {
                        type: Boolean,
                        default: false
                    }
                },
                el: '#vuePlusOptionsWidget',
                directives: {
                    tooltip: function (el, binding) {
                        $(el).tooltip({
                            title: binding.value,
                            placement: binding.arg,
                            trigger: 'hover'
                        })
                    },
                },
                components: {
                    'v-select': VueSelect.VueSelect
                },
                filters: {

                },
                mounted: function () {

                    //////////////////
                    // STRIPE START //
                    //////////////////

                    // CREATE STRIPE CHECKOUT HANDLER
                    if (window.StripeCheckout) {


                        this.stripeHandler = StripeCheckout.configure({
                            key: this.environment.stripe_public,
                            image: this.environment.app_frontend_url + 'assets/static/images/plus/cs_icon_plus.jpg',
                            locale: 'auto',
                            token: function(token) {
                                window.amplitude ? window.amplitude.getInstance().logEvent('ProcessingPayment', {page:'plus_checkout', branch: window.rest.environment.branch}):'';
                                window.vuePlusOptionsWidget.processingPayment = true;
                                try {
                                    if (token.id) {
                                        if (window.vuePlusOptionsWidget.user) {
                                            var id =  window.vuePlusOptionsWidget.user.id;
                                        } else {
                                            var id = 'notLoggedIn';
                                        }

                                        window.rest.post('subscriptions/new/users/' + id, { planCode: "PLUS_MONTH", token: JSON.stringify(token) })
                                        .then(function(response) {
                                            console.log(response)
                                            window.location = "/welcome";
                                        })
                                        .catch(function(error) {
                                            console.log(error)
                                            window.location = "/subscriptionerror";
                                        });
                                    } else {
                                        throw Error;
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            },
                            opened: function() {
                                console.log('opened')
                            },
                            closed: function(event) {
                                console.log('closed')
                                // window.vuePlusOptionsWidget.firstAction = false;
                            }
                        });

                        // Close Checkout on page navigation:
                        window.addEventListener('popstate', function() {
                            window.vuePlusOptionsWidget.stripeHandler.close();
                        });
                    }

                    //////////////////
                    // STRIPE END ////
                    //////////////////

                },
                computed: {
                    selectedNativeLanguage: {
                        get: function () {
                            if (this.snl === false) {
                                var vueWidget = this;
                                var l = '';

                                window.languages.list.find(function (language) {
                                    if (vueWidget.user) {
                                        if (language["code"] === vueWidget.user.nlanguages.first) {
                                            l = language;
                                        }
                                    }

                                });

                                if (!l.name) {
                                    l = null;
                                }
                            } else {
                                l = this.snl;
                            }
                            return l;
                        },
                        set: function (p) {
                            this.snl = p;
                            this.putLangInfo(p, 'first_nlanguage');
                        }
                    },
                    selectedLearningLanguage: {
                        get: function () {
                            if (this.sll === false) {
                                var vueWidget = this;
                                var l = '';

                                window.languages.list.find(function (language) {
                                    if (vueWidget.user) {
                                        if (language["code"] === vueWidget.user.llanguages.first) {
                                            l = language;
                                        }
                                    }

                                });

                                if (!l.name) {
                                    l = null;
                                }
                            } else {
                                l = this.sll;
                            }
                            return l;
                        },
                        set: function (p) {
                            this.sll = p;
                            this.putLangInfo(p, 'first_llanguage');
                        }
                    },
                    validatedTopics: {
                        get: function () {
                            if (this.topics.length <= 20) {
                                this.validTopics = false;
                                this.validityTopics = 'Be specific! We need at least 20 LETTERS to find a partner!';
                                return null;
                            } else {
                                this.validTopics = true;
                                this.validityTopics = "";
                                return this.topics;
                            }
                        },
                        set: function (m) {
                            this.$emit("input", m)
                        }
                    },
                },
                methods: {
                    putLangInfo: function (language, attribute) {
                        var vueWidget = this;
                        if (language) {
                            var payload = {};
                            payload[attribute] = language.code;
                            window.rest.put(
                                'users/' + vueWidget.user.id,
                                payload
                            ).then(function (user) {
                                console.log("language updated")
                            }).catch(function (error) {
                                console.log("problem in updating user language")
                            })
                        }
                    },
                    submitLanguages: function (languageCode) {
                        var vueWidget = this;
                        if (vueWidget.selectedNativeLanguage && vueWidget.selectedLearningLanguage) {
                            window.amplitude ? window.amplitude.getInstance().logEvent('SubmitLanguages', {page:'plus_languages', branch: window.rest.environment.branch}):'';
                            window.location = window.rest.environment.app_frontend_url + 'plus_topics';
                        } else {
                            console.log('Fill in language information')
                        }
                        // console.log(vueWidget.selectedNativeLanguage)
                        // console.log(vueWidget.selectedLearningLanguage)
                    },
                    submitTopics: function () {
                        var vueWidget = this;
                        if ((vueWidget.topics !== vueWidget.user.help_need)) {
                            window.amplitude ? window.amplitude.getInstance().logEvent('SubmitTopics', {page:'plus_topics', branch: window.rest.environment.branch}):'';
                            var payload = {};
                            payload["help_need"] = vueWidget.topics;
                            window.rest.put(
                                'users/' + vueWidget.user.id,
                                payload
                            ).then(function (user) {
                                console.log("language updated")
                                window.location = window.rest.environment.app_frontend_url + 'plus_checkout';
                            }).catch(function (error) {
                                console.log("problem in updating user language")
                            })
                        } else if (vueWidget.validatedTopics) {
                            console.log("Topics did not change!");
                            window.location = window.rest.environment.app_frontend_url + 'plus_checkout';
                        } else {
                            console.log("Invalid valid topic argument!");
                        }
                    },
                    languageName: function (languageCode) {
                        var l = '';
                        window.languages.list.find(function (language) {
                            if (language["code"] === languageCode) {
                                l = language['name'];
                            }
                        });
                        return l;
                    },
                    onKeyDown: function (evt) {
                        if (this.topics.length >= this.max) {
                            if (evt.keyCode >= 48 && evt.keyCode <= 90) {
                                evt.preventDefault()
                                return
                            }
                        }
                    },
                    clickUpgrade: function(planType) {
                        this.stripeCheck();
                    },
                    stripeCheck: function () {
                        if (this.stripeHandler) {
                            window.amplitude ? window.amplitude.getInstance().logEvent('ClickCheckout', {page:'dashboard', plan: this.selectedPlan, branch: window.rest.environment.branch}):'';

                            var payload = {};
    
                            if (this.user) {
                                payload.email = this.user.email
                            };
    
                            Object.assign(payload, {
                                name: 'COFFEESTRAP PLUS',
                                // description: this.planDescription(this.selectedPlan).split('of')[0].toUpperCase(),
                                description: '1 CONVERSATION A WEEK',
                                zipCode: false,
                                amount: 799,
                                currency: 'usd',
                                allowRememberMe: false,
                            });
    
                            this.stripeHandler.open(payload);
                        }
                    },
                    connectSocial: function (socialType) {
                        window.location = window.rest.environment.server_url + '/auth/login-' + socialType;
                    },

                },
                data: {
                    user: user,
                    environment: window.rest.environment,
                    subscription: {}
                }
            })

        }

    }


    window["pageBootstrap"]["plus_options"] && window["pageBootstrap"]["plus_options"]();

}