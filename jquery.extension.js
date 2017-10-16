'use strict';

(function () {
    $.ajaxSetup({
        beforeSend: function (request) {
            request.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('user_token')}` || "");
        }
    });
})();