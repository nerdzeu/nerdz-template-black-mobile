if (!String.prototype.autoLink) {
    String.prototype.autoLink = function() {
        var  str = this,
        pattern = /(?!\[(?:img|url|code|gist|yt|youtube|noparse|video|music)[^\]]*?\])(^|\s+)((((ht|f)tps?:\/\/)|[www])([a-z\-0-9]+\.)*[\-\w]+(\.[a-z]{2,4})+(\/[\+%:\w\_\-\?\=\#&\.\(\)]*)*(?![a-z]))(?![^\[]*?\[\/(img|url|code|gist|yt|youtube|noparse|video|music)\])/gi,
        urls = decodeURIComponent(this.replace(/%([^\d].)/g, "%25$1")).match(pattern);

        for (var i in urls) {
            if (urls[i].match(/\.(png|gif|jpg|jpeg)$/)) {
                str = str.replace(urls[i], '[img]' + (urls[i].match(/(^|\s+)https?:\/\//) ? '' : 'http://') + urls[i] + '[/img]');
            }
            else if (urls[i].match(/youtu\.?be|vimeo\.com|dai\.?ly(motion)?/) && !urls[i].match(/playlist/)) {
                 str = str.replace(urls[i], '[video]' + $.trim(urls[i]) + '[/video]');
            }

        }
        return str.replace(pattern, '$1[url]$2[/url]').replace(/\[(\/)?noparse\]/gi, '');
    };
}

$(document).bind('mobileinit', function() {
    $.mobile.ajaxEnabled = false;
});
$(document).ready(function() {
    var loading = N.getLangData().LOADING;
    $('aside').css('height', $(window).height() - 42);
    $(window).resize(function() {
        $('aside').css('height', $(window).height() - 42);
    });
    var moving = 0;
    if ( !! !$('#left_col').length) {
        $('#title_left').hide();
    }
    $('#title_left').click(function() {
        if (moving)
            return;
        moving = 1;
        $('#right_col').removeClass('shown').animate({
            left: '100%'
        }, 500);
        if (!$('#left_col').hasClass('shown'))
            $('#left_col').css('left', '-70%').show().animate({
                left: '0%'
            }, 500, function() {
                $(this).addClass('shown');
                moving = 0;
            });
        else
            $('#left_col').animate({
                left: '-70%'
            }, 500, function() {
                $(this).removeClass('shown').hide();
                moving = 0;
            });
        return false;
    });
    $('#title_right').click(function() {
        if (moving)
            return;
        moving = 1;
        $('#left_col').removeClass('shown').animate({
            left: '-70%'
        }, 500);
        if (!$('#right_col').hasClass('shown'))
            $('#right_col').css('left', '100%').show().animate({
                left: '30%'
            }, 500, function() {
                $(this).addClass('shown');
                moving = 0;
            });
        else
            $('#right_col').animate({
                left: '100%'
            }, 500, function() {
                $(this).removeClass('shown').hide();
                moving = 0;
            });
        return false;
    });
    $('iframe').attr('scrolling', 'no').height(Math.min(340,0.6*$(this).width())).after(function() {
        return $("<a>").addClass("ext-link").attr("target","_blank").attr("href",$(this).attr("src").replace("embed/","watch?v=")).text("Link");
    }).after($("<br/>"));
    $('body').on('mousedown', 'a', function(e) {
        if ($(this).attr('href') && $(this).attr('href').match(/^https?:\/\/(?:www|mobile)\.nerdz\.eu\/.*/)) {
            e.preventDefault();
            $(this).attr('onclick', '').attr('href', $(this).attr('href').replace(/^(https?:\/\/)www(\.nerdz\.eu\/.*)/, '$1mobile$2').replace("https","http"));
        }
    }).on('mousedown', function(e) {
        if ($.inArray(e.target.className, [
            'more_opt',
            'hide',
            'delpost',
            'editpost',
            'imglocked',
            'imgunlocked',
            'lurk',
            'unlurk',
            'bookmark',
            'unbookmark'
        ]) == -1)
            $('.opted').removeClass('opted');
    });
    $('#rightmenu_title').click(function() {
        $('#rightmenu').toggleClass('ninja');
    });
    $(document).on('taphold', 'input[type=submit]', function(e) {
        e.preventDefault();
        window.open('/bbcode.php');
    });
    var append_theme = '',
        _h = $('head');
    if (localStorage.getItem('has-dark-theme') === 'yep') {
        append_theme = '?skin=sons-of-obsidian';
    }
    var prettify = document.createElement('script');
    prettify.type = 'text/javascript';
    prettify.src = 'https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/run_prettify.js' + append_theme;
    _h.append(prettify);
    if (append_theme !== '')
        _h.append('<style type="text/css">.nerdz-code-wrapper { background-color: #000; color: #FFF; }</style>');
    else
        _h.append('<style type="text/css">.nerdz-code-wrapper { background-color: #FFF; color: #000; }</style>');
    $('#notifycounter').on('click', function(e) {
        if ($('#pm_list').length)
            $('#pm_list').remove();
        e.preventDefault();
        var list = $('#notify_list'),
            old = $(this).html();
        var nold = parseInt(old);
        if (list.length) {
            if (isNaN(nold) || nold === 0) {
                list.remove();
            } else if (nold > 0) {
                list.prepend('<div id="pr_lo">' + loading + '</div>');
                N.html.getNotifications(function(d) {
                    $('#pr_lo').remove();
                    list.prepend(d);
                });
            }
        } else {
            var l = $(document.createElement('div'));
            l.attr('id', 'notify_list');
            l.html(loading);
            $('body').append(l);
            N.html.getNotifications(function(d) {
                l.html(d);
            });
            $('#notify_list').on('click', '.notref', function(e) {
                if (e.ctrlKey)
                    return;
                e.preventDefault();
                var href = $(this).attr('href');
                if (href === window.location.pathname + window.location.hash) {
                    location.reload();
                } else {
                    location.href = href;
                }
            });
        }
        $(this).html(isNaN(nold) ? old : '0');
    });
    $('#logout').on('click', function(event) {
        event.preventDefault();
        var t = $('#logout');
        N.json.logout({
            tok: $(this).data('tok')
        }, function(r) {
            var tmp = t.html();
            if (r.status === 'ok') {
                t.html(r.message);
                setTimeout(function() {
                    document.location.href = '/';
                }, 1500);
            } else {
                t.html('<h2>' + r.message + '</h2>');
                setTimeout(function() {
                    t.html(tmp);
                }, 1500);
            }
        });
    });
    //*PM *//
    pm_default_f = '<a href="/pm.php#inbox" id="pm_all">See All Conversations</a>';
    var c_from, c_to;
    $('#pmcounter').on('click', function(e) {
        if ($('#notify_list').length)
            $('#notify_list').remove();
        e.preventDefault();
        var list = $('#pm_list'),
            old = $(this).html();
        var nold = parseInt(old);
        if (list.length) {
            b = $('#pm_list_b');
            if (isNaN(nold) || nold === 0) {
                list.remove();
            } else if (nold > 0) {
                b.html(loading);
                N.html.pm.getInbox(function(data) {
                    b.html(data);
                    $(b.children()[0]).children().slice(0, nold).css('background-color', '#EEE');
                    $(b.children()[0]).children().slice(5).remove();
                });
            }
        } else {
            var l = $(document.createElement('div'));
            l.attr('id', 'pm_list');
            t = $('<div id="pm_list_t">').html('<div id="pm_from">Conversations</div>' + '<span id="pm_conv"></span><span id="pm_reply"></span><span id="pm_new"></span>');
            b = $('<div id="pm_list_b">' + loading + '</div>');
            f = $('<div id="pm_list_f">' + pm_default_f + '</div>');
            l.append(t).append(b).append(f);
            $('body').append(l);
            N.html.pm.getInbox(function(data) {
                b.html(data.replace(/(<br \/>)*/g, ''));
                $(b.children()[0]).children().slice(0, nold).css('background-color', '#EEE');
                $(b.children()[0]).children().slice(5).remove();
            });
            t.on('click', '#pm_new', function() {
                b.html(loading);
                N.html.pm.getForm(function(data) {
                    b.html(data).trigger('create');
                    $('#to').focus();
                });
                c_from = false;
                $('#pm_new').hide();
                $('#pm_conv').show();
            });
            t.on('click', '#pm_conv', function() {
                b.html(loading);
                N.html.pm.getInbox(function(data) {
                    b.html(data.replace(/(<br \/>)*/g, ''));
                    $(b.children()[0]).children().slice(5).remove();
                });
                $('#pm_new').show();
                $('#pm_reply, #pm_conv').hide();
            });
            t.on('click', '#pm_reply', function(data) {
                b.html(loading);
                N.html.pm.getForm(function(data) {
                    b.html(data).children().trigger('create');
                    to = $('#pm_reply').data('to');
                    $('#to').val(to).attr('disabled', 'disabled');
                    $('#message').focus();
                });
                $('#pm_new').hide();
                $('#pm_conv').show();
            });
            b.on('click', '.getconv', function(e) {
                b.html(loading);
                e.preventDefault();
                c_from = $(this).data('from');
                c_to = $(this).data('to');
                $('#pm_from').text($(this).text());
                $('#pm_reply').data('to', $(this).text());
                N.html.pm.getConversation({
                    from: c_from,
                    to: c_to,
                    start: 0,
                    num: 4
                }, function(data) {
                    b.html(data);
                    $('#pm_new').hide();
                    $('#pm_reply, #pm_conv').show();
                    b.children('#convfrm').remove();
                });
            });
            b.on('keydown', 'textarea', function(e) {
                if (e.which === 13)
                    $('#convfrm').submit();
            });
            b.on('submit', '#convfrm', function(e) {
                e.preventDefault();
                setTimeout(function() {
                    f.html(pm_default_f);
                }, 1500);
                if (!$('#to').val()) {
                    f.text('Missing Adressee');
                    return;
                }
                if (!$('#message').val()) {
                    f.text('Missing Message');
                    return;
                }
                N.json.pm.send({
                    to: $('#to').val(),
                    message: $('#message').val().autoLink()
                }, function(d) {
                    f = $('#pm_list_f');
                    f.text(d.status);
                    if (d.status === 'ok') {
                        f.text('Message Send');
                        if (c_from) {
                            N.html.pm.getConversation({
                                from: c_from,
                                to: c_to,
                                start: 0,
                                num: 4
                            }, function(data) {
                                b.html(data);
                                $('#pm_new').hide();
                                $('#pm_reply, #pm_conv').show();
                                b.children('#convfrm').remove();
                            });
                        } else {
                            $('#message').val('');
                        }
                    }
                });
            });
            f.on('click', '#pm_all', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                if (nold) {
                    if (href.split('#')[0] === window.location.pathname) {
                        location.hash = 'new';
                        location.reload();
                    } else {
                        location.href = '/pm.php#new';
                    }
                } else {
                    location.href = href;
                }
            });
        }
        $(this).html(isNaN(nold) ? old : '0');
    });
    var keys = [];
    $('textarea').on('keydown', function(e) {
        if (e.ctrlKey && (e.keyCode === 10 || e.keyCode === 13)) {
            e.preventDefault();
            $(this).parent().trigger('submit');
        }
        keys.push(e.keyCode);
        if (keys.toString().indexOf('38,38,40,40,37,39,37,39,66,65') >= 0) {
            e.preventDefault();
            keys.length = 0;
        }
    });
    var plist = $('#postlist');
    plist.on('click', '.qu_user', function(e) {
        e.preventDefault();
        $(this).parent().toggleClass('qu_main-extended');
    });
    plist.on('click', '.yt_frame', function(e) {
      var baseurl;
      switch( $(this).data("host") ) {
        case "youtube":
          baseurl = "//m.youtube.com/watch?v=";
        break;
        case "dailymotion":
          baseurl = "//touch.dailymotion.com/video/";
        break;
        case "vimeo":
          baseurl = "//vimeo.com/m/";
        break;
        case "facebook":
          baseurl = "//m.facebook.com/photo.php?v=";
        break;
      }
      window.open(document.location.protocol + baseurl + $(this).data('vid'));
    });
    plist.on('keydown', 'textarea', function(e) {
        if (e.ctrlKey && (e.keyCode === 10 || e.keyCode === 13)) {
            $(this).parent().trigger('submit');
        }
    });
    plist.on('click', '.more_opts', function(e) {
        $(this).parent().next().addClass('opted');
    });
    plist.on('click', '.delcomment', function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var hcid = $(this).data('hcid');
        var popup = $('<div>');
        popup.html(N.getLangData().ARE_YOU_SURE + ' <br />');
        $('<button>').attr('id', 'delCommOk' + hcid).html('YES').appendTo(popup);
        $('<button>').attr('id', 'delCommNo' + hcid).html('NO').appendTo(popup);
        popup.on('click', '#delCommOk' + hcid, function() {
            N.json[plist.data('type')].delComment({
                hcid: hcid
            }, function(j) {
                if (j.status === 'ok') {
                    refto.fadeOut(function() {
                        $(this).remove();
                    });
                    popup.fadeOut(function() {
                        $(this).remove();
                    });
                } else {
                    popup.html(j.message);
                }
            });
        }).on('click', '#delCommNo' + hcid, function() {
            popup.remove();
        });
        popup.attr('class', 'ui-content').css({
            backgroundColor: '#eee',
            color: '#111',
            padding: '15px'
        }).popup({
            positionTo: 'window'
        }).popup('open');
    });
    plist.on('submit', '.frmcomment', function(e) {
        e.preventDefault();
        var last, hcid, hpid = $(this).data('hpid'),
            refto = $('#commentlist' + hpid),
            error = $(this).find('.error').eq(0),
            pattern = 'div[id^="c"]',
            comments = refto.find(pattern);
        if (comments.length) {
            last = comments.length > 1 ? comments.eq(comments.length - 2) : null;
            hcid = last ? last.data('hcid') : 0;
        }
        error.html(loading);
        N.json[plist.data('type')].addComment({
            hpid: hpid,
            message: $(this).find('textarea').eq(0).val().autoLink()
        }, function(d) {
            if (d.status === 'ok') {
                if (hcid && last) {
                    N.html[plist.data('type')].getCommentsAfterHcid({
                        hpid: hpid,
                        hcid: hcid
                    }, function(d) {
                        var form = refto.find('form.frmcomment').eq(0),
                            pushBefore = form.parent(),
                            newComments = $('<div>' + d + '</div>').find(pattern),
                            internalLengthPointer = comments.length,
                            lastComment = comments.last();
                        if (comments.length > 1) {
                            comments.eq(comments.length - 1).remove();
                            internalLengthPointer--;
                        }
                        if (lastComment.data('hcid') === newComments.last().data('hcid')) {
                            lastComment.remove();
                            internalLengthPointer--;
                        }
                        while (internalLengthPointer + newComments.length > ((comments.parent().find('.more_btn').data('morecount') || 0) + 1) * 10) {
                            comments.first().remove();
                            comments = refto.find(pattern);
                            internalLengthPointer--;
                        }
                        pushBefore.before(d);
                        form.find('textarea').val('').parent().trigger('create');
                        error.html('');
                    });
                } else {
                    N.html[plist.data('type')].getComments({
                        hpid: hpid,
                        start: 0,
                        num: 10
                    }, function(d) {
                        refto.html(d).trigger('create');
                        error.html('');
                    });
                }
            } else {
                error.html(d.message);
            }
        });
    });
    plist.on('click', '.showcomments', function() {
        var refto = $('#' + $(this).data('refto'));
        if (refto.html() === '') {
            refto.html(loading + '...');
            N.html[plist.data('type')].getComments({
                hpid: $(this).data('hpid'),
                start: 0,
                num: 10
            }, function(res) {
                refto.html(res).trigger('create');
                if (document.location.hash === '#last')
                    refto.find('.frmcomment textarea[name=message]').focus();
                else if (document.location.hash)
                    $.mobile.silentScroll($(document.location.hash).offset().top);
            });
        } else {
            refto.html('');
        }
    });
    plist.on('click', '.more_btn', function() {
        var moreBtn = $(this),
            commentList = moreBtn.parents('div[id^="commentlist"]'),
            hpid = /^post(\d+)$/.exec(commentList.parents('div[id^="post"]').attr('id'))[1],
            intCounter = moreBtn.data('morecount') || 0;
        if (moreBtn.data('inprogress') === '1')
            return;
        moreBtn.data('inprogress', '1').text(loading + '...');
        N.html[plist.data('type')].getComments({
            hpid: hpid,
            start: intCounter + 1,
            num: 10
        }, function(r) {
            moreBtn.data('inprogress', '0').data('morecount', ++intCounter).text(moreBtn.data('localization'));
            var _ref = $('<div>' + r + '</div>');
            moreBtn.parent().after(r);
            if (intCounter === 1)
                moreBtn.parent().find('.scroll_bottom_hidden').show();
            if ($.trim(r) === '' || _ref.find('.nerdz_from').length < 10 || 10 * (intCounter + 1) === _ref.find('.commentcount:eq(0)').html()) {
                var btnDb = moreBtn.hide().parent();
                btnDb.find('.scroll_bottom_separator').hide();
                btnDb.find('.all_comments_hidden').hide();
            }
        });
    });
    plist.on('click', '.scroll_bottom_btn', function() {
        var cList = $(this).parents().eq(2);
        $.mobile.silentScroll(cList.find('.singlecomment:nth-last-child(2)').offset().top);
        cList.find('.frmcomment textarea').focus();
    });
    plist.on('click', '.all_comments_btn', function() {
        var btn = $(this),
            btnDb = btn.parent().parent(),
            moreBtn = btnDb.find('.more_btn'),
            commentList = btn.parents('div[id^="commentlist"]'),
            hpid = /^post(\d+)$/.exec(commentList.parents('div[id^="post"]').attr('id'))[1];
        if (btn.data('working') === '1' || moreBtn.data('inprogress') === '1')
            return;
        btn.data('working', '1').text(loading + '...');
        moreBtn.data('inprogress', '1');
        N.html[plist.data('type')].getComments({
            hpid: hpid,
            forceNoForm: true
        }, function(res) {
            btn.data('working', '0').text(btn.data('localization')).parent().hide();
            btnDb.find('.scroll_bottom_hidden').show().find('.scroll_bottom_separator').hide();
            var parsed = $('<div>' + res + '</div>'),
                push = $('#commentlist' + hpid);
            moreBtn.hide().data('morecount', Math.ceil(parseInt(parsed.find('.commentcount').html()) / 10));
            push.find('div[id^="c"]').remove();
            push.find('form.frmcomment').eq(0).parent().before(res);
        });
    });
    plist.on('click', '.qu_ico', function() {
        var area = $('#' + $(this).data('refto'));
        area.val(area.val() + '[quote=' + $(this).data('hcid') + '|' + $(this).data('type') + ']');
        area.focus();
    });
    plist.on('click', '.delpost', function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var hpid = $(this).data('hpid');
        N.json[plist.data('type')].delPostConfirm({
            hpid: hpid
        }, function(m) {
            if (m.status === 'ok') {
                var popup = $('<div>');
                popup.html(m.message + '<br />');
                $('<button>').attr('id', 'delPostOk' + hpid).html('YES').appendTo(popup);
                $('<button>').attr('id', 'delPostNo' + hpid).html('NO').appendTo(popup);
                popup.on('click', '#delPostOk' + hpid, function() {
                    N.json[plist.data('type')].delPost({
                        hpid: hpid
                    }, function(j) {
                        if (j.status === 'ok') {
                            refto.fadeOut(function() {
                                $(this).remove();
                            });
                            popup.fadeOut(function() {
                                $(this).remove();
                            });
                        } else {
                            popup.html(j.message);
                        }
                    });
                }).on('click', '#delPostNo' + hpid, function() {
                    popup.remove();
                });
                popup.attr('class', 'ui-content').css({
                    backgroundColor: '#eee',
                    color: '#111',
                    padding: '15px'
                }).popup({
                    positionTo: 'window'
                }).popup('open');
            }
        });
    });
    plist.on('click', '.editpost', function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto')),
            hpid = $(this).data('hpid');
        var editlang = $(this).attr('title');
        var form = function(fid, hpid, message, edlang, prev) {
            return '<form style="clear: both;" id="' + fid + '" data-hpid="' + hpid + '">' + '<textarea id="' + fid + 'abc" autofocus style="width:100%; height:125px">' + message + '</textarea>' + '<span style="float:right; margin-top: -10px"><input type="submit" data-mini="true" value="' + edlang + '" /></span>' + '<span style="float:left; margin-top: -10px"><input type="button" data-mini="true" value="' + N.getLangData().CANCEL + '" /></span>' + '</form><br style="clear: both"/>';
        };
        N.json[plist.data('type')].getPost({
            hpid: hpid
        }, function(d) {
            var fid = refto.attr('id') + 'editform';
            refto.html(form(fid, hpid, d.message, editlang, '')).trigger('create').find('input[type=button]').eq(0).click(function(e) {
                e.preventDefault();
                N.html[plist.data('type')].getPost({
                    hpid: hpid
                }, function(o) {
                    refto.html(o);
                    if (plist.data('location') == 'home') {
                        refto.find('.more_opt').eq(0).prepend('<a class="hide" data-postid="post' + hpid + '" title="' + refto.data('hide') + '"></a>');
                    }
                });
            });
            $('#' + fid).on('submit', function(e) {
                e.preventDefault();
                N.json[plist.data('type')].editPost({
                    hpid: $(this).data('hpid'),
                    message: $(this).children('textarea').val()
                }, function(d) {
                    if (d.status === 'ok') {
                        refto.slideToggle('slow');
                        N.html[plist.data('type')].getPost({
                            hpid: hpid
                        }, function(o) {
                            refto.html(o);
                            refto.slideToggle('slow');
                            if (plist.data('location') == 'home') {
                                refto.find('.more_opt').eq(0).prepend('<a class="hide" data-postid="post' + hpid + '" title="' + refto.data('hide') + '"></a>');
                            }
                        });
                    } else {
                        alert(d.message);
                    }
                });
            });
        });
    });
    plist.on('click', '.imglocked', function(e) {
        e.preventDefault();
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok') {
                me.attr('class', 'imgunlocked').attr('title', d.message);
            }
        };
        if ($(this).data('silent')) {
            N.json[plist.data('type')].reNotifyFromUserInPost({
                hpid: $(this).data('hpid'),
                from: $(this).data('silent')
            }, function(d) {
                tog(d);
            });
        } else {
            N.json[plist.data('type')].reNotifyForThisPost({
                hpid: $(this).data('hpid')
            }, function(d) {
                tog(d);
            });
        }
    });
    plist.on('click', '.imgunlocked', function(e) {
        e.preventDefault();
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok') {
                me.attr('class', 'imglocked').attr('title', d.message);
            }
        };
        if ($(this).data('silent')) {
            N.json[plist.data('type')].noNotifyFromUserInPost({
                hpid: $(this).data('hpid'),
                from: $(this).data('silent')
            }, function(d) {
                tog(d);
            });
        } else {
            N.json[plist.data('type')].noNotifyForThisPost({
                hpid: $(this).data('hpid')
            }, function(d) {
                tog(d);
            });
        }
    });
    plist.on('click', '.lurk', function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok')
                me.attr('class', 'unlurk').attr('title', d.message);
        };
        e.preventDefault();
        N.json[plist.data('type')].lurkPost({
            hpid: $(this).data('hpid')
        }, function(d) {
            tog(d);
        });
    });
    plist.on('click', '.unlurk', function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok')
                me.attr('class', 'lurk').attr('title', d.message);
        };
        e.preventDefault();
        N.json[plist.data('type')].unlurkPost({
            hpid: $(this).data('hpid')
        }, function(d) {
            tog(d);
        });
    });
    plist.on('click', '.bookmark', function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok')
                me.attr('class', 'unbookmark').attr('title', d.message);
        };
        e.preventDefault();
        N.json[plist.data('type')].bookmarkPost({
            hpid: $(this).data('hpid')
        }, function(d) {
            tog(d);
        });
    });
    plist.on('click', '.unbookmark', function(e) {
        var me = $(this);
        var tog = function(d) {
            if (d.status === 'ok')
                me.attr('class', 'bookmark').attr('title', d.message);
        };
        e.preventDefault();
        N.json[plist.data('type')].unbookmarkPost({
            hpid: $(this).data('hpid')
        }, function(d) {
            tog(d);
        });
    });
    plist.on('click', '.nerdz-code-title', function() {
        localStorage.setItem('has-dark-theme', localStorage.getItem('has-dark-theme') === 'yep' ? 'nope' : 'yep');
        document.location.reload();
    });
    plist.on('click', '.vote', function() {
        var curr = $(this),
            cont = curr.parent(),
            tnum = cont.parent().children('.thumbs-counter'),
            func = 'thumbs',
            obj = {
                hpid: cont.data('refto')
            };
        if (cont.hasClass('comment')) {
            obj = {
                hcid: cont.data('refto')
            };
            func = 'cthumbs';
        }
        if (curr.hasClass('voted')) {
            N.json[plist.data('type')][func]($.extend(obj, {
                thumb: 0
            }), function(r) {
                curr.removeClass('voted');
                var votes = parseInt(r.message);
                tnum.attr('class', 'thumbs-counter').text(votes);
                if (votes !== 0) {
                    tnum.addClass(votes > 0 ? 'nerdz_thumbsNumPos' : 'nerdz_thumbsNumNeg');
                }
                if (votes > 0) {
                    tnum.text('+' + tnum.text());
                }
            });
        } else {
            N.json[plist.data('type')][func]($.extend(obj, {
                thumb: curr.hasClass('up') ? 1 : -1
            }), function(r) {
                cont.children('.voted').removeClass('voted');
                curr.addClass('voted');
                var votes = parseInt(r.message);
                tnum.attr('class', 'thumbs-counter').text(votes);
                if (votes !== 0) {
                    tnum.addClass(votes > 0 ? 'nerdz_thumbsNumPos' : 'nerdz_thumbsNumNeg');
                }
                if (votes > 0) {
                    tnum.text('+' + tnum.text());
                }
            });
        }
    });
    setInterval(function() {
        var nc = $('#notifycounter'),
            val = parseInt(nc.html());
        nc.css('background-color', val === 0 || isNaN(val) ? '#eee' : '#2C98C9');
        var pc = $('#pmcounter');
        val = parseInt(pc.html());
        pc.css('background-color', val === 0 || isNaN(val) ? '#eee' : '#2C98C9');
    }, 200);
});
