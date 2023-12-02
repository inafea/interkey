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
    ///Dasboard BOOTSTRAP//
    ////////////////////////////
    this.pageBootstrap.dashboard = function () {
        console.log("dashboard page detected")

        window.rest.get("auth/current")
            .then(function (response) {
                console.log("logged")
                // console.log(response )
                // if (response.roles.buyer) {
                // window.location = "/teachers";
                // } else {
                bootstrapApp(response)
                // }
            })
            .catch(function (error) {
                // window.location = "/login";
                console.log("not logged")
                bootstrapApp(false)
            });

        function bootstrapApp(user) {
            console.log("app bootstrapped");
            console.log(user);

            // Vue.directive('tooltip', function(el, binding){
            //     $(el).tooltip({
            //              title: binding.value,
            //              placement: binding.arg,
            //              trigger: 'hover'             
            //          })
            // });

            // VUE TOP RIGHT HEADER WIDGET
            window.vueHeaderMenuWidget = new Vue({
                el: '#vueHeaderMenuWidget',
                data: {
                    user: user,
                    environment: window.rest.environment
                },
                methods: {
                    analytics: function(event) {
                        if (event.target.getAttribute('event')) {
                            window.amplitude ? window.amplitude.getInstance().logEvent('HeaderMenuClick', {page:'premium', to: event.target.getAttribute('event'), branch: window.rest.environment.branch}):'';
                        }
                    },
                }
            })

            // var selectComponent = Vue.component('v-select', VueSelect.VueSelect);

            // VUE FREE PLAN CARD WIDGET           
            window.vueDashboardWidget = new Vue({
                props: {
                    loaded: {
                        type: Boolean,
                        default: true
                    },
                    subscriptionLoaded: {
                        type: Boolean,
                        default: false
                    },
                    selectedPlan: {
                        type: String,
                        default: ''
                    },
                    selectedLanguage: {
                        type: String,
                        default: 'English'
                    },
                    sendMessageCollapse: {
                        type: String,
                        default: ''
                    },
                    expandTileCollapse: {
                        type: String,
                        default: ''
                    },
                    message: {
                        type: String,
                        default: ""
                    },
                    validMessage: {
                        type: Boolean,
                        default: false
                    },
                    messageError: {
                        type: String,
                        default: ""
                    },
                    validityMessage: {
                        type: String,
                        default: "",
                    },
                    selectedCountry: {
                        type: Object,
                        default: null
                    },
                    countryPlaceholder: {
                        type: String,
                        default: 'All Countries'
                    },
                    countryOptions: {
                        type: Array,
                        default: window.countries.list,
                    },
                    snl: {
                        type: Object,
                        default: false
                    },
                    nativeLanguagePlaceholder: {
                        type: String,
                        default: 'All Languages'
                    },
                    nativeLanguageOptions: {
                        type: Array,
                        default: window.languages.list.slice(1),
                    },
                    selectedLearningLanguage: {
                        type: Object,
                        default: null
                    },
                    learningLanguagePlaceholder: {
                        type: String,
                        default: 'All Languages'
                    },
                    learningLanguageOptions: {
                        type: Array,
                        default: window.languages.list.slice(1),
                    },
                    noMoreResultsMessage: {
                        type: String,
                        default: 'There are no more users with these search parameters'
                    },
                    stripeHandler: {
                        type: Object,
                        default: {}
                    },
                    params: {
                        type: Object,
                        default: {}
                    },
                    expandedMenuItems: {
                        type: Array,
                        default: ['findFriends']
                    },
                    processingPayment: {
                        type: Boolean,
                        default: false
                    }
                },
                el: '#vueDashboardWidget',
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
                    formatDate: function (value) {
                        if (value) {
                            if (typeof(value) === 'number') {
                                var date = new Date(value*1000);
                            } else {
                                var date = new Date(value);
                            }
                            var monthNames = [
                                "January", "February", "March",
                                "April", "May", "June", "July",
                                "August", "September", "October",
                                "November", "December"
                            ];

                            var day = date.getDate();
                            var monthIndex = date.getMonth();
                            var year = date.getFullYear();

                            return day + ' ' + monthNames[monthIndex] + ' ' + year;
                        }
                    }
                },
                mounted: function () {

                    //////////////////
                    // STRIPE START //
                    //////////////////

                    // CREATE STRIPE CHECKOUT HANDLER
                    this.stripeHandler = StripeCheckout.configure({
                        key: this.environment.stripe_public,
                        // image: this.environment.app_frontend_url + 'assets/static/images/premium/cs_icon_premium.jpg',
                        locale: 'auto',
                        token: function(token) {
                            window.amplitude ? window.amplitude.getInstance().logEvent('ProcessingPayment', {page:'dashboard', branch: window.rest.environment.branch}):'';
                            window.vueDashboardWidget.processingPayment = true;
                            try {
                                if (token.id) {
                                    var planCode = window.vueDashboardWidget.mapPlanCode(
                                        window.vueDashboardWidget.selectedLanguage,
                                        window.vueDashboardWidget.selectedPlan
                                    )
                                    if (window.vueDashboardWidget.user) {
                                        var id =  window.vueDashboardWidget.user.id;
                                    } else {
                                        var id = 'notLoggedIn';
                                    }

                                    window.rest.post('subscriptions/new/users/' + id, { planCode: planCode, token: JSON.stringify(token) })
                                    .then(function(response) {
                                        console.log(response)
                                        window.vueDashboardWidget.getUserSubscription();
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
                            // window.vueDashboardWidget.firstAction = false;
                        }
                    });

                    // Close Checkout on page navigation:
                    window.addEventListener('popstate', function() {
                        window.vueDashboardWidget.stripeHandler.close();
                    });

                    //////////////////
                    // STRIPE END ////
                    //////////////////

                },
                computed: {
                    planDescription: function () {
                        var description = '';
                        var widget = this;
                        return function (value) {
                            if (value === 'first') {
                                // description = '1 month of COFFEESTRAP PREMIUM - Total Order Amount: $7.99';
                                description = '1 month of COFFEESTRAP PREMIUM ' + widget.selectedLanguage.toUpperCase() + ' - Total Order Amount: $7.99';
                            } else if (value === 'second') {
                                // description = '6 months of COFFEESTRAP PREMIUM - Total Order Amount: $38.34';
                                description = '6 months of COFFEESTRAP PREMIUM ' + widget.selectedLanguage.toUpperCase() + ' - Total Order Amount: $38.34';
                            } else if (value === 'third') {
                                // description = '12 months of COFFEESTRAP PREMIUM - Total Order Amount: $57.48';
                                description = '12 months of COFFEESTRAP PREMIUM ' + widget.selectedLanguage.toUpperCase() + ' - Total Order Amount: $57.48';
                            }
                            return description;
                        };
                    },
                    selectedNativeLanguage: {
                        get: function () {
                            if (this.snl === false) {
                                var vueWidget = this;
                                var l = '';

                                window.languages.list.find(function (language) {
                                    if (language["code"] === vueWidget.user.llanguages.first) {
                                        l = language;
                                    }
                                });

                                if (!l.name) {
                                    l = window.languages.list.slice(1)[0];
                                }
                            } else {
                                l = this.snl;
                            }
                            return l;
                        },
                        set: function (p) {
                            this.snl = p;
                        }
                    },
                    currentSearchLink: function () {
                        var language = 'all';

                        if (this.selectedNativeLanguage) {
                            if (this.selectedNativeLanguage.name) {
                                language = this.selectedNativeLanguage.name;
                            }
                        }
                        var link = "users/" + language + "/search";
                        // var link = "";
                        return link
                    },
                    currentSearchParams: function () {
                        var c = '';
                        if (this.selectedCountry) {
                            c = this.selectedCountry['country-code'] ? this.selectedCountry['country-code'] : 'all';
                            if (c !== 'all') {
                                this.params.country = c;
                            } else {
                                delete this.params.country;
                            }
                        } else {
                            delete this.params.country;
                        }
                        var ll = '';
                        if (this.selectedLearningLanguage) {
                            ll = this.selectedLearningLanguage['name'] ? this.selectedLearningLanguage['name'] : 'all';
                            if (ll !== 'all') {
                                this.params.llanguage = ll;
                            } else {
                                delete this.params.llanguage;
                            }
                        } else {
                            delete this.params.llanguage;
                        }
                        if (this.expandedMenuItems.length > 0) {
                            if (this.expandedMenuItems[0] === 'findFriends') {
                                this.params.scope = 1;
                            } else if (this.expandedMenuItems[0] === 'myFriends') {
                                this.params.scope = 2;
                            } else {
                                delete this.params.scope;
                            }
                        }
                        return this.params;
                    },
                    validatedMessage: {
                        get: function () {
                            if (this.message.length <= 20) {
                                this.validMessage = false;
                                this.validityMessage = 'Message must be longer than 20 letters';
                            } else {
                                this.validMessage = true;
                                this.validityMessage = "";
                            }
                            return this.message
                        },
                        set: function (m) {
                            this.$emit("input", m)
                        }
                    },
                    messagesSortedByInverseCreation: function () {
                        return this.messages.slice(0).sort(function (a, b) {
                            return new Date(b.creationDate) - new Date(a.creationDate);
                        });
                    }
                },
                methods: {
                    onKeyDown: function (evt) {
                        if (this.message.length >= this.max) {
                            if (evt.keyCode >= 48 && evt.keyCode <= 90) {
                                evt.preventDefault()
                                return
                            }
                        }
                    },
                    countryName: function (countryCode) {
                        var c = '';
                        window.countries.list.find(function (country) {
                            if (country["country-code"] === countryCode) {
                                c = country.name;
                            }
                        });
                        return c;
                    },
                    countryFlag: function (countryCode) {
                        var c = '';
                        window.countries.list.find(function (country) {
                            if (country["country-code"] === countryCode) {
                                c = country['alpha-2'];
                            }
                        });
                        return c.toLowerCase();
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
                    toggleExpand: function (toggleRef) {
                        window.amplitude ? window.amplitude.getInstance().logEvent('ChangeDashboardTab', {page:'dashboard',toTab:toggleRef, branch: window.rest.environment.branch}):'';
                        var index = this.expandedMenuItems.indexOf(toggleRef);
                        this.expandTileCollapse = '';
                        if (index === -1) {
                            this.expandedMenuItems.push(toggleRef);
                            if (toggleRef === 'findFriends' || toggleRef === 'myFriends') {
                                this.searchUsers();
                                if (toggleRef === 'myFriends') {
                                    this.snl = null;
                                }
                            } else if (toggleRef === 'subscription') {
                                this.getUserSubscription();
                            }
                            if (window.drift) {
                                if (toggleRef === 'teachers') {
                                    window.drift.load && window.drift.load('krwitpxzx457');
                                    // window.drift.reset && window.drift.reset();
                                } else {
                                    window.drift.unload && window.drift.unload();
                                }
                            }
                            if (this.expandedMenuItems.length > 1) {
                                this.expandedMenuItems.splice(0, 1);
                            }
                        } else {
                            // this.expandedMenuItems.splice(index, 1);
                        }
                    },
                    getUserSubscription: function () {
                        var vw = this;
                        window.rest.get(
                                "subscriptions/remote/users/" +
                                vw.user.id
                            )
                            .then(function (response) {
                                vw.subscription = response;
                                vw.subscriptionLoaded = true;
                                // console.log(response);
                                if (response.nickname === 'Monthly Billing') {
                                    vw.selectedPlan = 'first';
                                } else if (response.nickname === '6 Months Billing') {
                                    vw.selectedPlan = 'second';
                                } else if (response.nickname === 'Annual Billing') {
                                    vw.selectedPlan = 'third';
                                }
                                window.vueDashboardWidget.processingPayment = false;
                            })
                            .catch(function (error) {
                                vw.subscription = false;
                                vw.subscriptionLoaded = true;
                                console.log('No subscription found for legged user');
                                window.vueDashboardWidget.processingPayment = false;
                                vw.$nextTick(function () {
                                    window.activateSmoothScroll();
                                });
                            });
                    },
                    activateMessageField: function (userId) {
                        this.expandTileCollapse = '';
                        this.sendMessageCollapse = userId;
                        if (this.expandedMenuItems[0] === 'myFriends') {
                            this.fetchMessageHistory(userId);
                        }
                    },
                    fetchMessageHistory: function (userId) {
                        var vw = this;
                        vw.messages = false;
                        window.rest.get(
                                "messages/all/users/" +
                                vw.user.id +
                                "/partners/" +
                                userId
                            )
                            .then(function (response) {
                                console.log(response)
                                vw.messages = response;
                            })
                            .catch(function (error) {
                                console.log(error)
                            });
                    },
                    cancelSendMessage: function (event) {
                        this.sendMessageCollapse = '';
                    },
                    expandProfileField: function (userId) {
                        this.sendMessageCollapse = '';
                        this.expandTileCollapse = userId;
                    },
                    contractProfileField: function (event) {
                        this.expandTileCollapse = '';
                    },
                    mapPlanCode: function (language, plan) {
                        if (language === 'Spanish' && plan === 'first') {
                            return 'ES_MONTH';
                        } else if (language === 'Spanish' && plan === 'second') {
                            return 'ES_SEMESTER';
                        } else if (language === 'Spanish' && plan === 'third') {
                            return 'ES_ANNUAL';
                        } else if (language === 'English' && plan === 'first') {
                            return 'EN_MONTH';
                        } else if (language === 'English' && plan === 'second') {
                            return 'EN_SEMESTER';
                        } else if (language === 'English' && plan === 'third') {
                            return 'EN_ANNUAL';
                        } else {
                            return 'UNKNOWN';
                        }
                    },
                    clickUpgrade: function(planType) {
                        this.selectedPlan = planType;
                        this.stripeCheck();
                    },
                    stripeCheck: function () {
                        window.amplitude ? window.amplitude.getInstance().logEvent('ClickCheckout', {page:'dashboard', plan: this.selectedPlan, branch: window.rest.environment.branch}):'';

                        var payload = {};

                        if (this.user) {
                            payload.email = this.user.email
                        };

                        Object.assign(payload, {
                            name: 'COFFEESTRAP PREMIUM',
                            // description: this.planDescription(this.selectedPlan).split('of')[0].toUpperCase(),
                            description: this.planDescription(this.selectedPlan).split('of')[0].toUpperCase()  + ' - ' + this.selectedLanguage.toUpperCase(),
                            zipCode: false,
                            amount: +this.planDescription(this.selectedPlan).split('$')[1] * 100,
                            currency: 'usd',
                            allowRememberMe: false,
                        });

                        this.stripeHandler.open(payload);
                    },
                    sendMessage: function (destinationId) {
                        window.amplitude ? window.amplitude.getInstance().logEvent('ClickSendMessage', {page:'dashboard', branch: window.rest.environment.branch}):'';

                        var vw = this;

                        if (vw.validMessage) {

                            vw.validMessage = false;

                            var messagePayload = {
                                destinationId: destinationId,
                                text: vw.validatedMessage,
                                destinationNotified: true,
                            };

                            if (vw.expandedMenuItems[0] === 'findFriends') {
                                messagePayload.createMatch = true;
                            }

                            window.rest.post(
                                    '/messages/new/users/' + vw.user.id,
                                    messagePayload
                                )
                                .then(function (response) {
                                    vw.messageError = "";
                                    vw.user.messagesLeft = response.quota_left;
                                    vw.message = "";
                                    if (vw.expandedMenuItems[0] === 'findFriends') {
                                        vw.sendMessageCollapse = '';
                                        var index = vw.list.map(function (usr) {
                                            return usr.id;
                                        }).indexOf(destinationId);
                                        vw.list.splice(index, 1);
                                    } else if (vw.expandedMenuItems[0] === 'myFriends') {
                                        messagePayload.creationDate = new Date(Date.now());
                                        messagePayload.sourceId = vw.user.id;
                                        vw.messages.unshift(messagePayload);
                                    }
                                })
                                .catch(function (error) {
                                    this.messageValid = true;
                                    vw.messageError = "There was a problem sending your message, please try again.";
                                });
                        };

                    },
                    searchUsers: function () {
                        window.amplitude ? window.amplitude.getInstance().logEvent('ClickSearchUsers', {page:'dashboard', branch: window.rest.environment.branch}):'';
                        var vw = this;
                        this.usersCount = '-';
                        vw.list = [];
                        delete(vw.currentSearchParams.startFrom);
                        vw.lastUserTimestampOrId = false;
                        vw.sendMessageCollapse = '';
                        vw.expandTileCollapse = '';
                        vw.messages = [];
                        vw.$nextTick(function () {
                            vw.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                        });
                    },
                    connectSocial: function (socialType) {
                        window.location = window.rest.environment.server_url + '/auth/login-' + socialType;
                    },
                    infiniteHandler: function ($state) {
                        window.amplitude ? window.amplitude.getInstance().logEvent('ScrollInfiniteUsers', {page:'dashboard', branch: window.rest.environment.branch}):'';
                        var vueWidget = this;
                        vueWidget.cancelSendMessage();
                        vueWidget.contractProfileField();
                        if (vueWidget.lastUserTimestampOrId) {
                            this.currentSearchParams.startFrom = vueWidget.lastUserTimestampOrId;
                        }
                        console.log('Pagination Params:')
                        console.log(this.currentSearchParams)
                        window.rest.get(this.currentSearchLink, {
                            params: this.currentSearchParams,
                        }).then(function (users) {
                            console.log('Pagination Users:')
                            console.log(users)
                            console.log('Number of Users:')
                            console.log(users.length)
                            var lastUser = users[users.length - 1];
                            if (lastUser) {
                                if (lastUser.count && lastUser.count !== "0") {
                                    console.log('this is a first call');
                                    // console.log(lastUser)
                                    vueWidget.usersCount = lastUser.count;
                                    users.pop();
                                    if (vueWidget.expandedMenuItems[0] === 'findFriends') {
                                        vueWidget.lastUserTimestampOrId = users[users.length - 1].creationDate;
                                    } else if (vueWidget.expandedMenuItems[0] === 'myFriends') {
                                        vueWidget.lastUserTimestampOrId = users[users.length - 1].id;
                                    }
                                    vueWidget.list = vueWidget.list.concat(users);
                                    // console.log(lastUser)
                                    console.log(vueWidget.lastUserTimestampOrId)
                                } else if (lastUser.count === "0") {
                                    console.log('no more users 1');
                                    vueWidget.lastUserTimestampOrId = false;
                                    vueWidget.noMoreResultsMessage = 'No results match your search, change search parameters';
                                    $state.complete();
                                } else {
                                    console.log('this is a non first call');
                                    if (vueWidget.expandedMenuItems[0] === 'findFriends') {
                                        vueWidget.lastUserTimestampOrId = users[users.length - 1].creationDate;
                                    } else if (vueWidget.expandedMenuItems[0] === 'myFriends') {
                                        vueWidget.lastUserTimestampOrId = users[users.length - 1].id;
                                    }
                                    vueWidget.list = vueWidget.list.concat(users);
                                }
                                $state.loaded();
                                console.log(vueWidget.list.length)
                                if (vueWidget.list.length > 149) {
                                    vueWidget.noMoreResultsMessage = 'You cannot show more than 150 results per page, search with more precise parameters';
                                    $state.complete();
                                }
                                if (users.length < 10) {
                                    vueWidget.noMoreResultsMessage = 'There are no more users with these search parameters';
                                    $state.complete();
                                }
                                // $state.complete();
                            } else {
                                console.log('no more users 2');
                                vueWidget.noMoreResultsMessage = 'There are no more users with these search parameters';
                                $state.complete();
                            }
                        }).catch(function (error) {
                            console.log('Pagination Error:')
                            console.log(error)
                        })

                    },

                },
                data: {
                    user: user,
                    environment: window.rest.environment,
                    list: [],
                    messages: [],
                    usersCount: 0,
                    lastUserTimestampOrId: false,
                    subscription: {}
                }
            })

        }

    }


    window["pageBootstrap"]["dashboard"] && window["pageBootstrap"]["dashboard"]();

}