$(document).ready(function() {
    var loading = N.getLangData().LOADING;
    //il div è nell'header
    $('#stdfrm').on('submit', function(event) {
        event.preventDefault();
        $('#pmessage').html(loading + '...');
        N.json.profile.newPost({
            message: $('#frmtxt').val().autoLink(),
            to: $(this).data('to')
        }, function(data) {
            if (data.status === 'ok') {
                $('#showpostlist').click();
                $('#frmtxt').val('');
            }
            $('#pmessage').html(data.message);
            setTimeout(function() {
                $('#pmessage').html('');
            }, 5000);
        });
    });
    var oldPlist = '';
    $('#blacklist').click(function() {
        var me = $(this);
        var plist = $('#postlist');
        oldPlist = plist.html();
        plist.html('<form id="blfrm">Motivation: <textarea style="width:100%; height:60px" id="blmot"></textarea><br /><input type="submit" value="Blacklist" /></form>');
        plist.on('submit', '#blfrm', function(event) {
            event.preventDefault();
            me.html('...');
            N.json.profile.blacklist({
                id: me.data('id'),
                motivation: $('#blmot').val()
            }, function(d) {
                me.html(d.message);
                plist.html(oldPlist);
                me.off('click');
            });
        });
    });
    $('#unblacklist').click(function() {
        var me = $(this);
        me.html('...');
        N.json.profile.unblacklist({
            id: $(this).data('id')
        }, function(d) {
            me.html(d.message);
            me.off('click');
        });
    });
    $('#profilepm').on('click', function() {
        $('#pmcounter').click();
        $('#pm_reply').data('to', $('#username').html()).click();
    });
});
