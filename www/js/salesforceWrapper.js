function SalesforceWrapper() {
    /* AUTHENTICATION PARAMETERS */
    this.loginUrl = 'https://login.salesforce.com/';
    this.clientId = '{YOUR_CLIENT_ID}'
    this.redirectUri = 'https://login.salesforce.com/services/oauth2/success';
    
    /* CLASS VARIABLES */
    this.iab = undefined;     //In App Browser
    this.client = undefined; //forceTk client instance
    
    this.init();
}

SalesforceWrapper.prototype.init = function() {
    this.client = new forcetk.Client(this.clientId, this.loginUrl);
}

SalesforceWrapper.prototype.login = function (successCallback) {
    this.loginSuccess = successCallback;
    var self = this;
    self.iab = window.open(self.getAuthorizeUrl(self.loginUrl, self.clientId, self.redirectUri), '_blank','location=no');

    self.iab.addEventListener('loadstop', function (e) {

        var loc = e.url;

        if (loc.search(self.redirectUri) >= 0) {
            self.iab.close();
            self.sessionCallback(unescape(loc));
        }

    });
    
}

SalesforceWrapper.prototype.getAuthorizeUrl = function (loginUrl, clientId, redirectUri) {
    return loginUrl + 'services/oauth2/authorize?display=touch' + '&response_type=token&client_id=' + escape(clientId) + '&redirect_uri=' + escape(redirectUri);
}

SalesforceWrapper.prototype.sessionCallback = function(loc) {    var oauthResponse = {};
    
    var fragment = loc.split("#")[1];
    
    if (fragment) {
        var nvps = fragment.split('&');
        for (var nvp in nvps) {
            var parts = nvps[nvp].split('=');
            oauthResponse[parts[0]] = unescape(parts[1]);
        }
    }
    
    if (typeof oauthResponse === 'undefined' || typeof oauthResponse['access_token'] === 'undefined') {
        console.log("error");
    } else {
        this.client.setSessionToken(oauthResponse.access_token, null, oauthResponse.instance_url);
        if ( this.loginSuccess ) {
            this.loginSuccess();
        }
    }
    this.loginSuccess = undefined;
}