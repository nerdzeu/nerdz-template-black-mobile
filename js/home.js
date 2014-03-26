$(document).ready(function () {
    $.ajax({
        url: "/tpl/1/VERSION"
    }).done(function (d) {
        $("#left_col .title").eq(0).html("NERDZ<small>mobile</small> <span style='font-weight: normal'><a href='/Mobile+Nerdz:' style='color: #000 !important'>[" + $.trim(d) + "]</a></span>");
    })
    //tutti gli eventi ajax che evvengono in plist sono nel formato pilst.on(evento,[selettore],function(...){...});
    var plist = $("#postlist");
    var loading = N.getLangData().LOADING; //il div è nell'header
    var lang = null; /* globale dato che la uso anche altrove */
    var load = false; //gestisce i caricamenti ed evita sovrapposizioni. Dichiarata qui che è il foglio che viene incluso di default ovunque e per primo
    plist.html('<h1>' + loading + '...</h1>');

    var fixHeights = function () {
        plist.find(".nerdz_message").each(function () {
            var el = $(this).find('div:first');
            if ((el.height() >= 200 || el.find('.gistLoad').length > 0) && !el.attr('data-parsed')) {
                el.addClass("compressed");
                var n = el.parent().children(".post_footer");
                n.prepend('<p class="more">&gt;&gt;' + n.data('expand') + '&lt;&lt;</p>');
            }
            el.attr('data-parsed', '1');
        });
    };

    var hideHidden = function () {
        var hidden = localStorage.getItem('hid');

        if (hidden != null) {
            var pids = hidden.split("|");
            for (var i in pids) {
                var el = plist.find("#" + pids[i]);
                if (el)
                    el.hide();
            }
        }
        fixHeights();
    };

    $("#footersearch").on('submit', function (e) {
        e.preventDefault();
        var plist = $("#postlist");
        var qs = $.trim($("#footersearch input[name=q]").val());
        var num = 10; //TODO: numero di posts, parametro?

        if (qs == '') {
            return false;
        }

        var manageResponse = function (d) {
            plist.html(d);
            //variabile booleana messa come stringa data che nel dom posso salvare solo stringhe
            sessionStorage.setItem('searchLoad', "1"); //e' la variabile load di search, dato che queste azioni sono in questo file js ma sono condivise da tutte le pagine, la variabile di caricamento dev'essere nota a tutte
        };

        if (plist.data('type') == 'project') {
            if (plist.data('location') == 'home') {
                N.html.search.globalProjectPosts(num, qs, manageResponse);
            } else {
                if (plist.data('location') == 'project') {
                    N.html.search.specificProjectPosts(num, qs, plist.data('projectid'), manageResponse);
                }
            }
        } else {
            if (plist.data('location') == 'home') {
                N.html.search.globalProfilePosts(num, qs, manageResponse);
            } else {
                if (plist.data('location') == 'profile') {
                    N.html.search.specificProfilePosts(num, qs, plist.data('profileid'), manageResponse);
                }
            }
        }
        plist.data('mode', 'search');
    });

    plist.on('click', ".spoiler", function () {
        if ($(this).data("parsed")) return;
        $.each($(this).find("img"), function () {
            m = (117 - $(this).height()) / 2;
            if (m > 1)
                $(this).css("margin-top", m)
        })
        $(this).data("parsed", "1");
    });

    plist.on('click', '.more', function () {
        var me = $(this),
            par = me.parent(),
            jenk = par.parent().children("div").eq(0);
        par.removeClass("shadowed");
        jenk.removeClass("compressed")
        me.slideUp('slow', function () {
            me.remove();
        });
    });

    plist.on('click', ".hide", function () {
        var pid = $(this).data('postid');
        $("#" + pid).hide();
        var hidden = localStorage.getItem('hid');
        if (hidden == null) {
            localStorage.setItem('hid', pid);
        } else {
            hidden += "|" + pid;
            localStorage.setItem('hid', hidden);
        }
        //auto lock
        var lock = $("#post" + pid).find('img.imgunlocked');
        if (lock.length) {
            lock.eq(0).click();
        }
    });

    $("#profilePostList").on('click', function () {
        plist.html('<h1>' + loading + '...</h1>');
        $("#fast_nerdz").show();
        $("#nerdzlist").hide();
        $(".active-lang").removeClass('active-lang');
        localStorage.removeItem("autolang");
        load = false;
        N.html.profile.getHomePostList(0, function (data) {
            plist.html(data);
            plist.data('type', 'profile');
            plist.data('mode', 'std');
            hideHidden();
            $("#nerdzselect").attr("class", "icon_expand");
            load = true;
        });
    });

    $("#projectPostList").on('click', function () {
        plist.html('<h1>' + loading + '...</h1>');
        $("#fast_nerdz").hide();
        $("#projlist").hide();
        $("#projselect").attr("class", "icon_expand");
        $(".active-plang").removeClass('active-plang');
        load = false;
        N.html.project.getHomePostList(0, function (data) {
            plist.html(data);
            plist.data('type', 'project');
            plist.data('mode', 'std');
            hideHidden();
            load = true;
        });
    });

    $("#nerdzselect").on('click', function () {
        !$(this).hasClass("icon_collapse") ? $(this).attr("class", "icon_collapse") : $(this).attr("class", "icon_expand");
        $("#nerdzlist").slideToggle();
    });

    $("#projselect").on('click', function () {
        !$(this).hasClass("icon_collapse") ? $(this).attr("class", "icon_collapse") : $(this).attr("class", "icon_expand");
        $("#projlist").slideToggle();
    });

    $(".selectlang").on('click', function () {
        plist.html('<h1>' + loading + '...</h1>');
        lang = $(this).data('lang');
        localStorage.setItem("autolang", lang);
        $(".active-lang").removeClass('active-lang');
        $(this).addClass('active-lang');
        load = false;
        if (lang == 'usersifollow') {
            $("#fast_nerdz").show();
            N.html.profile.getFollowedHomePostList(0, function (data) {
                plist.html(data);
                plist.data('type', 'profile');
                plist.data('mode', 'followed');
                hideHidden();
                load = true;
            });
        } else {
            if (lang == '*') {
                $("#fast_nerdz").show();
            } else {
                $("#fast_nerdz").hide();
            }

            load = false;
            N.html.profile.getByLangHomePostList(0, lang, function (data) {
                plist.html(data);
                plist.data('mode', 'language');
                plist.data('type', 'profile');
                hideHidden();
                load = true;
            });
        }
    });

    $(".projlang").on('click', function () {
        $("#fast_nerdz").hide();
        plist.html('<h1>' + loading + '...</h1>');
        lang = $(this).data('lang');
        $(".active-plang").removeClass("active-plang")
        $(this).addClass('active-plang');
        load = false;
        if (lang == 'usersifollow') {
            N.html.project.getFollowedHomePostList(0, function (data) {
                plist.html(data);
                plist.data('type', 'project');
                plist.data('mode', 'followed');
                hideHidden();
                load = true;
            });
        } else {
            N.html.project.getByLangHomePostList(0, lang, function (data) {
                plist.html(data);
                plist.data('type', 'project');
                plist.data('mode', 'language');
                hideHidden();
                load = true;
            });
        }
    });

    $("#stdfrm").on('submit', function (e) {
        e.preventDefault();
        $("#pmessage").html(loading + '...');
        N.json.profile.newPost({
            message: $("#frmtxt").val().autoLink(),
            to: 0
        }, function (data) {
            if (data.status == 'ok') {
                $("#frmtxt").val('');
                load = false;
                if (lang == '*') {
                    N.html.profile.getByLangHomePostList(0, lang, function (data) {
                        plist.html(data);
                        plist.data('type', 'profile');
                        plist.data('mode', 'language');
                        hideHidden();
                        load = true;
                    });
                } else if (lang == 'usersifollow') {
                    N.html.profile.getFollowedHomePostList(0, function (data) {
                        plist.html(data);
                        plist.data('type', 'profile');
                        plist.data('mode', 'followed');
                        hideHidden();
                        load = true;
                    });
                } else {
                    $("#profilePostList").click();
                }
            }

            $("#pmessage").html(data.message);

            setTimeout(function () {
                $("#pmessage").html('');
            }, 5000);
        });
    });

    //default profile posts
    if (localStorage.getItem("autolang")) {
        $("#nerdzselect").click();
        var el = $("#nerdzlist").find("ul").find("[data-lang='" + localStorage.getItem("autolang") + "']");
        el.click();
        el.addClass("active-lang");
    } else {
        plist.data('location', 'home');
        load = false;
        N.html.profile.getHomePostList(0, function (data) {
            plist.html(data);
            hideHidden();
            plist.data('type', 'profile');
            plist.data('mode', 'std');
            load = true;
        });
    }
        window.addEventListener("scroll",function () {
        if ($(this).scrollTop() + 200 >= ($(document).height() - $(this).height())) {
            var num = 10; //TODO: numero di posts, parametro?
            var hpid = plist.find("div[id^='post']").last().data('hpid');
            var mode = plist.data('mode');
            var type = plist.data('type');
            var append = '<h3 id="' + tmpDivId + '">' + loading + '...</h3>';

            if ((load || ("1" == sessionStorage.getItem(sl))) && !$("#" + tmpDivId).length) {
                plist.append(append);
            }

            if (load) {
                load = false;
                if (mode == 'std') {
                    N.html[type].getHomePostListBeforeHpid(num, hpid, manageScrollResponse);
                } else if (mode == 'followed') {
                    N.html[type].getFollowedHomePostListBeforeHpid(num, hpid, manageScrollResponse);
                } else if (mode == 'language') {
                    N.html[type].getByLangHomePostListBeforeHpid(num, lang, hpid, manageScrollResponse);
                }
            }
            //a true ci va in default.js, dopo il primo search
            if (sessionStorage.getItem(sl) == "1") {
                sessionStorage.setItem(sl, "0");
                if (type == 'project' && mode == 'search') {
                    N.html.search.globalProjectPostsBeforeHpid(num, $("#footersearch input[name=q]").val(), hpid, manageScrollSearchResponse);
                } else if (type == 'profile' && mode == 'search') {
                    N.html.search.globalProfilePostsBeforeHpid(num, $("#footersearch input[name=q]").val(), hpid, manageScrollSearchResponse);
                }
            }
        }
    });

    /* Autoload vecchi post allo scrolldown */
    //questo serve per search, che avendo l'azione iniziale nel file default.js, non condivide la variabile load. Uso sessionStorage per ovviare
    var sl = 'searchLoad'; /*search label */
    sessionStorage.setItem(sl, "0");
    var tmpDivId = "scrtxt";
    var manageScrollResponse = function (data) {
        $("#" + tmpDivId).remove();
        if (data.length > 0) {
            plist.append(data);
            hideHidden();
            load = true;
            sessionStorage.setItem(sl, "0"); // se sono entrato qui, sicuramente non cerco
        }
    };

    var manageScrollSearchResponse = function (data) {
        $("#" + tmpDivId).remove();
        if (data.length > 0) {
            plist.append(data);
            hideHidden();
            sessionStorage.setItem(sl, "1");
            load = false; // se sono entrato qui, sicuramente stavo cercando
        }
    };
});
