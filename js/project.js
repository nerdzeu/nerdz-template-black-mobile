$(document).ready(function() {
    var loading = N.getLangData().LOADING;
    //il div è nell'header
    $('#stdfrm').on('submit', function(event) {
        event.preventDefault();
        $('#pmessage').html(loading + '...');
        var news = $('#sendnews');
        if (news.length) {
            news = news.is(':checked') ? '1' : '0';
        } else {
            news = '0';
        }
        N.json.project.newPost({
            message: $('#frmtxt').val().autoLink(),
            to: $(this).data('to'),
            news: news
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
});
